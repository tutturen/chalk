const puppeteer = require('puppeteer');

const USERNAME = '';
const PASSWORD = '';

async function init() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({ width: 900, height: 900 });
  await page.goto('http://iblack.sexy');

  //await page.screenshot({ path: 'screenshot.png ' });
  await page.select('select#org', 'ntnu.no');
  await page.click('#submit');

  await page.waitForSelector('#username');
  await page.type('#username', USERNAME);
  await page.type('#password', PASSWORD);
  await page.click('input.submit');

  await page.waitForSelector('#anonymous_element_8');

  console.log(await page.cookies());

  setTimeout(() => browser.close(), 10000);
  //await browser.close();
}

init()
  .then(() => {
    console.log('> Done running');
  })
  .catch(err => {
    console.log('> Error:', err);
  });
