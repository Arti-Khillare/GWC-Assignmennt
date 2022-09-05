const { response } = require('express');
const express = require('express');
const app = express();
const port = 3000;
const fs = require("fs");
const puppeteer = require("puppeteer");
app.use(express.json());

app.get('/', (req,res) => {
    res.send("Hello API")
})

app.get('/downloadimage', async (request, response) => {
  try {
    const queryImage = request.query.image
    console.log(request)
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const pageURL = "https://www.growpital.com";
    

    let counter = 0;
    page.on("response", async (response) => {
        const matches = /.*\.(jpg|png|svg|gif)$/.exec(response.url());

        const folderName = `${pageURL.split("/")[2]}`;
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
    await browser.close();
    response.send()
    }
    catch (err) {
        res.send({ msg: 'invalid command', error: err })
    }
});

app.listen(port, () => console.log(`server is listening on port ${port}!`))
