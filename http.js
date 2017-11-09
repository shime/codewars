var Q = require('q')
var rest = require('restler')

function HTTP (settings) {
  this.paths = settings.paths || {}
}

HTTP.prototype.getChallenge = function (args) {
  var language = args.language
  var token = args.token
  var strategy = args.strategy
  var spinner = require('char-spinner')()
  var df = Q.defer()
  var url = this.paths.api + language + '/train'

  if (args.id) { url = this.paths.api + args.id }

  rest.request(url, {
    method: args.id ? 'get' : 'post',
    data: { strategy: strategy },
    headers: { Authorization: token }
  }).on('complete', function (data, response) {
    if (response.statusCode === 200) {
      clearInterval(spinner)
      df.resolve(response)
    } else {
      clearInterval(spinner)
      df.reject(response)
    }
  })

  return df.promise
}

HTTP.prototype.startChallenge = function (args) {
  var language = args.language
  var token = args.token
  var challenge = args.challenge
  var spinner = require('char-spinner')()
  var df = Q.defer()

  rest.post(this.paths.api + challenge.slug + '/' + language + '/train', {
    headers: { Authorization: token }
  }).on('complete', function (data, response) {
    if (response.statusCode === 200) {
      clearInterval(spinner)
      df.resolve(response)
    } else {
      clearInterval(spinner)
      df.reject(response)
    }
  })

  return df.promise
}

HTTP.prototype.attempt = function (args) {
  var token = args.token
  var challenge = args.challenge
  var solution = args.solution
  var spinner = require('char-spinner')()
  var df = Q.defer()

  rest.post(this.paths.api + 'projects/' +
            challenge.projectId + '/solutions/' +
            challenge.solutionId + '/attempt',
    {
      headers: { Authorization: token },
      data: { code: solution }
    }).on('complete', function (data, response) {
      if (response.statusCode === 200) {
        clearInterval(spinner)
        df.resolve(response)
      } else {
        clearInterval(spinner)
        df.reject(response)
      }
    })

  return df.promise
}

HTTP.prototype.finalize = function (args) {
  var token = args.token
  var challenge = args.challenge
  var spinner = require('char-spinner')()
  var df = Q.defer()

  var url = this.paths.api + 'projects/' +
            challenge.projectId + '/solutions/' +
            challenge.solutionId + '/finalize'

  rest.post(url,
    {
      headers: { Authorization: token }
    }).on('complete', function (data, response) {
      if (response.statusCode === 200) {
        clearInterval(spinner)
        df.resolve(response)
      } else {
        clearInterval(spinner)
        df.reject(response)
      }
    })

  return df.promise
}

HTTP.prototype.poll = function (args) {
  var token = args.token
  var id = args.id
  var spinner = require('char-spinner')()
  var df = Q.defer()

  rest.get(this.paths.poll + id,
    {
      headers: { Authorization: token }
    }).on('complete', function (data, response) {
      if (response.statusCode === 200) {
        clearInterval(spinner)
        df.resolve(response)
      } else {
        clearInterval(spinner)
        df.reject(response)
      }
    })

  return df.promise
}

module.exports = function (args) {
  return new HTTP(args)
}
