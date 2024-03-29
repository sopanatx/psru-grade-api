var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var app = express();
const serverless = require("serverless-http");
const http = require("http");
const helmet = require("helmet");
const { hidePoweredBy } = require("helmet");
// view engine setup
app.use(
  helmet({
    frameguard: {
      action: "deny",
    },
  }),
  hidePoweredBy()
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.set("port", process.env.PORT || 8000); //<--- replace with your port number

// Server
var server = http.createServer(app);
server.listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});

module.exports.handler = serverless(app);
