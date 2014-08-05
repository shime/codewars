var fs = require("fs"),
    mkdirp = require("mkdirp"),
    rest   = require("restler"),
    log = function() { return console.log.apply(console, arguments); };

module.exports = function(opts){
  if (!opts) opts = {};
  var c = new C (opts);
  c.paths = C.paths;
  return c;
}

function C (opts){
}

C.paths = {
  config: process.env.HOME + "/.config/"
}
C.paths.settings = C.paths.config + "codewars/";

C.prototype.setup = function(opts){
  this.token = opts.token || '';
  this.language = opts.language || '';

  var settings = {
    token: this.token,
    language: this.language
  }

  mkdirp(C.paths.settings, {}, function(err, made){
    if (err) throw "Unable to create ~/.config/codewars";
    fs.writeFile(C.paths.settings + "settings.json",
      JSON.stringify(settings));
  });
}

C.prototype.test = function(){
  fs.readFile(C.paths.settings + "settings.json", {encoding: "utf-8"}, function(err, data){
    if (err) throw "Unable to read from ~/.config/codewars/settings.json. Does it exist?"
    var token = JSON.parse(data).token;
    if (!token) throw "Token not found, run 'codewars setup' first."
    var language = JSON.parse(data).language.toLowerCase();
    if (!language) throw "Language not found, run 'codewars setup' first."
    if (!/ruby|javascript/.test(language)) throw language + " is unsupported. Ruby and JS only."

    rest.post('https://www.codewars.com/api/v1/code-challenges/' + language + '/train', {
      data: { strategy: 'random' },
      headers: { Authorization: token }
    }).on('complete', function(data, response) {
      var status = response.statusCode;
      if (status == 200) {
        log('Success - ready to rumble!');
      } else {
        log('Oh noes! Something is wrong.\n');
        log('Status: ' + status);
        log('Body:  ' + response.raw.toString('utf-8'));
      }
    });
  });
}
