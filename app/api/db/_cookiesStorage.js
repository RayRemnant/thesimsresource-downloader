const fs = require('fs').promises;

exports.get = async function get() {
	try {
		const cookies = await fs.readFile("cookies.json", 'utf8')
		console.log("COOKIES RETRIEVED: ", cookies)
		return JSON.parse(cookies)
	} catch (e) {
		return []
	}

}

exports.save = async function save(newCookies) {

	await fs.writeFile("cookies.json", JSON.stringify(newCookies))
	console.log("COOKIES SAVED: ", newCookies)
}