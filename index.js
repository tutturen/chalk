const puppeteer = require('puppeteer');
const login = require('./src/login');
const downloadAssignment = require('./src/downloadAssignment');
const isLastAttempt = require('./src/isLastAttempt');
const shouldIgnore = require('./src/shouldIgnore');

const NEEDS_GRADING =
  'https://ntnu.blackboard.com/webapps/gradebook/do/instructor/viewNeedsGrading?sortCol=attemptDate&sortDir=ASCENDING&showAll=true&editPaging=false&course_id=_3692_1&startIndex=0';
const USERNAME = '';
const PASSWORD = '';

async function init() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1500 });

  await login(page, USERNAME, PASSWORD);

  await page.goto(NEEDS_GRADING);

  await page.waitForSelector('#listContainer_databody');

  const rows = await page.$$eval('#listContainer_databody > tr', rows =>
    rows.map((row, index) => {
      const info = {
        index,
        fullText: row.innerText.trim(),
        category: row.childNodes[1].innerText.trim(),
        itemName: row.childNodes[3].innerText.trim(),
        url: row.childNodes[5].childNodes[0].href,
        date: row.childNodes[7].innerText.trim(),
        attempt: row.childNodes[5].innerText.trim(),
        user: row.childNodes[5].innerText.split(' (')[0].trim(),
      };
      return info;
    }),
  );

  for (let row of rows) {
    if (!isLastAttempt(row)) {
      console.log('Skipping old attempt > ', row.attempt);
      continue;
    }
    if (shouldIgnore(row)) {
      console.log('Skipping project delivery >', row.attempt);
      continue;
    }
    const newTab = await browser.newPage();
    await newTab.setViewport({ width: 1500, height: 1500 });
    await newTab.goto(NEEDS_GRADING);
    await newTab.click(
      `#listContainer_databody > tr:nth-child(${row.index + 1}) > th > a`,
    );
    await downloadAssignment(newTab, row);
    await newTab.close();
  }

  await browser.close();
}

init()
  .then(() => {
    console.log('> Done running');
  })
  .catch(err => {
    console.log('> Error:', err);
  });
