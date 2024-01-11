const init = require("../_init.js")
const download = require("../_download.js")


export async function GET(request) {

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const captchaSolution = searchParams.get("captchaSolution")


    //const { id, captchaSolution } = req.query

    console.log("REQUESTED ID: ", id)
    console.log("CAPTCHA SOLUTION: ", captchaSolution)


    const { page } = await init()

    console.log(`NAVIGATING TO: https://www.thesimsresource.com/downloads/session/itemId/${id}`)
    await page.goto(`https://www.thesimsresource.com/downloads/session/itemId/${id}`);

    //get ID from url


    try {
        const captchaInput = `input[name="captchavalue"]`;

        await page.type(captchaInput, captchaSolution);

        //await page.screenshot({ path: __dirname + '/troubleshoot/captchaTyped.png' });

        const submitButton = await page.waitForSelector("button.input-button")
        await submitButton.click()

        //check if captcha is okay

        await page.waitForNavigation()

        return download(page)
    } catch (e) {
        console.log(e)
        await page.screenshot({ path: __dirname + 'troubleshoot/onError.png' });

    }
}