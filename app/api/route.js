//import { kv } from "@vercel/kv"
import { NextResponse } from "next/server";

const init = require("./_init.js");
const cookiesStorage = require("./db/_cookiesStorage.js");

const abort = require("./_abort");

export async function GET(request) {
  abort.setSharedValue(false);

  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");
  console.log("URL ", url);

  const { browser, page } = await init();

  let imageBase64;

  try {
    console.log("NAVIGATING TO ", url, " ...");
    await page.goto(url);

    //console.log(await page.cookies())

    console.log("CATCHING CAPTCHA IMAGE...");
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("captcha-image")) {
        const imageBuffer = await response.buffer(); // Get response content as buffer

        imageBase64 = imageBuffer.toString("base64");

        await page.screenshot({ path: "generated/captcha.png" });
      }
    });

    //to-do check if VIP only

    const selector = ".download-now";

    const downloadButton = await page.$(selector);

    console.log("DOWNLOAD BUTTON CLICK...");
    await downloadButton.click();

    console.log("WAITING NAVIGATION...");
    await page.waitForNavigation();

    try {
      console.log("WAITING FOR POPUP...");
      const closeButton = await page.waitForSelector(
        "#md-modal-verify-email-popup .md-close",
        { visibible: true, timeout: 1750 }
      );
      console.log("CLOSING POPUP...");
      await closeButton.click();
      console.log("WAITING NAVIGATION...");
      await page.waitForNavigation({ timeout: 2500 });
    } catch (e) {
      console.log("email verification popup not present");
    }

    console.log("TAKING SCREENSHOT...");
    await page.screenshot({ path: "generated/beforeCaptcha.png" });

    /* const captchaImage = await page.$$(".wrapper.group.takeover img")
		await captchaImage[0].screenshot({ path: __dirname + '/captcha.png' }); */

    try {
      const captchaInput = `input[name="captchavalue"]`;
      console.log("CHECKING IF CAPTCHA REQUEST PRESENT...");
      const captchaInputElement = await page.waitForSelector(captchaInput, {
        visible: true,
        timeout: 5555,
      });
      console.log("CAPTCHA PRESENT, RESOLVE MANUALLY");

      //check abort status
      const abort = require("./_abort");
      const abortStatus = abort.getSharedValue();
      console.log("ABORT STATUS: ", abortStatus);

      if (abortStatus) {
        console.log("ABORTING...");
        return NextResponse.json("ABORTED", { status: 500 });
      }

      abort.setSharedValue(true);

      await cookiesStorage.save(await page.cookies());

      //await kv.set("cookies", JSON.stringify(cookies))
      return NextResponse.json({ captcha: imageBase64 }, { status: 200 });
    } catch (e) {
      console.log(e);
      console.log("CAPTCHA NOT PRESENT, PROCEED TO DOWNLOAD...");
      const download = require("./_download.js");

      try {
        return NextResponse.json(await download(page), { status: 500 });
      } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
    }
  } catch (e) {
    console.log(e);

    await page.screenshot({ path: "generated/onError.png" });

    return NextResponse.json({ error }, { status: 500 });
  } finally {
    browser.close();
  }
}
