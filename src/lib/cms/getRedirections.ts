import agility from '@agility/content-fetch'

import fs from 'fs/promises'

import { DateTime } from "luxon";



export interface Redirection {
	id: number
	originUrl: string
	destinationUrl: string
	statusCode: number
}

interface Redirections {
	lastAccessDate: string
	isUpToDate: boolean
	items: Redirection[]
}

export interface RedirectionsMap {
	lastAccessDate: string
	isUpToDate: boolean
	items: { [key: string]: Redirection }
}

interface Props {
	forceUpdate?: boolean
}

/**
 * Get the list of redirections, from cache if possible.
 * @param params
 * @returns
 */
export const getRedirections = async ({ forceUpdate = false }: Props): Promise<RedirectionsMap> => {


	const apiKey = process.env.AGILITY_API_FETCH_KEY

	const agilitySDK = agility.getApi({
		guid: process.env.AGILITY_GUID,
		apiKey,
		isPreview: false
	});

	//don't cache the redirections with nextjs cache - we are gonna do that manually...
	agilitySDK.config.fetchConfig = {
		next: {
			revalidate: 0,
		},
	}

	try {

		const key = 'redirections'
		const filepath = 'data/redirections.json'

		let redirectionRes: RedirectionsMap | undefined
		let fileExists = false
		try {
			await fs.access(filepath, fs.constants.F_OK)
			fileExists = true
		} catch (e) { }

		if (fileExists) {
			const redirectionStr = await fs.readFile(filepath, 'utf8')
			redirectionRes = JSON.parse(redirectionStr) as RedirectionsMap
		}

		if (!forceUpdate && redirectionRes && redirectionRes.isUpToDate) {
			//if the redirections are up to date, return them...
			return redirectionRes
		}

		const lastAccessDate: Date | null | undefined = undefined

		const redirectionsFromServer = await agilitySDK.getUrlRedirections({ lastAccessDate }) as Redirections

		//only update the cache if the server has new data, or we are forcing an update
		if (!redirectionsFromServer.isUpToDate) {

			// Convert the server redirections to a dictionary
			const redirectionsMap: RedirectionsMap = {
				lastAccessDate: redirectionsFromServer.lastAccessDate,
				isUpToDate: redirectionsFromServer.isUpToDate,
				items: {}
			}

			// Convert the server redirections list to a dictionary for fast lookups
			redirectionsFromServer.items.forEach((redirection) => {

				//massage the origin key in case the user has a leading ~/ or leading https:// absolute path
				let key = redirection.originUrl.toLowerCase()
				if (key.startsWith("~/")) key = key.substring(1)

				if (key.includes("://")) {
					const hostIndex = key.indexOf("/", key.indexOf("://") + 3)
					key = key.substring(hostIndex)
				}

				//massage the destination key in case the user has a leading ~/
				if (redirection.destinationUrl.startsWith("~/")) {
					redirection.destinationUrl = redirection.destinationUrl.substring(1)
				}

				redirectionsMap.items[key] = redirection
			});

			// Write the server redirections to the file system
			await fs.writeFile(filepath, JSON.stringify(redirectionsMap), 'utf8')

			return redirectionsMap
		}

	} catch (error) {
		console.error('Failed to fetch or cache redirections:', error);
	}

	//if we get here, there's a problem, return an empty object
	return {
		lastAccessDate: DateTime.now().toISO(),
		isUpToDate: false,
		items: {}
	}

}