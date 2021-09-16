const puppeteer = require('puppeteer');
require('dotenv').config();
const queryString = require("query-string")
const BootBot = require("bootbot");

const bot = new BootBot({
    accessToken:
        "EAAIA637Cv5cBAP1LEbHg8TnDCI3wVWq0Wdnx3gO6hjaCURS1lGNGC3tk5neRLJaCnqdJMgpvXaFeCT6ZBP64Ivl3aOjiaKlOilk1hkAraRpF1wsuCcWzSYS5Psg9aGw6iXxEjW1ZCOZB3AYQ1INYO3preMMc0cGDPQ7VAdAyxI4ZAR2yzZCe0",
    verifyToken: "011200",
    appSecret: "720686a5e99e63456ca462586e3dba01"
});

bot.on("message", (payload, chat) => {
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
    chat.say("Hey, user. I got your message!");
    const text = payload.message.text;
    console.log(text);
});

bot.start(process.env.PORT || 3000);