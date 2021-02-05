const axios = require("axios");
const queryString = require("query-string");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
const { convertDayPeriodType } = require("../utils/misc");

async function getClass(classID, requestId) {
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
    ID_NO: classID,
  };
  const scrappedTable = [];
  const monday = [];
  const tuesday = [];
  const wednesday = [];
  const thursday = [];
  const friday = [];
  const getTable = await axios
    .post(
      "http://202.29.80.113/cgi/LoadTB1.php",
      queryString.stringify(requestBody)
    )
    .then((result) => {
      const $ = cheerio.load(result.data);

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
    });
  console.log(monday);
  return {
    requestId: requestId,
    monday: monday,
    tuesday: tuesday,
    wednesday: wednesday,
    thursday: thursday,
    friday: friday,
  };
}

async function getRawClassData(classId) {
  console.log("[Request_Params: %s]", classId);
  let data;
  try {
    const requestBody = {
      ID_NO: classId,
    };
    const scrappedTable = [];
    return await axios
      .post(
        "http://202.29.80.113/cgi/LoadTB1.php",

        queryString.stringify(requestBody),
        {
          timeout: 8000,
        }
      )
      .then((result) => {
        return result.data;
      });
  } catch (e) {
    return {
      errorCode: 3001,
      errorType: "ORIGIN_SERVER_TIMEOUT",
      errorMessage:
        "ระบบ API ไม่สามารถเชื่อมต่อเครื่องเซิร์ฟเวอร์แม่ข่าย / (REG_PSRU_WEBSITE) ได้.",
    };
  }
}

module.exports = {
  getClass,
  getRawClassData,
};
