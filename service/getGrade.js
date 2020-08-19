const axios = require('axios');
async function getGrade(studentId) {
      const studentGrade = await  axios({
  method: 'post',
  url: 'http://202.29.80.113/cgi/LstGrade1.pl',
  data: {
    ID_NO:'6112224060'
  }
});
console.log('AXIOS_REQ:',studentGrade)
}

module.exports = {getGrade}