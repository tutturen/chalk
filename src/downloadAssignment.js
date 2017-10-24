const download = require('./download');

function sleep(ms) {
  var waitTill = new Date(new Date().getTime() + ms);
  while (waitTill > new Date()) {}
}

// Assumes you are in the right page
async function downloadAssignment(page, submission) {
  await page.waitForSelector('#downloadPanelButton');
  sleep(2000);

  const link = await page.$eval('#downloadPanelButton', a => a.href);
  const cookies = await page.cookies();

  const folderPath = `./assignments/${submission.user}/${submission.itemName}`.replace(
    / /g,
    '',
  );
  const fileName = `${submission.attempt}.zip`.replace(/ /g, '');

  // Add await here?
  download(link, cookies, folderPath, fileName);
}

module.exports = downloadAssignment;
