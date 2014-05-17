var request = require("request"),
    fs = require("fs");

var options = {
  url: "http://www.codewars.com/trainer/peek/javascript/reference_workout?dequeue=true",
  headers: {
    "Cookie": "remember_user_token=" + process.env["CODEWARS_REMEMBER_USER_TOKEN"] + ";"
  }
}

request(options, function(error, response, body){
  if (!error){
    var info = JSON.parse(body);
  }
  console.log(info.name + "\n");
  console.log(info.description);
});
