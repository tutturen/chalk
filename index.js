const puppeteer = require('puppeteer');
const downloadAssignment = require('./src/downloadAssignment');
const jsonfile = require('jsonfile');

const JSON_FILE = './data.json';

const USERNAME = '';
const PASSWORD = '';

async function readJsonAsync(path) {
  try {
    return new Promise((resolve, reject) => {
      jsonfile.readFile(path, (err, obj) => {
        if (err) {
          return Promise.resolve({});
        }
        resolve(obj);
      });
    });
  } catch (e) {
    return Promise.resolve({});
  }
}

async function writeJsonAsync(path, data) {
  return new Promise((resolve, reject) => {
    jsonfile.writeFile(path, data, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function isLastAttempt(row) {
  if (!row.attempt.includes('(Attempt')) {
    return true;
  }

  const nr = row.attempt.split('(Attempt ')[1].split(' of')[0];
  const total = row.attempt.split(' of ')[1].split(')')[0];
  console.log(nr, total);
  return nr === total;
}

function shouldIgnore(row) {
  if (row.itemName.includes('P0 Getting')) {
    return true;
  }
  if (row.itemName.includes('P2') || row.itemName.includes('P3')) {
    return true;
  }
  return false;
}

async function init() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setViewport({ width: 1500, height: 1500 });
  await page.goto('http://iblack.sexy');

  //await page.screenshot({ path: 'screenshot.png ' });
  await page.select('select#org', 'ntnu.no');
  await page.click('#submit');

  await page.waitForSelector('#username');
  await page.type('#username', USERNAME);
  await page.type('#password', PASSWORD);
  await page.click('input.submit');

  await page.waitForSelector('#anonymous_element_8');

  await page.goto(
    'https://ntnu.blackboard.com/webapps/gradebook/do/instructor/viewNeedsGrading?sortCol=attemptDate&sortDir=ASCENDING&showAll=true&editPaging=false&course_id=_3692_1&startIndex=0',
  );

  await page.waitForSelector('#listContainer_databody');

  const rows = await page.$$eval('#listContainer_databody > tr', rows =>
    rows.map((row, index) => {
      // Check if we got this
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
    if (!isLastAttempt(row) || shouldIgnore(row)) {
      console.log('Skipping', row.attempt);
      continue;
    }
    var data = await readJsonAsync(JSON_FILE);
    const userKey = row.user.replace(/ /g, '');
    const gotUser = userKey in data;
    console.log(userKey, gotUser);

    // download
    // save the new entry
    data[userKey] = data[userKey] || {};
    data[userKey][row.itemName] = data[userKey][row.itemName] || {};

    // Save this attemptDate
    /*if (
      !data[userKey][row.itemName][row.attempt] in data[userKey][row.itemName]
    ) {*/
    // We havent got this already
    const newTab = await browser.newPage();
    await newTab.setViewport({ width: 1500, height: 1500 });
    await newTab.goto(
      'https://ntnu.blackboard.com/webapps/gradebook/do/instructor/viewNeedsGrading?sortCol=attemptDate&sortDir=ASCENDING&showAll=true&editPaging=false&course_id=_3692_1&startIndex=0',
    );
    // Find the element
    await newTab.click(
      `#listContainer_databody > tr:nth-child(${row.index + 1}) > th > a`,
    );
    await downloadAssignment(newTab, row);
    newTab.close();
    data[userKey][row.itemName][row.attempt] = row;
    //}

    await writeJsonAsync(JSON_FILE, data);
  }

  /*for (let row of rows) {
    console.log('Downloading >', row.itemName, row.user);
    await downloadAssignment(page, row);
  }*/

  setTimeout(() => browser.close(), 100000);
  //await browser.close();
}

init()
  .then(() => {
    console.log('> Done running');
  })
  .catch(err => {
    console.log('> Error:', err);
  });
