const axios = require('axios');
const fs = require('fs');
const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support');
const tough = require('tough-cookie');
var mkdirp = require('mkdirp');

axiosCookieJarSupport(axios);

function download(
  url,
  cookies = [],
  outputFolder = './data',
  zipName = 'lol.zip',
) {
  mkdirp(outputFolder, function(err) {
    const fullPath = outputFolder + '/' + zipName;

    if (err) {
      console.error('MAKE DIR ERROR:', err);
      return;
    }

    const cookieJar = new tough.CookieJar();
    cookies.forEach(cookie => {
      cookieJar.setCookieSync(
        `${cookie.name}=${cookie.value}; domain=${cookie.domain}`,
        'https://' + cookie.domain,
      );
    });

    return axios
      .request({
        jar: cookieJar, // tough.CookieJar or boolean
        withCredentials: true, // If true, send cookie stored in jar
        responseType: 'arraybuffer',
        url: url,
        method: 'get',
      })
      .then(result => {
        fs.writeFileSync(fullPath, result.data);
        console.log('Downloaded > ' + fullPath);
        return fullPath;
      });
  });
}

module.exports = download;
