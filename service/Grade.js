const axios = require("axios");
const queryString = require("query-string");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
async function checkIsAssess(studentId) {
  const requestBody = {
    ID_NO: studentId,
  };
  const config = {
    header: {
      Origin: "https://api.itpsru.in.th/",
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://api.itpsru.in.th/",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "th-GB,th;q=0.9,en-GB;q=0.8,en;q=0.7,th-TH;q=0.6",
    },
    responseType: "arraybuffer",
    responseEncoding: "binary",
  };

  try {
    const { data: studentGrade } = await axios.post(
      "http://202.29.80.113/cgi/LstGrade1.pl",
      queryString.stringify(requestBody),
      config
    );
    const convertText = iconv.decode(new Buffer.from(studentGrade), "TIS-620");
    const $ = cheerio.load(convertText);
    const waitingAssessMsg =
      "ท่านประเมินการสอนออนไลน์ยังไม่ครบทุกรายวิชาในเทอมนี้ กรุณาประเมินให้ครบทุกรายวิชา ท่านจึงจะสามารถดูเกรดได้ไปยังหน้าประเมินการสอนออนไลน์ คลิกที่นี่ ";
    const getWaitingMsg = $("body > span > center").text();
    console.log({ waitingAssessMsg, getWaitingMsg });
    return waitingAssessMsg != getWaitingMsg;
  } catch (error) {
    return error;
    console.log(error);
  }
}

module.exports = {
  checkIsAssess,
};
