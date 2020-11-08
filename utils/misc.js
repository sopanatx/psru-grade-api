function convertDayPeriodType(startTime, endTime) {
  //  const time = data.slice()
  console.log(startTime, endTime);
  if (startTime < 5) {
    return "CLASS_MORNING";
  } else if (startTime > 5) {
    return "CLASS_AFTERNOON";
  }
}

module.exports = {
  convertDayPeriodType,
};
