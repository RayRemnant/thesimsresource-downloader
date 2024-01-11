const backblaze = require("./storage/backblaze.js");

//import { kv } from '@vercel/kv';
const redis = require("./_redis.js");

module.exports = async (page, res) => {
  const backblazeClient = await backblaze.getUploadAuth({});

  try {
    console.log("TAKING SCREENSHOT...");
    backblaze.upload(
      backblazeClient,
      "troubleshoot/afterCaptcha.png",
      await page.screenshot({ fullPage: true })
    );

    /* //set download directory 
        const currentDirectory = process.cwd();
        const downloadDirectory = path.join(currentDirectory, 'downloads');
        console.log(downloadDirectory) */

    let downloadFileName;
    let downloadFileBuffer;

    try {
      const cookiesPopupButton = await page.waitForSelector(".css-47sehv", {
        timeout: 6666,
      });
      await cookiesPopupButton.click();
      console.log("COOKIES POPUP CLOSED");

      backblaze.upload(
        backblazeClient,
        "troubleshoot/afterCookiesPopup.png",
        await page.screenshot({ fullPage: true })
      );
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
    backblaze.upload(
      backblazeClient,
      "troubleshoot/afterDowloadClick.png",
      await page.screenshot({ fullPage: true })
    );

    //await page.waitForNavigation()
    /* 
        console.log("TAKING SCREENSHOT...")
        backblaze.upload(
            backblazeClient,
            "troubleshoot/afterDowload.png",
            await page.screenshot({ fullPage: true })
        ); */

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

    console.log("LISTENING TO .package AND .zip RESPONSES...");
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

                //downloadFileBuffer = Buffer.from(await response.arrayBuffer())

                downloadFileBuffer = await response.text();
                downloadFileName = match[1];
                try {
                  redis.set("cookies", JSON.stringify(await page.cookies()));
                  console.log("COOKIES SAVED");
                } catch (error) {
                  console.error("COOKIES ERROR: ", error);
                }

                return {
                  downloadFileName,
                  downloadFileBuffer,
                };
                res.setHeader("Content-Type", "application/octet-stream"); // Adjust the content type as needed
                res.setHeader(
                  `Content-Disposition', 'attachment; filename="${downloadFileName}"`
                ); // Set the filename

                // Send the file buffer as the response
                res.status(200).send(downloadFileBuffer);
              }
            }
          }
        }
      } catch (e) {
        console.log("error on response: ", e);
      }
    });

    console.log("CLICKING DOWNLOAD...");
    await manualDownloadButton.click();

    console.log("TAKING SCREENSHOT...");
    backblaze.upload(
      backblazeClient,
      "troubleshoot/afterManualDownload.png",
      await page.screenshot({ fullPage: true })
    );
    //await page.waitForTimeout(10000)

    // await browser.close();

    console.log("WAIT FOR DOWNLOAD...");
    /*  setTimeout(() => {
             downloadFileName = "FAILED"
             console.log("DOWNLOAD TIMEOUT")
         }
             , 15000)
 
         while (!downloadFileName) {
 
         } */

    //save cookies for current session
  } catch (e) {
    console.log(e);
    await backblaze.upload(
      backblazeClient,
      "troubleshoot/onError.png",
      await page.screenshot({ fullPage: true })
    );
  }
};
