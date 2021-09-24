const BootBot = require("bootbot");
const rp = require("request-promise");
const queryString = require("query-string");
// const QRCode = require("qrcode");

const bot = new BootBot({
    accessToken: process.env.ACCESSTOKEN,
    verifyToken: process.env.VERIFYTOKEN,
    appSecret: process.env.APPSECRET
});

const askOTP = (convo, filter) => {
    convo.ask(`Vui lòng nhập mã OTP`, (payload, convo) => {
        const otp = payload.message.text;
        convo.set("otp", otp);
        convo.set("filter", filter);
        askInfo(convo);
    });
};

const askInfo = (convo) => {
    rp({
        rejectUnauthorized: false,
        url:
            "https://tiemchungcovid19.gov.vn/api/vaccination/public/patient-vaccinated" +
            convo.get("filter") +
            "&otp=" +
            convo.get("otp")
    })
        .then(async (response) => {
            const res = JSON.parse(response);
            const qrCode = res.qrCode;
            const info = res.patientInfo;
            await convo.say(`Thông tin tiêm chủng:
- Họ và tên: ${info.fullname}
- SĐT: ${info.personalPhoneNumber}
- Nơi ở: ${info.ward},${info.district},${info.province}
${`* BẠN ĐÃ TIÊM ${info.vaccinatedInfoes.length} MŨI`}
${info.vaccinatedInfoes.map((c, index) => {
                const injectionDate = new Date(c.injectionDate);
                return `- Mũi ${index + 1}:
  + Tên vaccine: ${c.vaccineName}
  + Ngày tiêm: ${injectionDate.getDate()}/${injectionDate.getMonth() + 1
                    }/${injectionDate.getFullYear()}
  + Nơi tiêm: ${c.injectionPlace}
  + Số lô: ${c.batchNumber}
    `;
            })}
`);

            // QRCode.toDataURL(qrCode, async (err, url) => {
            //   await convo.say({
            //     attachment: "image",
            //     url: url
            //   });
            // });
        })
        .catch((err) => {
            const error = JSON.parse(err.error);
            convo.say(error.message);
        });
    convo.end();
};

const EpKieu = (text) => {
    var a = text.replace("TC:", "").split("-");
    let obj = {
        fullname: "",
        birthday: "",
        genderId: 1,
        personalPhoneNumber: "",
        identification: "",
        healthInsuranceNumber: ""
    };
    a.map((c, index) => {
        c = c.toString().trim();
        if (index == 0) {
            obj.fullname = c;
        }
        if (index == 1) {
            var day = c.split("/");
            let birthday = new Date(`${day[1]}/${day[0]}/${day[2]}, 7:00:00`);
            obj.birthday = birthday.getTime();
        }
        if (index == 2) {
            obj.genderId = c.toUpperCase() == "NAM" ? 1 : 2;
        }
        if (index == 3) {
            obj.personalPhoneNumber = c;
        }
    });

    const filter = "?" + queryString.stringify(obj);
    return filter;
};

const callRequest = (convo, filter) => {
    rp({
        rejectUnauthorized: false,
        url:
            "https://tiemchungcovid19.gov.vn/api/vaccination/public/otp-search" +
            filter
    })
        .then(function (response) {
            askOTP(convo, filter);
        })
        .catch(function (err) {
            convo.say(
                "Thông tin sai vui lòng nhập lại!"
            );
            convo.end();
        });
};

bot.hear([/.*/i], (payload, chat) => {
    const askName = (convo) => {
        convo.ask(
            `Xin chào! Bạn muốn tra cứu thông tin tiêm chủng vui lòng nhập cứu pháp sau:
TC: [HọTên]-[Ngày/Tháng/NămSinh]-[GiớiTính]-[SĐT]`,
            (payload, convo) => {
                const text = payload.message.text;
                const filter = EpKieu(text);
                callRequest(convo, filter);
            }
        );
    };
    if (payload.message.text.startsWith("TC: ")) {
        const text = payload.message.text;
        const filter = EpKieu(text);
        chat.conversation((convo) => {
            callRequest(convo, filter);
        });
    } else {
        chat.conversation((convo) => {
            askName(convo);
        });
    }
});
bot.start(4000);
