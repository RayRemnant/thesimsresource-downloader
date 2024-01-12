const { chromium } = require('playwright');
const backblaze = require('./storage/backblaze.js');
const redis = require('./_redis.js');
const fs = require('fs');

module.exports = async (page) => {
	const backblazeClient = await backblaze.getUploadAuth({});

	try {
		const cookies = await page.cookies();

		await redis.set('cookies', JSON.stringify(cookies));

		console.log("TAKING SCREENSHOT...");
		backblaze.upload(
			backblazeClient,
			"troubleshoot/afterCaptcha.png",
			await page.screenshot({ fullPage: true })
		);

		await page.goto('https://www.example.com/download');

		console.log("WAITING FOR COOKIES POPUP...");
		const cookiesPopupButton = await page.waitForSelector('.css-47sehv', {
			timeout: 6666,
		});

		await cookiesPopupButton.click();
		console.log("COOKIES POPUP CLOSED");

		console.log("TAKING SCREENSHOT...");
		backblaze.upload(
			backblazeClient,
			"troubleshoot/afterCookiesPopup.png",
			await page.screenshot({ fullPage: true })
		);

		console.log("WAITING FOR DOWNLOAD BUTTON...");
		const downloadButton = await page.waitForSelector('a.downloader', {
			visible: true,
			timeout: 25000,
		});

		await page.waitForSelector('a.download-manual');

		console.log("CLICKING DOWNLOAD...");
		await downloadButton.click();

		console.log("WAITING FOR DOWNLOAD...");
		const downloadFile = await page.waitForSelector('a.download-manual');
		await downloadFile.click();
		const downloadFileName = await downloadFile.evaluate(() => {
			const fileNameNode = document.getElementById('fileName');
			return fileNameNode.textContent;
		});
		const downloadFileBuffer = await page.evaluate(() => {
			return new Uint8Array(document.getElementById('download-blob').files[0].buffer);
		});

		console.log("DOWNLOADED FILE: " + downloadFileName);

		await fs.writeFileSync(`./downloads/${downloadFileName}`, downloadFileBuffer);
		console.log("FILE SAVED");

		await redis.set("cookies", JSON.stringify(await page.cookies()));
		console.log("COOKIES SAVED");
	} catch (e) {
		console.log(e);
		await backblaze.upload(
			backblazeClient,
			"troubleshoot/onError.png",
			await page.screenshot({ fullPage: true })
		);
	}
};
