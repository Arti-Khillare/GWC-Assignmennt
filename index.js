const { response } = require("express");
const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const puppeteer = require("puppeteer");
const AdmZip = require("adm-zip");
app.use(express.json());

/**
 * Request for First time loading HTML Pages
 */
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


/**
 * Main Executing API which takes url, grabs the images zips them and makes available for download
 */
app.get("/downloadimage", async (request, response) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const pageURL = request.query.url;

    let counter = 0;
    const folderName = `${pageURL.split("/")[2]}`;
    page.on("response", async (response) => {
      const matches = /.*\.(jpg|png|svg|gif)$/.exec(response.url());

      if (matches && matches.length === 2) {
        const array = matches[0].split("/");
        const imageName = array[array.length - 1];
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
        }
        const buffer = await response.buffer();
        if (!fs.existsSync(`${folderName}/${imageName}`)) {
          fs.writeFileSync(`${folderName}/${imageName}`, buffer, "base64");
        }
        counter += 1;
      }
    });

    await page.goto(pageURL, { timeout: 0 });
    createzip(`${folderName}.zip`, folderName).then((data) => {
      console.log("see data:-", data);
    });

    await browser.close();
    response.download(`${folderName}.zip`);
  } catch (err) {
    response.send({ msg: "invalid command", error: err });
  }
});

/**
 * Function to zip Folder
 * @param {*} fileName 
 * @param {*} folderPath 
 * @returns 
 */
function createzip(fileName, folderPath) {
  return new Promise((resolve, reject) => {
    const zip = new AdmZip();
    zip.addLocalFolder(folderPath);
    zip.writeZip(fileName);
    return resolve("done");
  });
}

app.listen(port, () => console.log(`server is listening on port ${port}!`))
