const fs = require('fs');
const puppeteer = require('puppeteer');


(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let counter = 0;
  page.on('response', async (response) => {
    const matches = /.*\.(jpg|png|svg|gif)$/.exec(response.url());
    console.log(matches);
    if (matches && (matches.length === 2)) {
      const extension = matches[1];
      const buffer = await response.buffer();
      fs.writeFileSync(`images/image-${counter}.${extension}`, buffer, 'base64');
      counter += 1;
    }
  });

  //await page.goto('https://www.bannerbear.com/solutions/automate-your-marketing/');
  //await page.goto('https://www.growpital.com', {timeout: 0});
    await page.goto('https://unsplash.com/s/photos/the-source')

  await browser.close();
})();