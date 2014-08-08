var Q = require("q"),
    rest   = require("restler");

function HTTP(settings){
  this.paths = settings.paths || {};
}

HTTP.prototype.getChallenge = function(args){
  var language = args.language,
      token = args.token,
      spinner = require('char-spinner')(),
      df = Q.defer();

  rest.post(this.paths.api + language + '/train', {
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

  return df.promise;
}

HTTP.prototype.startChallenge = function(args){
  var language = args.language,
      token = args.token,
      challenge = args.challenge,
      spinner = require('char-spinner')(),
      df = Q.defer();

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

  return df.promise;
}

module.exports = function(args){
  return new HTTP(args);
}
