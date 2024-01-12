const { chromium } = require('playwright');
const redis = require('./_redis.js')

module.exports = async () => {
	const browser = await chromium.launch({
		headless: true,
		//args: ['--proxy-server=http://158.247.199.162:3128']
	});
	const context = await browser.newContext();

	const page = await context.newPage();

	const device_width = 1920;
	const device_height = 1080;

	//await page.setCacheEnabled(false);
	//await page.setViewportSize({ width: device_width, height: device_height });
	//await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

	const cookies = await redis.get("cookies");
	console.log(typeof cookies)

	//const cookies = await kv.get("cookies");

	if (cookies) {
		await context.addCookies(cookies);
	} else {
		console.log("previous cookies not found");
	}

	return { browser, page };
}
