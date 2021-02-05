const axios = require("axios");
const queryString = require("query-string");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
async function getActivity(studentId, requestId) {
  let data = {};
  let studentInfo = [];
  let studentActivityInfo = [];
  let activityYear1 = [];
  let activityYear2 = [];
  let activityYear3 = [];
  let activityYear4 = [];
  const requestBody = {
    search_val: studentId,
  };
  const config = {
    header: {
      Origin: "https://api.itpsru.in.th/",
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://api.itpsru.in.th/",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "th-GB,th;q=0.9,en-GB;q=0.8,en;q=0.7,th-TH;q=0.6",
    },
  };
  const result = await axios
    .post(
      "http://202.29.80.144/activity/search_detail.php",
      queryString.stringify(requestBody),
      config
    )
    .then((result) => {
      let activityTable = [];

      const $ = cheerio.load(result.data);
      const studentYear = +studentId.slice(0, 2);
      let d = new Date();
      let currentYear = +d.getFullYear().toString().slice(0, 2) + 43;
      let loopCount = currentYear - studentYear + 1;
      console.log({ loopCount });
      // switch()
      const rowCount1 =
        $("#tab1 > p > strong > span > table > tbody > tr").length - 1;
      const rowCount2 =
        $("#tab2 > p > strong > span > table > tbody > tr").length - 1;
      const rowCount3 =
        $("#tab3 > p > strong > span > table > tbody > tr").length - 1;
      const rowCount4 =
        $("#tab4 > p > strong > span > table > tbody > tr").length - 1;

      studentInfo.push(
        Object.assign({
          studentId,
          studentFullName: $(`body > strong > font > font:nth-child(1)`).text(),
          studentFaculty: $(`body > strong > font > font:nth-child(2)`).text(),
          studentMajor: $(`body > strong > font > font:nth-child(3)`).text(),
        })
      );
      console.log({ rowCount1, rowCount2, rowCount3, rowCount4 });

      switch (loopCount) {
        case 4:
          for (let i = 1; i <= rowCount4; i++) {
            activityYear1.push(
              Object.assign({
                activityId: i,
                activityName: $(
                  `#tab4 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab4 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab4 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }

          for (let j = 1; j <= rowCount3; j++) {
            activityYear2.push(
              Object.assign({
                activityId: j,
                activityName: $(
                  `#tab3 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab3 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab3 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }
          for (let k = 1; k <= rowCount2; k++) {
            activityYear3.push(
              Object.assign({
                activityId: k,
                activityName: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    k + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    k + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    k + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }

          for (let l = 1; l <= rowCount1; l++) {
            activityYear4.push(
              Object.assign({
                activityId: l,
                activityName: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    l + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    l + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    l + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }
        case 3:
          for (let i = 1; i <= rowCount3; i++) {
            activityYear1.push(
              Object.assign({
                activityId: i,
                activityName: $(
                  `#tab3 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab3 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab3 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }
          for (let j = 1; j <= rowCount2; j++) {
            activityYear2.push(
              Object.assign({
                activityId: j,
                activityName: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }

          //3
          for (let k = 1; k <= rowCount1; k++) {
            activityYear3.push(
              Object.assign({
                activityId: k,
                activityName: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    k + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    k + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    k + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }
          break;
        case 2:
          for (let i = 1; i <= rowCount2; i++) {
            activityYear1.push(
              Object.assign({
                activityId: i,
                activityName: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab2 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }
          for (let j = 1; j <= rowCount1; j++) {
            activityYear2.push(
              Object.assign({
                activityId: j,
                activityName: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    j + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }
          break;
        case 1:
          for (let i = 1; i <= rowCount1; i++) {
            activityYear1.push(
              Object.assign({
                activityId: i,
                activityName: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > th:nth-child(2)`
                )
                  .text()
                  .substr(16, 70),
                //
                activityDate: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > td:nth-child(4) > font > b`
                ).text(),
                activityStatus: $(
                  `#tab1 > p > strong > span > table > tbody > tr:nth-child(${
                    i + 1
                  }) > td:nth-child(5) > center > strong > font`
                )
                  .text()
                  .trim(),
              })
            );
          }
          break;
      }
      //console.log(activityYear1);
      studentActivityInfo.push({
        needJoined:
          +activityYear1.length +
          +activityYear2.length +
          +activityYear3.length +
          +activityYear4.length,
        hasJoined: 0,
      });

      // activityYear1.length = 0;
      // activityYear2.length = 0;
      // activityYear3.length = 0;
      // activityYear4.length = 0;
      return {
        requestId,
        studentInfo,
        studentActivityInfo,
        activityInfo: {
          activityYear1,
          activityYear2,
          activityYear3,
          activityYear4,
        },
      };
    });

  return result;
}
module.exports = {
  getActivity,
};
