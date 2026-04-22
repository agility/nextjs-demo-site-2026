"use server";
import { localizeUrl } from "@/lib/i18n/localizeUrl";
import { getDynamicPageURL } from '@agility/nextjs/node';
import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

	const searchParams = request.nextUrl.searchParams

	const slug = searchParams.get('slug');
	const ContentID = searchParams.get('ContentID');
	const locale = searchParams.get('locale') || searchParams.get('lang');

	//disable draft/preview mode
	(await draftMode()).disable()

	let path = slug || '/';
	if (locale) path = localizeUrl(path, locale);
	let url = new URL(path, request.nextUrl.origin).toString();

	if (ContentID) {
		const dynamicPath = await getDynamicPageURL({ contentID: Number(ContentID), preview: false, slug: slug || undefined });
		if (dynamicPath) {
			const localizedDynamic = locale ? localizeUrl(dynamicPath, locale) : dynamicPath;
			url = new URL(localizedDynamic, request.nextUrl.origin).toString();
		}
	}

	// Remove the preview URL param if it exists
	const urlObj = new URL(url);
	urlObj.searchParams.delete('preview');
	url = urlObj.toString();


	// Redirect to the url
	return NextResponse.redirect(url, { status: 307, headers: { "Location": url } })

}