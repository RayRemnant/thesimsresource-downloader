const cookiesStorage = require("./db/_cookiesStorage.js")
//import { kv } from '@vercel/kv';

// eslint-disable-next-line import/no-anonymous-default-export
module.exports = async (page) => {

	try {
		console.log("TAKING SCREENSHOT...");
		await page.screenshot({ path: 'generated/afterCaptcha.png' });

		/* //set download directory 
			const currentDirectory = process.cwd();
			const downloadDirectory = path.join(currentDirectory, 'downloads');
			console.log(downloadDirectory) */

		/* let downloadFileName;
		let downloadFileBuffer; */

		try {
			const cookiesPopupButton = await page.waitForSelector(".css-47sehv", {
				timeout: 6666,
			});
			await cookiesPopupButton.click();
			console.log("COOKIES POPUP CLOSED");

			await page.screenshot({ path: 'generated/afterCookiesPopup.png' });

		} catch (e) {
			console.log("COOKIES POPUP ERROR: ", e);
		}

		console.log("WAITING FOR DOWNLOAD BUTTON...");
		const downloadButton = await page.waitForSelector("a.downloader", {
			visible: true,
			timeout: 25000,
		});
		await downloadButton.click();

		console.log("TAKING SCREENSHOT...");
		await page.screenshot({ path: 'generated/afterDownloadClick.png' });


		//await page.waitForNavigation()

		console.log("WAITING FOR MANUAL DOWNLOAD BUTTON...");
		const manualDownloadButton = await page.waitForSelector(
			"a.download-manual",
			{ visible: true, timeout: 25000 }
		);

		await page.setRequestInterception(true);

		page.on("request", (req) => {
			// Allow all requests to continue, including preflight requests
			req.continue();
		});

		let responseData = {}

		console.log("LISTENING TO .package AND .zip RESPONSES...");
		const onResponse = new Promise(resolve => {

			page.on("response", async (response) => {
				//const response = await page.waitForResponse(url);

				try {
					if (response.request().method().toUpperCase() != "OPTIONS") {
						const url = response.url();
						console.log("STATUS: ", response.status());
						//console.log(url)
						if (url.includes(".package") || url.includes(".zip")) {
							// Assuming it's a .package file download
							const contentDisposition =
								response.headers()["content-disposition"];
							if (contentDisposition && response.status() == 200) {
								const match = contentDisposition.match(/filename="([^"]+)"/);
								if (match && match[1]) {
									console.log("FOUND FILENAME : " + match[1]);

									const originalRequest = await response.request();

									responseData = {
										url: originalRequest.url(),
										method: originalRequest.method(),
										headers: originalRequest.headers(),
										body: originalRequest.postData(),
									}

									resolve()

									/* const fs = require('fs/promises');
	
									// Use page.evaluate to make the request from within the page context
									const newResponse = await fetch(originalRequest.url(), {
										method: originalRequest.method(),
										headers: originalRequest.headers(),
										body: originalRequest.postData(), // Make sure to include the body for POST requests
									});
									//console.log(newResponse.headers()["content-disposition"])
	
									if (newResponse.ok) {
										try {
											let x = await newResponse.arrayBuffer()
											await fs.writeFile(match[1], Buffer.from(x));
											console.log('File written successfully');
										} catch (err) {
											console.error(err);
										}
									} */


								}
							}
						}
					}
				} catch (e) {
					console.log("error on response: ", e);
				}
			})
		})

		console.log("CLICKING DOWNLOAD...");
		await manualDownloadButton.click();
		console.log("WAIT FOR DOWNLOAD...");
		await onResponse

		try {
			const cookies = await page.cookies()

			await cookiesStorage.save(cookies)

			console.log("COOKIES SAVED");
		} catch (error) {
			console.error("COOKIES ERROR: ", error);
		}

		console.log("TAKING SCREENSHOT...");
		await page.screenshot({ path: 'generated/afterManualDownload.png' });


		return responseData

	} catch (e) {
		console.log(e);
		await page.screenshot({ path: 'generated/onError.png' });

	}
};
