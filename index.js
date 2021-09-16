// const axios = require('axios');
// const path = require('path');
// const https = require('https');
// const rootCas = require('ssl-root-cas').create();

// rootCas.addFile(path.resolve('path', 'intermediate.pem'));
// const httpsAgent = new https.Agent({ ca: rootCas });


// var rootCas = require('ssl-root-cas').create();
// rootCas.addFile(path.join('public', 'intermediate.pem'))

// fixes ALL https requests (whether using https directly or the request module)
// require('https').globalAgent.options.ca = rootCas;
// const express = require('express')
// const app = express()
// const cors = require("cors")
// const axios = require("axios");
// axios.get('https://hieusuper20hcm.netlify.app/')
//     .then(function (response) {
//         console.log(response);
//     })
//     .catch(function (error) {
//         console.log(error);
//     });
// const path = require("path");
// const https = require("https");
// const rootCas = require("ssl-root-cas").create();

// rootCas.addFile(path.resolve("public", "intermediate.pem"));
// const httpsAgent = new https.Agent({ ca: rootCas });
// const cheerio = require('cheerio')

const puppeteer = require('puppeteer');
const queryString = require("query-string");

console.log('server running at ')

var str = "Bùi Thế Minh Hiếu - 01/12/2000 - 1 - 0938576760";
var a = str.split("-");

let obj = { identification: "", healthInsuranceNumber: "" };

obj.fullname = a[0].trim();
var day = a[1].trim().split("/");
let birthday = new Date(`${day[1]}/${day[0]}/${day[2]}, 7:00:00`);
obj.birthday = birthday.getTime();
obj.genderId = a[2].trim();
obj.personalPhoneNumber = a[3].trim();

const filter = "?" + queryString.stringify(obj);
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true });
    const page = await browser.newPage();
    await page.goto('https://tiemchungcovid19.gov.vn/api/vaccination/public/otp-search' + filter);

    console.log(await page.title())
    await browser.close();
})();