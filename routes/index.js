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
const { checkIsAssess, getGrade } = require("../service/Grade");
const { getClass } = require("../service/Class");
const { getBilling } = require("../service/Billing");
const { getActivity } = require("../service/activity");

const { convertDayPeriodType } = require("../utils/misc");

const { body, validationResult, header } = require("express-validator");
require("dotenv").config();
/* GET home page. */
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
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

router.get("/api/activity", async (req, res) => {
  const { studentId } = req.body;
  const response = await getActivity(studentId, uuidv4());
  console.log(response);
  res.send(response);
});

router.get("/api/grade*", async function (req, res) {
  res.status(405).send(new MethodNotAllowed());
});

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
    const response = await getGrade(studentId, semester, uuidv4());
    res.status(200).send(response);
  }
);

router.get(
  "/api/class",
  body("classID").isLength({ max: 30 }),
  //body("session_key").isString(),
  header("API_KEY").isString().isLength({ min: 2, max: 100 }),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else if (req.headers.api_key != process.env.API_KEY) {
      return res
        .status(400)
        .json({ errorCode: 400, message: "API_KEY MISMATCHED" });
    }
    const { classID } = req.body;
    async function removeElement(array, elem) {
      var index = array.indexOf(elem);
      if (index > -1) {
        array.splice(index, 1);
      }
      return array;
    }

    console.log("[Request_Params: %s]", classID);
    const response = await getClass(classID, uuidv4());
    res.status(200).send(response);
  }
);

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
  const { studentId, studentPassword } = req.body;
  console.log(studentId, studentPassword);
  const response = await getBilling(studentId, studentPassword, uuidv4());
  res.send(response);
});
module.exports = router;
