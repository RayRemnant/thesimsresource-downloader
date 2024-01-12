const init = require("../_init.js")
const backblaze = require("../storage/backblaze.js")

import { NextResponse } from "next/server";


export async function GET(request) {
	const backblazeClient = await backblaze.getUploadAuth({});


	const searchParams = request.nextUrl.searchParams
	const id = searchParams.get('id')
	const captchaValue = searchParams.get("captchaValue")


	//const { id, captchaSolution } = req.query

	console.log("REQUESTED ID: ", id)
	console.log("CAPTCHA SOLUTION: ", captchaValue)


	const { page } = await init()

	console.log(`NAVIGATING TO: https://www.thesimsresource.com/downloads/session/itemId/${id}`)
	await page.goto(`https://www.thesimsresource.com/downloads/session/itemId/${id}`);

	await backblaze.upload(
		backblazeClient,
		"troubleshoot/captchaPage.png",
		await page.screenshot({ fullPage: true })
	);

	//get ID from url

	try {
		const captchaInput = `input[name="captchavalue"]`;

		await page.type(captchaInput, captchaValue);

		//await page.screenshot({ path: __dirname + '/troubleshoot/captchaTyped.png' });

		const submitButton = await page.waitForSelector("button.input-button")
		await submitButton.click()

		//check if captcha is okay

		await page.waitForNavigation()

		return NextResponse.json({ status: 200 });
	} catch (error) {
		console.log(error)

		await backblaze.upload(
			backblazeClient,
			"troubleshoot/onError.png",
			await page.screenshot({ fullPage: true })
		);
		await page.screenshot({ path: process.cwd() + 'troubleshoot/onError.png' });

		return NextResponse.json({ error }, { status: 500 });
	}
}