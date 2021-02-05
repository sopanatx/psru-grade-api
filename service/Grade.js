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
    // console.log({ waitingAssessMsg, getWaitingMsg });
    return waitingAssessMsg != getWaitingMsg;
  } catch (error) {
    return error;
    console.log(error);
  }
}

async function getGrade(studentId, semester, requestId) {
  var data = {};
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
  if (!(await checkIsAssess(studentId))) {
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
          let parseinfo = $(element).text().split(" ", 20);
          studentInfo = {
            studentId: +parseinfo[1],
            studentFirstName: parseinfo[4],
            studentLastName: parseinfo[6],
            graduatedFrom: parseinfo[8],
            enrollYear: parseinfo[13],
            major: parseinfo[17],
            studentGroup: +parseinfo[19],
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
                    id: `${j + 1}`,
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
          isAvailable: availableSemesterData.includes(semester) ? true : false,
        };
        return {
          requestId: requestId,
          updatedAt: Date.now(),
          studentInfo,
          semesterInfo,
          TotalCalculateGrade,
          data: StudentGrade,
        };
      });
    // console.log(await studentGrade);
    return await studentGrade;
  }
}

async function getSemseter(studentId, requestId) {
  var data = {};
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
  if (!(await checkIsAssess(studentId))) {
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
          let parseinfo = $(element).text().split(" ", 20);
          studentInfo = {
            studentId: +parseinfo[1],
            studentFirstName: parseinfo[4],
            studentLastName: parseinfo[6],
            graduatedFrom: parseinfo[8],
            enrollYear: parseinfo[13],
            major: parseinfo[17],
            studentGroup: +parseinfo[19],
          };
        });
        const groupGrade = [];

        for (let i = 1; i < scrappedTable.length / 7; i++) {
          groupGrade.push(scrappedTable.slice(i * 7, i * 7 + 7));
        }

        let availableSemesterData = [];
        const semesterInfo = {
          availableSemesterData,
        };

        for (let j = 0; j < groupGrade.length; j++) {
          availableSemesterData.indexOf(`${groupGrade[j][0]}`) != -1
            ? null
            : availableSemesterData.push(groupGrade[j][0]);
        }

        return {
          requestId: requestId,
          studentId,
          semesterCount: availableSemesterData.length,
          semesterInfo,
        };
      });
    // console.log(await studentGrade);
    return await studentGrade;
  }
}

module.exports = {
  checkIsAssess,
  getGrade,
  getSemseter,
};
