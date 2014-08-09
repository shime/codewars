var Q = require("q"),
    rest   = require("restler");

function HTTP(settings){
  this.paths = settings.paths || {};
}

HTTP.prototype.getChallenge = function(args){
  var language = args.language,
      token = args.token,
      strategy = args.strategy,
      spinner = require('char-spinner')(),
      df = Q.defer(),
      url = this.paths.api + language + '/train';

  rest.post(url, {
    data: { strategy: strategy },
    headers: { Authorization: token }
  }).on('complete', function(data, response) {
    if (response.statusCode == 200) {
      clearInterval(spinner);
      df.resolve(response);
    } else {
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

  rest.post(this.paths.api + challenge.slug + "/" + language + '/train', {
    headers: { Authorization: token }
  }).on('complete', function(data, response) {
    if (response.statusCode == 200) {
      clearInterval(spinner);
      df.resolve(response);
    } else {
      clearInterval(spinner);
      df.reject(response);
    }
  });

  return df.promise;
}

HTTP.prototype.attempt = function(args){
  var language = args.language,
      token = args.token,
      challenge = args.challenge,
      spinner = require('char-spinner')(),
      df = Q.defer();

  rest.post(this.paths.api + 'projects/' +
            challenge.projectId + '/solutions/' + 
            challenge.solutionId + '/attempt' ,
  {
    headers: { Authorization: token },
    data: { code: 'def bool_to_word(arg); arg ? "Yes" : "No"; end' }
  }).on('complete', function(data, response) {
    if (response.statusCode == 200) {
      clearInterval(spinner);
      df.resolve(response);
    } else {
      clearInterval(spinner);
      df.reject(response);
    }
  });

  return df.promise;
}

HTTP.prototype.finalize = function(args){
  var language = args.language,
      token = args.token,
      challenge = args.challenge,
      spinner = require('char-spinner')(),
      df = Q.defer();

  var url = this.paths.api + 'projects/' +
            challenge.projectId + '/solutions/' + 
            challenge.solutionId + '/finalize' ;

  rest.post(url,
  {
    headers: { Authorization: token }
  }).on('complete', function(data, response) {
    if (response.statusCode == 200) {
      clearInterval(spinner);
      df.resolve(response);
    } else {
      clearInterval(spinner);
      df.reject(response);
    }
  });

  return df.promise;
}

HTTP.prototype.poll = function(args){
  var token = args.token,
      id    = args.id,
      spinner = require('char-spinner')(),
      df = Q.defer();

  rest.get(this.paths.poll + id,
  {
    headers: { Authorization: token },
  }).on('complete', function(data, response) {
    if (response.statusCode == 200) {
      clearInterval(spinner);
      df.resolve(response);
    } else {
      clearInterval(spinner);
      df.reject(response);
    }
  });

  return df.promise;
}

module.exports = function(args){
  return new HTTP(args);
}
