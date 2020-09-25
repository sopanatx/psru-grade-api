var express = require("express");
var router = express.Router();
const getGrade = require("../service/getGrade");
const axios = require("axios");
const queryString = require("query-string");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
const HtmlTableToJson = require("html-table-to-json");
const { json } = require("express");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    title: "Express",
  });
});

router.get("/grade/:id", function (req, res) {
  console.log(req.params);
  const requestBody = {
    ID_NO: req.params.id,
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

  const studentGrade = axios
    .post(
      "http://202.29.80.113/cgi/LstGrade1.pl",
      queryString.stringify(requestBody),
      config
    )
    .then((result) => {
      res.status(200).send(iconv.decode(new Buffer(result.data), "TIS-620"));
    });
});

router.get("/activity/:id", function (req, res) {
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
      res.status(200).send(result.data);
    });
});

router.get("/api/grade/:id", async function (req, res) {
  console.log(req.params);
  const requestBody = {
    ID_NO: req.params.id,
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
      console.log(scrappedTable);
      const studentInfo = [];
      $(
        "body > center > table > tbody > tr > td > font > center:nth-child(2) > table > tbody > tr > td > font:nth-child(1) > center"
      ).each((index, element) => {
        let parseinfo = $(element).text().split(" ", 10);
        studentInfo.push(
          Object.assign({
            studentId: parseinfo[1],
            studentFirstName: parseinfo[4],
            studentLastName: parseinfo[6],
            graduatedFrom: parseinfo[8],
          })
        );
      });
      const GroupGrade = [];

      for (let i = 1; i < scrappedTable.length / 7; i++) {
        GroupGrade.push(scrappedTable.slice(i * 7, i * 7 + 7));
      }

      //console.log('GroupGrade Length: ', GroupGrade.length);
      //console.log(JSON.stringify(Object.assign({}, GroupGrade)));
      let StudentGrade = [];
      for (let j = 0; j < GroupGrade.length; j++) {
        StudentGrade.push(
          Object.assign({
            term: GroupGrade[j][0],
            section: GroupGrade[j][1],
            subjectCode: GroupGrade[j][2],
            subjectName: GroupGrade[j][3],
            credit: GroupGrade[j][4],
            studentGrade: GroupGrade[j][5],
            subjectGroup: GroupGrade[j][6],
          })
        );
      }

      res.send({
        studentInfo,
        StudentGrade,
      });
    });
});

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
      for (let i = 3; i < 14; i++) {
        const monday3 = $(
          `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(6)`
        ).each((index, element) => {
          if ($(element).text().trim() == "") {
            element == "null";
          } else {
            const formattedTime = `จันทร์ ${convertPeriod1(
              $(element).text().substr(0, 1)
            )} - ${convertPeriod2($(element).text().substr(2, 3))}`;
            console.log();

            const mondaySubID = $(
              `body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(1)`
            ).each((indexsubcode, elementsubcode) => {
              const mondayClassroom = $(
                ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(5)`
              ).each((indexroom, elementroom) => {
                const mondayClass = $(
                  ` body > center > table > tbody > tr:nth-child(${i}) > td:nth-child(3)`
                ).each((indexclass, elementclass) =>
                  //  console.log('Element Subject: %s  Element Time: %s Element SubjectName: %s  Element Classroom : %s', $(elementsubcode).text(), formattedTime, $(elementclass).text(), $(elementroom).text())
                  monday.push(
                    Object.assign({
                      subjectCode: $(elementsubcode).text(),
                      subjectName: $(elementclass).text(),
                      subjectClassroom: $(elementroom).text(),
                      subjectTime: formattedTime,
                    })
                  )
                );
              });
            });
          }
        });
      }

      //send data to user
      res.send({
        monday: monday,
      });
    });
});

router.get("/class/:id", async function (req, res) {
  console.log("[Request_Params: %s]", req.params.id);

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
      res.send(result.data);
    });
});
module.exports = router;
