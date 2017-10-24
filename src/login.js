async function login(page, username, password) {
  await page.goto('http://iblack.sexy');
  await page.select('select#org', 'ntnu.no');
  await page.click('#submit');
  await page.waitForSelector('#username');
  await page.type('#username', username);
  await page.type('#password', password);
  await page.click('input.submit');
  await page.waitForSelector('#anonymous_element_8');
}

module.exports = login;
