const express = require("express");
const router = express.Router();
const axios = require("axios");
const queryString = require("query-string");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
const HtmlTableToJson = require("html-table-to-json");
const { json } = require("express");
const {
  Unauthorized,
  Forbidden,
  MethodNotAllowed,
  BadRequest,
} = require("http-errors");
const { checkIsAssess } = require("../service/Grade");
const { convertDayPeriodType } = require("../utils/misc");
const { body, validationResult, header } = require("express-validator");
require("dotenv").config();
/* GET home page. */

router.get("/", function (req, res, next) {
  res.send(new Forbidden());
});

router.get("/grade/:id", async (req, res) => {
  console.log(req.params);
  if (req.params.id.length < 9) {
    res.status(400).send(new Unauthorized("StudentID Length Must be equal 10"));
  } else if (req.params.id.length > 10) {
    res.status(400).send(new Unauthorized("StudentID Length Must be equal 10"));
  }
  const requestBody = {
    ID_NO: req.params.id,
  };

  if (!(await checkIsAssess(req.params.id))) {
    res.send(
      "ไม่สามารถแสดงผลการเรียนได้ เนื่องจากท่านประเมินการสอนออนไลน์ยังไม่ครบทุกรายวิชาในเทอมนี้."
    );
  }
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
      config,
      {
        timeout: 8000,
      }
    );
    res.status(200).send(iconv.decode(new Buffer(studentGrade), "TIS-620"));
  } catch (error) {
    res.status(500).send("StudentGrade Request Fail");
  }
});

router.get("/is_assess/:id", async (req, res) => {
  console.log(req.params);
  if (req.params.id.length < 9) {
    res.status(400).send(new Unauthorized("StudentID Length Must be equal 10"));
  } else if (req.params.id.length > 10) {
    res.status(400).send(new Unauthorized("StudentID Length Must be equal 10"));
  }
  res.send(await checkIsAssess(req.params.id));
});

router.get("/api/activity/:id", async (req, res) => {
  const requestBody = {
    search_val: req.params.id,
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
  axios
    .post(
      "http://202.29.80.144/activity/search_detail.php",
      queryString.stringify(requestBody),
      config
    )
    .then((result) => {
      let activityTable = [];

      const $ = cheerio.load(result.data);
      const studentYear = +req.params.id.slice(0, 2);
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

      let studentInfo = [];
      let studentActivityInfo = [];
      let activityYear1 = [];
      let activityYear2 = [];
      let activityYear3 = [];
      let activityYear4 = [];

      studentInfo.push(
        Object.assign({
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
      });
      res.send({
        studentInfo,
        studentActivityInfo,
        activityInfo: {
          activityYear1,
          activityYear2,
          activityYear3,
          activityYear4,
        },
      });
      activityYear1.length = 0;
      activityYear2.length = 0;
      activityYear3.length = 0;
      activityYear4.length = 0;

      //res.status(200).send(result.data);
    });
});
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

router.post(
  "/api/grade/",
  body("studentId").isLength({ min: 10, max: 10 }),
  body("semester").isString().isLength({ min: 6, max: 10 }),
  //body("session_key").isString(),
  header("API_KEY").isString().isLength({ min: 2, max: 100 }),

  async function (req, res) {
    const errors = validationResult(req);
    console.log(process.env.API_KEY, req.headers.api_key);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else if (req.headers.api_key != process.env.API_KEY) {
      return res
        .status(400)
        .json({ errorCode: 400, message: "API_KEY MISMATCHED" });
    }
    const { studentId, semester, apiKey } = req.body;

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
    if (!(await checkIsAssess(req.params.id))) {
      res.status(403).json({
        errorCode: 1001,
        errorMessage: "API_GRADE_ASSESS_ERROR",
        th:
          "ไม่สามารถแสดงผลการเรียนได้ เนื่องจากท่านประเมินการสอนออนไลน์ยังไม่ครบทุกรายวิชาในเทอมนี้.",
      });
    } else {
      const studentGrade = axios
        .post(
          "http://202.29.80.113/cgi/LstGrade1.pl",
          queryString.stringify(requestBody),
          config
        )
        .then((result) => {
          const html = iconv.decode(new Buffer.from(result.data), "TIS-620");
          const $ = cheerio.load(html);
          const scrappedTable = [];
          const gradeTable = $(
            "body > center > table > tbody > tr > td > font > center:nth-child(2) > table > tbody > tr > td > table > tbody > tr > td"
          ).each((index, element) => {
            scrappedTable.push($(element).text());
          });
          //   console.log(scrappedTable);
          let studentInfo = {};
          $(
            "body > center > table > tbody > tr > td > font > center:nth-child(2) > table > tbody > tr > td > font:nth-child(1) > center"
          ).each((index, element) => {
            let parseinfo = $(element).text().split(" ", 10);
            studentInfo = {
              studentId: +parseinfo[1],
              studentFirstName: parseinfo[4],
              studentLastName: parseinfo[6],
              graduatedFrom: parseinfo[8],
            };
          });
          const groupGrade = [];

          for (let i = 1; i < scrappedTable.length / 7; i++) {
            groupGrade.push(scrappedTable.slice(i * 7, i * 7 + 7));
          }
          let TotalCalculateGrade = {};
          const TotalCalculateScrapped = $(
            "body > center > table > tbody > tr > td > font > center:nth-child(2) > table > tbody > tr > td > font:nth-child(3)"
          ).each((index, element) => {
            const convertTotalCalculate = $(element).text().split(" ", 10);
            //  console.log(convertTotalCalculate);
            TotalCalculateGrade = Object.assign({
              TotalCredit: Number(convertTotalCalculate[1]),
              TotalAverageGrade: Number(convertTotalCalculate[5]),
              TotalMainSubjectGrade: Number(
                convertTotalCalculate[8].substr(0, 4)
              ),
            });
          });
          let StudentGrade = [];
          let availableSemesterData = [];
          let currentSemester = semester;
          let currentSemesterCount = 0;
          for (let j = 0; j < groupGrade.length; j++) {
            availableSemesterData.indexOf(`${groupGrade[j][0]}`) != -1
              ? null
              : availableSemesterData.push(groupGrade[j][0]);
            groupGrade[j][0] == `${semester}`
              ? (currentSemesterCount =
                  currentSemesterCount + 1 &&
                  StudentGrade.push(
                    Object.assign({
                      id: `${j}`,
                      section: groupGrade[j][1],
                      subjectCode: groupGrade[j][2],
                      subjectName: groupGrade[j][3],
                      credit: groupGrade[j][4],
                      studentGrade:
                        groupGrade[j][5] == "--" ? "N/A" : groupGrade[j][5],
                      subjectGroup: groupGrade[j][6],
                    })
                  ))
              : null;
          }

          const semesterInfo = {
            registeredCount: {
              all: groupGrade.length,
              currentSemester: currentSemesterCount,
            },
            availableSemesterData,
            requestSemester: semester,
            isAvailable: availableSemesterData.includes(semester)
              ? true
              : false,
          };
          res.send({
            requestId: `${uuidv4()}`,
            studentInfo,
            semesterInfo,
            TotalCalculateGrade,
            data: StudentGrade,
          });
        });
    }
  }
);

router.get("/api/class/:id", async function (req, res) {
  async function removeElement(array, elem) {
    var index = array.indexOf(elem);
    if (index > -1) {
      array.splice(index, 1);
    }
    return array;
  }

  console.log("[Request_Params: %s]", req.params.id);

  function filterClassDay(day) {
    switch (day) {
      case 1:
        return "จันทร์";
        break;
      case 2:
        return "อังคาร";
        break;
      case 3:
        return "พุธ";
        break;
      case 4:
        return "พฤหัสบดี";
        break;
      case 5:
        return "ศุกร์";
        break;
    }
  }

  function convertPeriod1(period1) {
    if (period1 == "") {
      return "Nodata";
    }

    switch (period1) {
      case "1":
        return "08:30";
      case "2":
        return "09:30";
      case "3":
        return "10.30";
      case "4":
        return "11:30";
      case "5":
        return "12:30";
      case "6":
        return "13:30";
      case "7":
        return "14:30";
      case "8":
        return "15:30";
      case "9":
        return "16:30";
      case "10":
        return "17:30";
    }
  }

  function convertPeriod2(period2) {
    if (period2 == "") {
      return "Nodata";
    }

    switch (period2) {
      case "1":
        return "08:30";
      case "2":
        return "09:30";
      case "3":
        return "10.30";
      case "4":
        return "11:30";
      case "5":
        return "12:30";
      case "6":
        return "13:30";
      case "7":
        return "14:30";
      case "8":
        return "15:30";
      case "9":
        return "16:30";
      case "10":
        return "17:30";
    }
  }

  let mondaytime = [];
  let tuesdaytime = [];

  function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm, " ");
  }
  const classTimeTable = [];

  function filterClassroom(data) {
    console.log(data);
    if (myTrim(data) == " " || myTrim(data) == "") {
      return "ไม่มีข้อมูลห้องเรียน";
    } else {
      return data;
    }
  }

  const requestBody = {
    ID_NO: req.params.id,
  };
  const scrappedTable = [];
  const getTable = await axios
    .post(
      "http://202.29.80.113/cgi/LoadTB1.php",
      queryString.stringify(requestBody)
    )
    .then((result) => {
      const $ = cheerio.load(result.data);

      const monday = [];
      const tuesday = [];
      const wednesday = [];
      const thursday = [];
      const friday = [];
      for (let i = 3; i < 14; i++) {
        const monday3 = $(
          `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(6)`
        ).each((index, element) => {
          if ($(element).text().trim() == "") {
            element == "null";
          } else {
            const formattedTime = `จันทร์ เวลา: ${convertPeriod1(
              $(element).text().substr(0, 1)
            )} - ${convertPeriod2($(element).text().substr(2, 3))}`;
            const startTime = $(element).text().substr(0, 1);
            const endTime = $(element).text().substr(2, 3);

            const mondaySubID = $(
              `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(1)`
            ).each((indexsubcode, elementsubcode) => {
              const mondayClassroom = $(
                ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`
              ).each((indexroom, elementroom) => {
                const mondayClass = $(
                  ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(3)`
                ).each((indexclass, elementclass) => {
                  const mondayTeacher = $(
                    ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(11)`
                  ).each((indexteacher, elementteacher) => {
                    monday.push(
                      Object.assign({
                        subjectCode: $(elementsubcode).text(),
                        subjectName: $(elementclass).text(),
                        subjectClassroom: $(elementroom).text(),
                        subjectTime: formattedTime,
                        subjectTeacher: $(elementteacher).text(),
                        subjectPeriodType: convertDayPeriodType(
                          startTime,
                          endTime
                        ),
                      })
                    );
                  });
                });
              });
            });
          }
        });

        const tuesday3 = $(
          `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(7)`
        ).each((index, element) => {
          if ($(element).text().trim() == "") {
            element == "null";
          } else {
            const formattedTime = `อังคาร เวลา: ${convertPeriod1(
              $(element).text().substr(0, 1)
            )} - ${convertPeriod2($(element).text().substr(2, 3))}`;
            const startTime = $(element).text().substr(0, 1);
            const endTime = $(element).text().substr(2, 3);
            const tuesdaySubID = $(
              `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(1)`
            ).each((indexsubcode, elementsubcode) => {
              const tuesdayClassroom = $(
                ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`
              ).each((indexroom, elementroom) => {
                const tuesdayClass = $(
                  ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(3)`
                ).each((indexclass, elementclass) => {
                  const tuesdayTeacher = $(
                    ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(11)`
                  ).each((indexteacher, elementteacher) => {
                    tuesday.push(
                      Object.assign({
                        subjectCode: $(elementsubcode).text(),
                        subjectName: $(elementclass).text(),
                        subjectClassroom: $(elementroom).text(),
                        subjectTime: formattedTime,
                        subjectTeacher: $(elementteacher).text(),
                        subjectPeriodType: convertDayPeriodType(
                          startTime,
                          endTime
                        ),
                      })
                    );
                  });
                });
              });
            });
          }
        });

        const wednesday3 = $(
          `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(8)`
        ).each((index, element) => {
          if ($(element).text().trim() == "") {
            element == "null";
          } else {
            const formattedTime = `พุธ เวลา: ${convertPeriod1(
              $(element).text().substr(0, 1)
            )} - ${convertPeriod2($(element).text().substr(2, 3))}`;
            const startTime = $(element).text().substr(0, 1);
            const endTime = $(element).text().substr(2, 3);
            const wednesdaySubID = $(
              `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(1)`
            ).each((indexsubcode, elementsubcode) => {
              const wednesdayClassroom = $(
                ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`
              ).each((indexroom, elementroom) => {
                const wednesdayClass = $(
                  ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(3)`
                ).each((indexclass, elementclass) => {
                  const wednesdayTeacher = $(
                    ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(11)`
                  ).each((indexteacher, elementteacher) => {
                    wednesday.push(
                      Object.assign({
                        subjectCode: $(elementsubcode).text(),
                        subjectName: $(elementclass).text(),
                        subjectClassroom: $(elementroom).text(),
                        subjectTime: formattedTime,
                        subjectTeacher: $(elementteacher).text(),
                        subjectPeriodType: convertDayPeriodType(
                          startTime,
                          endTime
                        ),
                      })
                    );
                  });
                });
              });
            });
          }
        });

        const thursday3 = $(
          `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(9)`
        ).each((index, element) => {
          if ($(element).text().trim() == "") {
            element == "null";
          } else {
            const formattedTime = `พฤหัสบดี เวลา: ${convertPeriod1(
              $(element).text().substr(0, 1)
            )} - ${convertPeriod2($(element).text().substr(2, 3))}`;
            const startTime = $(element).text().substr(0, 1);
            const endTime = $(element).text().substr(2, 3);
            const thursdaySubID = $(
              `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(1)`
            ).each((indexsubcode, elementsubcode) => {
              const thursdayClassroom = $(
                ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`
              ).each((indexroom, elementroom) => {
                const thursdayClass = $(
                  ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(3)`
                ).each((indexclass, elementclass) => {
                  const thursdayTeacher = $(
                    ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(11)`
                  ).each((indexteacher, elementteacher) => {
                    thursday.push(
                      Object.assign({
                        subjectCode: $(elementsubcode).text(),
                        subjectName: $(elementclass).text(),
                        subjectClassroom: $(elementroom).text(),
                        subjectTime: formattedTime,
                        subjectTeacher: $(elementteacher).text(),
                        subjectPeriodType: convertDayPeriodType(
                          startTime,
                          endTime
                        ),
                      })
                    );
                  });
                });
              });
            });
          }
        });

        const friday3 = $(
          `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(10)`
        ).each((index, element) => {
          if ($(element).text().trim() == "") {
            element == "null";
          } else {
            const formattedTime = `ศุกร์ เวลา: ${convertPeriod1(
              $(element).text().substr(0, 1)
            )} - ${convertPeriod2($(element).text().substr(2, 3))}`;
            const startTime = $(element).text().substr(0, 1);
            const endTime = $(element).text().substr(2, 3);
            const fridaySubID = $(
              `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(1)`
            ).each((indexsubcode, elementsubcode) => {
              const fridayClassroom = $(
                ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`
              ).each((indexroom, elementroom) => {
                const fridayClass = $(
                  ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(3)`
                ).each((indexclass, elementclass) => {
                  const fridayTeacher = $(
                    ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(11)`
                  ).each((indexteacher, elementteacher) => {
                    friday.push(
                      Object.assign({
                        subjectCode: $(elementsubcode).text(),
                        subjectName: $(elementclass).text(),
                        subjectClassroom: $(elementroom).text(),
                        subjectTime: formattedTime,
                        subjectTeacher: $(elementteacher).text(),
                        subjectPeriodType: convertDayPeriodType(
                          startTime,
                          endTime
                        ),
                      })
                    );
                  });
                });
              });
            });
          }
        });
      }

      res.send({
        monday: monday,
        tuesday: tuesday,
        wednesday: wednesday,
        thursday: thursday,
        friday: friday,
      });
    });
});

router.get("/class/:id", async function (req, res) {
  console.log("[Request_Params: %s]", req.params.id);

  try {
    const requestBody = {
      ID_NO: req.params.id,
    };
    const scrappedTable = [];
    const getTable = await axios
      .post(
        "http://202.29.80.113/cgi/LoadTB1.php",

        queryString.stringify(requestBody),
        {
          timeout: 8000,
        }
      )
      .then((result) => {
        res.send(result.data);
      });
  } catch (e) {
    res.json({
      errorCode: 3001,
      errorType: "ORIGIN_SERVER_TIMEOUT",
      errorMessage:
        "ระบบ API ไม่สามารถเชื่อมต่อเครื่องเซิร์ฟเวอร์แม่ข่าย / (REG_PSRU_WEBSITE) ได้.",
    });
  }
});

router.get("/api/billing", async (req, res) => {
  res.send(new MethodNotAllowed());
});

router.post("/api/billing", async (req, res) => {
  const requestBody = {
    std_id: req.body.studentId,
    std_password: req.body.studentPassword,
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

  const getStudentInfo = await axios.get(
    "https://reg3.psru.ac.th/regist1/tsc1_n1_load.php",

    {
      headers: {
        Cookie: ` datas_1=; datas_2=; datas_3=; datas_4=; datas_5=; datas_6=; datas_7=; datas_8=; datas_9=; ${cookie}`,
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

  const uniqueUrl = $("body > font > a:nth-child(16)").attr("href");

  console.log(uniqueUrl);
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
  res.send([studentBillingInfo, studentPaymentInfo]);
});
module.exports = router;
