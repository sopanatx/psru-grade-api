var express = require("express");
var router = express.Router();
const getGrade = require("../service/getGrade");
const axios = require("axios");
const queryString = require("query-string");
const iconv = require("iconv-lite");
const cheerio = require("cheerio");
const HtmlTableToJson = require("html-table-to-json");
const {
  json
} = require("express");
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
      function filterInput(data) {
        if (data == null) {
          return "null";
        } else {
          return data;
        }
      }

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

      let mondaytime = []
      let tuesdaytime = []

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
      const $ = cheerio.load(result.data);
      const subjectCode = [];
      const subjectSection = [];
      const subjectTable3 = $(
        `body > center > table > tbody > tr:nth-child(3) > td:nth-child(1)`
      );
      const subjectTable4 = $(
        `body > center > table > tbody > tr:nth-child(4) > td:nth-child(1)`
      );
      const subjectTable5 = $(
        `body > center > table > tbody > tr:nth-child(5) > td:nth-child(1)`
      );
      const subjectTable6 = $(
        `body > center > table > tbody > tr:nth-child(6) > td:nth-child(1)`
      );
      const subjectTable7 = $(
        `body > center > table > tbody > tr:nth-child(7) > td:nth-child(1)`
      );
      const subjectTable8 = $(
        `body > center > table > tbody > tr:nth-child(8) > td:nth-child(1)`
      );
      const subjectTable9 = $(
        `body > center > table > tbody > tr:nth-child(9) > td:nth-child(1)`
      );
      const subjectTable10 = $(
        `body > center > table > tbody > tr:nth-child(10) > td:nth-child(1)`
      );
      const subjectTable11 = $(
        `body > center > table > tbody > tr:nth-child(11) > td:nth-child(1)`
      );
      const subjectTable12 = $(
        `body > center > table > tbody > tr:nth-child(12) > td:nth-child(1)`
      );
      const subjectTable13 = $(
        `body > center > table > tbody > tr:nth-child(13) > td:nth-child(1)`
      );
      const subjectTable14 = $(
        `body > center > table > tbody > tr:nth-child(14) > td:nth-child(1)`
      );

      subjectCode.push(
        $(subjectTable3).text(),
        $(subjectTable4).text(),
        $(subjectTable5).text(),
        $(subjectTable6).text(),
        $(subjectTable7).text(),
        $(subjectTable8).text(),
        $(subjectTable9).text(),
        $(subjectTable10).text(),
        $(subjectTable11).text(),
        $(subjectTable12).text(),
        $(subjectTable13).text(),
        $(subjectTable14).text()
      );
      const subjectSection3 = $(
        `body > center > table > tbody > tr:nth-child(3) > td:nth-child(2)`
      );
      const subjectSection4 = $(
        `body > center > table > tbody > tr:nth-child(4) > td:nth-child(2)`
      );
      const subjectSection5 = $(
        `body > center > table > tbody > tr:nth-child(5) > td:nth-child(2)`
      );
      const subjectSection6 = $(
        `body > center > table > tbody > tr:nth-child(6) > td:nth-child(2)`
      );
      const subjectSection7 = $(
        `body > center > table > tbody > tr:nth-child(7) > td:nth-child(2)`
      );
      const subjectSection8 = $(
        `body > center > table > tbody > tr:nth-child(8) > td:nth-child(2)`
      );
      const subjectSection9 = $(
        `body > center > table > tbody > tr:nth-child(9) > td:nth-child(2)`
      );
      const subjectSection10 = $(
        `body > center > table > tbody > tr:nth-child(10) > td:nth-child(2)`
      );
      const subjectSection11 = $(
        `body > center > table > tbody > tr:nth-child(11) > td:nth-child(2)`
      );
      const subjectSection12 = $(
        `body > center > table > tbody > tr:nth-child(12) > td:nth-child(2)`
      );
      const subjectSection13 = $(
        `body > center > table > tbody > tr:nth-child(13) > td:nth-child(2)`
      );
      const subjectSection14 = $(
        `body > center > table > tbody > tr:nth-child(14) > td:nth-child(2)`
      );
      subjectSection.push(
        $(subjectSection3).text(),
        $(subjectSection4).text(),
        $(subjectSection5).text(),
        $(subjectSection6).text(),
        $(subjectSection7).text(),
        $(subjectSection8).text(),
        $(subjectSection9).text(),
        $(subjectSection10).text(),
        $(subjectSection11).text(),
        $(subjectSection12).text(),
        $(subjectSection13).text(),
        $(subjectSection14).text()
      );

      const subjectName3 = $(
        `body > center > table > tbody > tr:nth-child(3) > td:nth-child(3)`
      );
      const subjectName4 = $(
        `body > center > table > tbody > tr:nth-child(4) > td:nth-child(3)`
      );
      const subjectName5 = $(
        `body > center > table > tbody > tr:nth-child(5) > td:nth-child(3)`
      );
      const subjectName6 = $(
        `body > center > table > tbody > tr:nth-child(6) > td:nth-child(3)`
      );
      const subjectName7 = $(
        `body > center > table > tbody > tr:nth-child(7) > td:nth-child(3)`
      );
      const subjectName8 = $(
        `body > center > table > tbody > tr:nth-child(8) > td:nth-child(3)`
      );
      const subjectName9 = $(
        `body > center > table > tbody > tr:nth-child(9) > td:nth-child(3)`
      );
      const subjectName10 = $(
        `body > center > table > tbody > tr:nth-child(10) > td:nth-child(3)`
      );
      const subjectName11 = $(
        `body > center > table > tbody > tr:nth-child(11) > td:nth-child(3)`
      );
      const subjectName12 = $(
        `body > center > table > tbody > tr:nth-child(12) > td:nth-child(3)`
      );
      const subjectName13 = $(
        `body > center > table > tbody > tr:nth-child(13) > td:nth-child(3)`
      );
      const subjectName14 = $(
        `body > center > table > tbody > tr:nth-child(14) > td:nth-child(3)`
      );
      const subjectName = [];
      subjectName.push(
        $(subjectName3).text(),
        $(subjectName4).text(),
        $(subjectName5).text(),
        $(subjectName6).text(),
        $(subjectName7).text(),
        $(subjectName8).text(),
        $(subjectName9).text(),
        $(subjectName10).text(),
        $(subjectName11).text(),
        $(subjectName12).text(),
        $(subjectName13).text(),
        $(subjectName14).text()
      );

      const subjectClassroom3 = $(
        `body > center > table > tbody > tr:nth-child(3) > td:nth-child(5)`
      );
      const subjectClassroom4 = $(
        `body > center > table > tbody > tr:nth-child(4) > td:nth-child(5)`
      );
      const subjectClassroom5 = $(
        `body > center > table > tbody > tr:nth-child(5) > td:nth-child(5)`
      );
      const subjectClassroom6 = $(
        `body > center > table > tbody > tr:nth-child(6) > td:nth-child(5)`
      );
      const subjectClassroom7 = $(
        `body > center > table > tbody > tr:nth-child(7) > td:nth-child(5)`
      );
      const subjectClassroom8 = $(
        `body > center > table > tbody > tr:nth-child(8) > td:nth-child(5)`
      );
      const subjectClassroom9 = $(
        `body > center > table > tbody > tr:nth-child(9) > td:nth-child(5)`
      );
      const subjectClassroom10 = $(
        `body > center > table > tbody > tr:nth-child(10) > td:nth-child(5)`
      );
      const subjectClassroom11 = $(
        `body > center > table > tbody > tr:nth-child(11) > td:nth-child(5)`
      );
      const subjectClassroom12 = $(
        `body > center > table > tbody > tr:nth-child(12) > td:nth-child(5)`
      );
      const subjectClassroom13 = $(
        `body > center > table > tbody > tr:nth-child(13) > td:nth-child(5)`
      );
      const subjectClassroom14 = $(
        `body > center > table > tbody > tr:nth-child(14) > td:nth-child(5)`
      );

      const subjectClassroom = [];
      subjectClassroom.push(
        filterClassroom($(subjectClassroom3).text()),
        filterClassroom($(subjectClassroom4).text()),
        filterClassroom($(subjectClassroom5).text()),
        $(subjectClassroom6).text(),
        $(subjectClassroom7).text(),
        $(subjectClassroom8).text(),
        $(subjectClassroom9).text(),
        $(subjectClassroom10).text(),
        $(subjectClassroom11).text(),
        $(subjectClassroom12).text(),
        $(subjectClassroom13).text(),
        $(subjectClassroom14).text()
      );
      console.log("unfilteredClassroom:%s", subjectClassroom);
      const subjectMonday3 = $(
        `body > center > table > tbody > tr:nth-child(3) > td:nth-child(6)`
      );
      const subjectMonday4 = $(
        `body > center > table > tbody > tr:nth-child(4) > td:nth-child(6)`
      );
      const subjectMonday5 = $(
        `body > center > table > tbody > tr:nth-child(5) > td:nth-child(6)`
      );
      const subjectMonday6 = $(
        `body > center > table > tbody > tr:nth-child(6) > td:nth-child(6)`
      );
      const subjectMonday7 = $(
        `body > center > table > tbody > tr:nth-child(7) > td:nth-child(6)`
      );
      const subjectMonday8 = $(
        `body > center > table > tbody > tr:nth-child(8) > td:nth-child(6)`
      );
      const subjectMonday9 = $(
        `body > center > table > tbody > tr:nth-child(9) > td:nth-child(6)`
      );
      const subjectMonday10 = $(
        `body > center > table > tbody > tr:nth-child(10) > td:nth-child(6)`
      );
      const subjectMonday11 = $(
        `body > center > table > tbody > tr:nth-child(11) > td:nth-child(6)`
      );
      const subjectMonday12 = $(
        `body > center > table > tbody > tr:nth-child(12) > td:nth-child(6)`
      );
      const subjectMonday13 = $(
        `body > center > table > tbody > tr:nth-child(13) > td:nth-child(6)`
      );
      const subjectMonday14 = $(
        `body > center > table > tbody > tr:nth-child(14) > td:nth-child(6)`
      );



      const subjectTuesDay3 = $(
        `body > center > table > tbody > tr:nth-child(3) > td:nth-child(6)`
      );
      const subjectTuesDay4 = $(
        `body > center > table > tbody > tr:nth-child(4) > td:nth-child(6)`
      );
      const subjectTuesDay5 = $(
        `body > center > table > tbody > tr:nth-child(5) > td:nth-child(6)`
      );
      const subjectTuesDay6 = $(
        `body > center > table > tbody > tr:nth-child(6) > td:nth-child(6)`
      );
      const subjectTuesDay7 = $(
        `body > center > table > tbody > tr:nth-child(7) > td:nth-child(6)`
      );
      const subjectTuesDay8 = $(
        `body > center > table > tbody > tr:nth-child(8) > td:nth-child(6)`
      );
      const subjectTuesDay9 = $(
        `body > center > table > tbody > tr:nth-child(9) > td:nth-child(6)`
      );
      const subjectTuesDay10 = $(
        `body > center > table > tbody > tr:nth-child(10) > td:nth-child(6)`
      );
      const subjectTuesDay11 = $(
        `body > center > table > tbody > tr:nth-child(11) > td:nth-child(6)`
      );
      const subjectTuesDay12 = $(
        `body > center > table > tbody > tr:nth-child(12) > td:nth-child(6)`
      );
      const subjectTuesDay13 = $(
        `body > center > table > tbody > tr:nth-child(13) > td:nth-child(6)`
      );
      const subjectTuesDay14 = $(
        `body > center > table > tbody > tr:nth-child(14) > td:nth-child(6)`
      );
      const subjectClassTime = [];
      subjectClassTime.push(filterClassTime($(subjectMonday3).text(), 1, 0))
      subjectClassTime.push(filterClassTime($(subjectMonday4).text(), 1, 1))
      subjectClassTime.push(filterClassTime($(subjectMonday5).text(), 1, 2))
      subjectClassTime.push(filterClassTime($(subjectMonday6).text(), 1, 3))
      subjectClassTime.push(filterClassTime($(subjectMonday7).text(), 1, 4))
      subjectClassTime.push(filterClassTime($(subjectMonday8).text(), 1, 5))
      subjectClassTime.push(filterClassTime($(subjectMonday9).text(), 1, 6))
      subjectClassTime.push(filterClassTime($(subjectMonday10).text(), 1, 7))
      subjectClassTime.push(filterClassTime($(subjectMonday11).text(), 1, 8))
      subjectClassTime.push(filterClassTime($(subjectMonday12).text(), 1, 9))
      subjectClassTime.push(filterClassTime($(subjectMonday13).text(), 1, 10))
      subjectClassTime.push(filterClassTime($(subjectMonday14).text(), 1, 11))

      subjectClassTime.push(filterClassTime($(subjectTuesDay3).text(), 2, 12))
      subjectClassTime.push(filterClassTime($(subjectTuesDay4).text(), 2, 13))
      subjectClassTime.push(filterClassTime($(subjectTuesDay5).text(), 2, 14))
      subjectClassTime.push(filterClassTime($(subjectTuesDay6).text(), 2, 15))
      subjectClassTime.push(filterClassTime($(subjectTuesDay7).text(), 2, 16))
      subjectClassTime.push(filterClassTime($(subjectTuesDay8).text(), 2, 17))
      subjectClassTime.push(filterClassTime($(subjectTuesDay9).text(), 2, 18))
      subjectClassTime.push(filterClassTime($(subjectTuesDay10).text(), 2, 19))
      subjectClassTime.push(filterClassTime($(subjectTuesDay11).text(), 2, 20))
      subjectClassTime.push(filterClassTime($(subjectTuesDay12).text(), 2, 21))
      subjectClassTime.push(filterClassTime($(subjectTuesDay13).text(), 2, 22))
      subjectClassTime.push(filterClassTime($(subjectTuesDay14).text(), 2, 23))


      console.log(subjectClassTime)
      const filteredSubjectCode = subjectCode.filter(function (e) {
        return e.trim();
      });
      const filteredSubjectSection = subjectSection.filter(function (e) {
        return e.trim();
      });
      const filteredSubjectName = subjectName.filter(function (e) {
        return e.trim();
      });

      const filteredSubjectClassroom = subjectClassroom.filter(function (e) {
        return e.trim();
      });


      const ClassTime = [];




      function filterClassTime(period, day, index) {
        if (myTrim(period) == " " || myTrim(period) == "" || period == []) {
          return '';
        }
        const period1 = period.substring(0, 1);
        const period2 = period.substring(2, 3);
        const convertP1 = convertPeriod1(period1);
        const convertP2 = convertPeriod2(period2);
        const classday = filterClassDay(day);
        const result = `Index:${index}  ${classday} ${convertP1} - ${convertP2}`;
        subjectClassTime[index] = result
        console.log('index: %s Data: %s', index, result)
        return ''
      }


      for (var i = 0; i < filteredSubjectCode.length; i++) {
        ClassTime.push(
          Object.assign({
            row: i,
            subjectCode: filteredSubjectCode[i],
            section: filteredSubjectSection[i],
            subjectName: filteredSubjectName[i],
            classroom: filteredSubjectClassroom[i],
            time: subjectClassTime[i] ?? 'Not Found',
          })
        );
      }
      res.send(ClassTime);
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