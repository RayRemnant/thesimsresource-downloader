const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// eslint-disable-next-line new-cap
puppeteer.use(StealthPlugin());

const redis = require("./_redis.js")


module.exports = async () => {

	const browser = await puppeteer.launch({
		headless: true,
		// args: ['--proxy-server=http://158.247.199.162:3128'],


	});
	const page = (await browser.pages())[0];

	const device_width = 1920;
	const device_height = 1080;

	await page.setCacheEnabled(false);
	await page.setViewport({ width: device_width, height: device_height })
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

	//page.setRequestInterception(true)

	const client = await page.target().createCDPSession();
	await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: '/tmp' })


	const cookies = await redis.get("cookies")

	//const cookies = await kv.get("cookies");

	if (cookies) {
		await page.setCookie(...cookies);
	} else {
		console.log("previous cookies not found")
	}

	return { browser, page }
}