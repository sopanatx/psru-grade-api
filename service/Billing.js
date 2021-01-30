const axios = require("axios");
const queryString = require("query-string");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
const { convertDayPeriodType } = require("../utils/misc");

async function getBilling(studentId, studentPassword, requestId) {
  const requestBody = {
    std_id: studentId,
    std_password: studentPassword,
  };
  const getCookie = await axios.post(
    "https://reg3.psru.ac.th/regist1/CheckLogin1_n1.php",

    queryString.stringify(requestBody),
    {
      timeout: 8000,
    }
  );

  let cookie;
  let session;
  cookie = getCookie.headers["set-cookie"];
  cookie = cookie[0].split(" ", 1)[0];
  console.log(cookie);
  const getStudentInfo = await axios.get(
    "https://reg3.psru.ac.th/regist1/tsc1_n1_load.php",

    {
      headers: {
        Cookie: `datas_1=; datas_2=; datas_3=; datas_4=; datas_5=; datas_6=; datas_7=; datas_8=; datas_9=; ${cookie}`,
      },
      timeout: 8000,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    }
  );
  //console.log(getStudentInfo.headers);
  const $ = cheerio.load(
    iconv.decode(new Buffer(getStudentInfo.data), "windows-874")
  );

  let studentBillingInfo = {
    studentId: $("body > font > b:nth-child(2)").text(),
    studentName: $("body > font > b:nth-child(3)").text(),
    studentCourse: $("body > font > u:nth-child(5)").text(),
    studentMajor: $("body > font > u:nth-child(5)").text(),
    studentGroup: $("body > font > u:nth-child(7)").text(),
    studentType: $("body > font > u:nth-child(9)").text(),
    isRegistered: $("body > font > font").text() ? true : false,
  };

  console.log(studentBillingInfo);
  const uniqueUrl = $("body > font > a:nth-child(16)").attr("href");

  console.log({ uniqueUrl });
  const getBillingInfo = await axios.get(
    `https://reg3.psru.ac.th/${uniqueUrl}`,

    {
      headers: {
        Cookie: ` datas_1=; datas_2=; datas_3=; datas_4=; datas_5=; datas_6=; datas_7=; datas_8=; datas_9=; ${cookie}`,
      },
      timeout: 8000,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    }
  );

  const $2 = cheerio.load(
    iconv.decode(new Buffer(getBillingInfo.data), "windows-874")
  );
  console.log(
    $2(
      "body > center > font > table > tbody > tr:nth-child(3) > td > table:nth-child(7) > tbody > tr > td > p:nth-child(2) > font > font > font:nth-child(5) > b:nth-child(1) > u"
    ).html()
  );
  let studentPaymentInfo = {
    serviceCode: $2(
      "body > center > font > table > tbody > tr:nth-child(3) > td > table:nth-child(7) > tbody > tr > td > p:nth-child(2) > font > font > font:nth-child(3) > b > u"
    ).text(),
    companyName: $2(
      "body > center > font > table > tbody > tr:nth-child(3) > td > table:nth-child(7) > tbody > tr > td > p:nth-child(2) > font > font > font:nth-child(4) > b:nth-child(1) > u"
    ).text(),
    customer: $2(
      "body > center > font > table > tbody > tr:nth-child(3) > td > table:nth-child(7) > tbody > tr > td > p:nth-child(2) > font > font > font:nth-child(4) > b:nth-child(2) > u"
    ).text(),
    ref1: $2(
      "body > center > font > table > tbody > tr:nth-child(3) > td > table:nth-child(7) > tbody > tr > td > p:nth-child(2) > font > font > font:nth-child(5) > b:nth-child(1) > u"
    ).text(),
    ref2: $2(
      "body > center > font > table > tbody > tr:nth-child(3) > td > table:nth-child(7) > tbody > tr > td > p:nth-child(2) > font > font > font:nth-child(5) > b:nth-child(2) > u"
    ).text(),
    totalAmount: $2(
      "#table3 > tbody > tr:nth-child(4) > td:nth-child(2) > font"
    ).text(),
    paymentUntil: $2(
      "body > center > font > table > tbody > tr:nth-child(3) > td > table:nth-child(7) > tbody > tr > td > p:nth-child(2) > font > font > font:nth-child(7)"
    ).text(),
  };
  return [studentBillingInfo, studentPaymentInfo];
}
module.exports = {
  getBilling,
};
