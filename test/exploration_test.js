var expect = require("expect.js"),
    request = require("request"),
    fs = require("fs");

describe("exploring the codewars API", function(){
  it("is able to browse katas", function(done){
    this.timeout(10000);

    var options = {
      url: "http://www.codewars.com/trainer/peek/javascript/reference_workout?dequeue=true",
      headers: {
        "Cookie": "remember_user_token=" + process.env["CODEWARS_REMEMBER_USER_TOKEN"] + ";"
      }
    }

    request(options, function(error, response, body){
      done();
      var info = JSON.parse(body);
      expect(info.name).to.not.be.empty();
      expect(info.description).to.not.be.empty();
    });
  });
});
