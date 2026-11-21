import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Agility signs webhooks when "Enable secure delivery" is ticked on the webhook.
 * The scheme is Standard Webhooks (https://www.standardwebhooks.com):
 *
 *   webhook-id         unique message id
 *   webhook-timestamp  unix seconds
 *   webhook-signature  space-separated "v1,<base64 HMAC-SHA256>" entries
 *
 * The HMAC is over `${id}.${timestamp}.${rawBody}`, keyed with the secret's
 * base64 part (after "whsec_"). Several signatures are sent while a secret is
 * being rolled; any one matching is enough. Timestamps older or newer than five
 * minutes are rejected, which stops a captured request being replayed later.
 *
 * Implemented with node:crypto rather than the `standardwebhooks` package to keep
 * the dependency tree unchanged; it is tested against that package's output.
 */
const TOLERANCE_SECONDS = 5 * 60

export const verifyWebhookSignature = ({
	secret,
	id,
	timestamp,
	signature,
	body,
	nowSeconds = Math.floor(Date.now() / 1000),
}: {
	secret: string
	id: string
	timestamp: string
	signature: string
	body: string
	nowSeconds?: number
}): boolean => {
	if (!id || !timestamp || !signature) return false

	const ts = Number(timestamp)
	if (!Number.isInteger(ts) || Math.abs(nowSeconds - ts) > TOLERANCE_SECONDS) return false

	const key = Buffer.from(secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret, "base64")
	const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest()

	return signature.split(" ").some((entry) => {
		const [version, value] = entry.split(",")
		if (version !== "v1" || !value) return false
		const given = Buffer.from(value, "base64")
		return given.length === expected.length && timingSafeEqual(given, expected)
	})
}

/**
 * Read an Agility webhook request, verifying its signature when a secret is set.
 *
 * Each webhook has its own `whsec_…` secret, so each route names its own env var.
 * Unset = unsigned requests are accepted (so this can ship before secure delivery
 * is switched on in Agility); set = every request must carry a valid signature.
 * On failure, return `response` as-is: Agility shows the 401 in the webhook's
 * Delivery History.
 */
export async function readAgilityWebhook<T>(
	req: Request,
	secretEnvName: string,
): Promise<{ ok: true; body: T } | { ok: false; response: Response }> {
	const rawBody = await req.text()
	const secret = process.env[secretEnvName]

	if (secret) {
		const valid = verifyWebhookSignature({
			secret,
			id: req.headers.get("webhook-id") ?? "",
			timestamp: req.headers.get("webhook-timestamp") ?? "",
			signature: req.headers.get("webhook-signature") ?? "",
			body: rawBody,
		})
		if (!valid) {
			console.warn(`readAgilityWebhook: rejected ${req.headers.get("webhook-id") ?? "(no id)"}`)
			return { ok: false, response: new Response("Invalid signature", { status: 401 }) }
		}
	}

	try {
		return { ok: true, body: JSON.parse(rawBody) as T }
	} catch {
		return { ok: false, response: new Response("Invalid JSON", { status: 400 }) }
	}
}
