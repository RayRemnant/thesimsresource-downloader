const fs = require('fs').promises;

exports.get = async function get() {
	try {
		const cookies = await fs.readFile("generated/cookies.json", 'utf8')
		console.log("COOKIES RETRIEVED: ")
		return JSON.parse(cookies)
	} catch (e) {
		return []
	}

}

exports.save = async function save(newCookies) {

	await fs.writeFile("generated/cookies.json", JSON.stringify(newCookies))
	console.log("COOKIES SAVED: ")
}

exports.delete = async function del() {

	await fs.writeFile("generated/cookies.json", "")
	console.log("COOKIES DELETED")
}