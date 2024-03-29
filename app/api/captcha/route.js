const init = require("../_init.js");

import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const captchaValue = searchParams.get("captchaValue");

  //const { id, captchaSolution } = req.query

  console.log("REQUESTED ID: ", id);
  console.log("CAPTCHA SOLUTION: ", captchaValue);

  const { page } = await init();

  console.log(
    `NAVIGATING TO: https://www.thesimsresource.com/downloads/session/itemId/${id}`
  );
  await page.goto(
    `https://www.thesimsresource.com/downloads/session/itemId/${id}`
  );

  await page.screenshot({ path: "generated/captchaPage.png" });

  //get ID from url

  try {
    const captchaInput = `input[name="captchavalue"]`;

    await page.type(captchaInput, captchaValue);
    await page.screenshot({ path: "generated/afterTyping.png" });

    //await page.screenshot({ path: __dirname + '/troubleshoot/captchaTyped.png' });

    const submitButton = await page.waitForSelector("button.input-button");
    console.log("CLICKING SUBMIT...");
    await submitButton.click();

    //check if captcha is okay

    console.log("WAITING FOR NAVIGATION...");
    //await page.waitForNavigation();

    //if we are still on the same page, captcha is wrong

    try {
      await page.waitForSelector("button.input-button", {
        visible: true,
        timeout: 1111,
      });
      console.log("CAPTCHA ERROR");
      return NextResponse.json({ error }, { status: 422 });
    } catch (e) {
      console.log("CAPTCHA OK");

      return NextResponse.json({ status: 200 });
    }
  } catch (error) {
    console.log(error);

    await page.screenshot({ path: "generated/onError.png" });

    return NextResponse.json({ error }, { status: 500 });
  }
}
