var fs = require("fs"),
    mkdirp = require("mkdirp");

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
