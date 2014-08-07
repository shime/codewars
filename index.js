var fs = require("fs"),
    mkdirp = require("mkdirp"),
    rest   = require("restler"),
    Q = require("q");

module.exports = function(opts){
  if (!opts) opts = {};
  var c = new C (opts);
  c.paths = C.paths;
  return c;
}

function C (opts){
}

C.paths = {
  config: process.env.HOME + "/.config/",
  api: 'https://www.codewars.com/api/v1/code-challenges/'
}
C.paths.settings = C.paths.config + "codewars/";
C.paths.challenges = C.paths.settings + "challenges/";

C.prototype.setup = function(opts){
  this.token = opts.token || '';
  this.language = opts.language || '';

  var settings = {
    token: this.token,
    language: this.language
  }

  mkdirp(C.paths.challenges, {}, function(err, made){
    if (err) throw "Unable to create ~/.config/codewars";
    fs.writeFile(C.paths.settings + "settings.json", JSON.stringify(settings));
  });
}

C.prototype.checkCurrentChallenge = function(){
  var df = Q.defer(),
  prompt = require("prompt"),
  currentChallenge = C.paths.challenges + 'current.json';

  if (fs.existsSync(currentChallenge)){
    prompt.start();
    prompt.message = "";
    prompt.delimiter = "";
    prompt.get([{

      name: 'answer',
      message: 'Current challenge is in progress. Dismiss? [y/N]'.magenta

    }], function (err, result) {
      if (err) process.exit(1);

      var answer = result.answer;

      if (!result.answer) answer = 'n';
      answer = answer.trim().toLowerCase();

      if (/^n/.test(answer)) { 
        df.reject();
      }
      if (/^y/.test(answer)) {
        fs.unlink(currentChallenge);
        df.resolve();
      }
    });
  } else {
    df.resolve();
  }

  return df.promise;
}

C.prototype.fetch = function(){
  var df = Q.defer(),
      self = this;

  this.checkCurrentChallenge().
  then(function(){

    fs.readFile(C.paths.settings + "settings.json", {encoding: "utf-8"}, function(err, data){
      if (err) throw "Unable to read from ~/.config/codewars/settings.json. Does it exist?"
      var token = JSON.parse(data).token;

      if (!token) throw "Token not found, run 'codewars setup' first."
      var language = JSON.parse(data).language.toLowerCase();

      if (!language) throw "Language not found, run 'codewars setup' first."
      if (!/ruby|javascript/.test(language)) throw language + " is unsupported. Ruby and JS only."

      var spinner = require('char-spinner')();

      rest.post(C.paths.api + language + '/train', {
        data: { strategy: 'random' },
        headers: { Authorization: token }
      }).on('complete', function(data, response) {
        if (response.statusCode == 200) {
          clearInterval(spinner);
          df.resolve(response);
        }
        else {
          clearInterval(spinner);
          df.reject(response);
        }
      });
    });

  })

  return df.promise;
}

C.prototype.save = function(challenge){
  fs.writeFile(C.paths.challenges + "current.json", JSON.stringify({
    slug: challenge.slug,
    id:   challenge.id
  }));
  fs.writeFile(C.paths.challenges + challenge.slug + ".json", JSON.stringify(challenge));
}

C.prototype.train = function(challenge){
  // TODO: duplication
  var df = Q.defer(),
      self = this;

  fs.readFile(C.paths.settings + "settings.json", {encoding: "utf-8"}, function(err, data){
    if (err) throw "Unable to read from ~/.config/codewars/settings.json. Does it exist?"
    var token = JSON.parse(data).token;
    if (!token) throw "Token not found, run 'codewars setup' first."
    var language = JSON.parse(data).language.toLowerCase();
    if (!language) throw "Language not found, run 'codewars setup' first."
    if (!/ruby|javascript/.test(language)) throw language + " is unsupported. Ruby and JS only."

      var spinner = require('char-spinner')();
      rest.post(C.paths.api + challenge.slug + "/" + language + '/train', {
      headers: { Authorization: token }
    }).on('complete', function(data, response) {
      if (response.statusCode == 200) {
        clearInterval(spinner);
        df.resolve(response);
      }
      else {
        clearInterval(spinner);
        df.reject(response);
      }
    });
  });

  return df.promise;
}

C.prototype.test = function(){
  return this.fetch();
}
