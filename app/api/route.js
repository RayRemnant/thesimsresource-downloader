const { chromium } = require('playwright');
const redis = require('./_redis.js')
const init = require('./_init.js')
const backblaze = require('./storage/backblaze.js')

const _download = require('./_download.js');

export async function GET(request) {

	const { browser, page } = await init()

	const searchParams = request.nextUrl.searchParams;
	const url = searchParams.get('url');
	console.log("URL ", url);

	const backblazeClient = await backblaze.getUploadAuth({});

	try {
		console.log("NAVIGATING TO ", url, " ...")
		await page.goto(url);

		// Get the entire page content
		const pageContent = await page.content();
		console.log(pageContent);
		return

		//console.log(await page.cookies())

		console.log("CATCHING CAPTCHA IMAGE...")
		page.on('response', async (response) => {
			const url = response.url();
			if (url.includes('captcha-image')) {
				const imageBuffer = await response.buffer(); // Get response content as buffer

				backblaze.upload(
					backblazeClient,
					"captcha.png",
					imageBuffer
				);
			}
		});

		await page.waitForSelector('.download-now');
		console.log("DOWNLOAD BUTTON CLICK...")
		await page.click('.download-now');

		await page.waitForSelector('#md-modal-verify-email-popup .md-close');
		await page.click('#md-modal-verify-email-popup .md-close');

		try {
			console.log("WAITING FOR POPUP...")
			const closeButton = await page.waitForSelector("#md-modal-verify-email-popup .md-close", { visibible: true, timeout: 1750 })
			console.log("CLOSING POPUP...")
			await closeButton.click();
			console.log("WAITING NAVIGATION...")
			await page.waitForNavigation({ timeout: 2500 })
		} catch (e) {
			console.log("email verification popup not present")
		}

		console.log("TAKING SCREENSHOT...")
		backblaze.upload(
			backblazeClient,
			"troubleshoot/beforeCaptcha.png",
			await page.screenshot({ fullPage: true })
		);

		/* const captchaImage = await page.$$(".wrapper.group.takeover img")
				await captchaImage[0].screenshot({ path: __dirname + '/captcha.png' }); */


		try {
			const captchaInput = `input[name="captchavalue"]`;
			await page.waitForSelector(captchaInput);
			if (await page.evaluate(() => document.querySelector(captchaInput).value)) {
				const cookies = await page.cookies();

				await redis.set('cookies', JSON.stringify(cookies));

				return NextResponse.json({ captcha: true }, { status: 200 });

			}
		}
		catch (e) {
			console.log(e)
			console.log("CAPTCHA NOT PRESENT, PROCEED TO DOWNLOAD...")
			const download = require("./_download.js")

			return download(page)
		}



	} catch (e) {
		console.log(e);

		backblaze.upload(backblazeClient, "troubleshoot/onError.png", await page.screenshot({ fullPage: true }));
	} finally {
		await browser.close();
	}
};
