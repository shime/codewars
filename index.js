var fs = require('fs')
var mkdirp = require('mkdirp')
var Q = require('q')
var HTTPError = require('./http_error')

module.exports = function (opts) {
  if (!opts) opts = {}
  var c = new C(opts)
  c.paths = C.paths
  return c
}

function C (opts) {
  var self = this
  if (fs.existsSync(C.paths.settingsJSON)) {
    fs.readFile(C.paths.settingsJSON, {encoding: 'utf-8'}, function (err, raw) {
      if (err) {
        throw new Error('Cannot read from settings file')
      }
      var data = JSON.parse(raw)

      self.token = data.token
      self.language = data.language
    })
  }

  if (fs.existsSync(C.paths.currentChallenge)) {
    fs.readFile(C.paths.currentChallenge, {encoding: 'utf-8'}, function (err, raw) {
      if (err) {
        throw new Error('Error with reading current challenge file')
      }
      var data = JSON.parse(raw)

      self.challenge = data
    })
  }
}

C.paths = {
  config: process.env.HOME + '/.config/',
  api: 'https://www.codewars.com/api/v1/code-challenges/',
  poll: 'https://www.codewars.com/api/v1/deferred/'
}

C.paths.settings = C.paths.config + 'codewars/'
C.paths.settingsJSON = C.paths.settings + 'settings.json'
C.paths.challenges = C.paths.settings + 'challenges/'
C.paths.currentChallenge = C.paths.challenges + 'current.json'

C.prototype.save = function (challenge) {
  fs.writeFile(C.paths.currentChallenge, JSON.stringify({
    slug: challenge.slug,
    projectId: challenge.projectId,
    solutionId: challenge.solutionId,
    language: this.language
  }), function (err) { if (err) console.log(err) })

    fs.writeFile(
        C.paths.challenges + challenge.slug + '.json',
        JSON.stringify(challenge),
        function (err) {
            if (err) console.log(err) 
        })
}

C.prototype.done = function () {
  var currentChallenge = C.paths.currentChallenge
  fs.unlink(currentChallenge)
}

C.prototype.setup = function (opts) {
  this.token = opts.token || ''
  this.language = opts.language || ''
  this.strategy = opts.strategy || 'default'

  var settings = {
    token: this.token,
    language: this.language,
    strategy: this.strategy
  }

  var df = Q.defer()

  mkdirp(C.paths.challenges, {}, function (err, made) {
    if (err) throw new Error('Unable to create ~/.config/codewars')
    fs.writeFile(C.paths.settingsJSON, JSON.stringify(settings), function (err) {
      if (err) throw new Error('Unable to create ~/.config/codewars')
    })
    df.resolve()
  })

  return df.promise
}

C.prototype.validateLocalData = function () {
  var df = Q.defer()
  fs.readFile(C.paths.settingsJSON, {encoding: 'utf-8'}, function (err, data) {
    if (err) throw new Error('Unable to read from ' + C.paths.settingsJSON + '. Run `codewars setup` first.')
    var token = JSON.parse(data).token

    if (!token) throw new Error("Token not found, run 'codewars setup' first.")
    var language = JSON.parse(data).language.toLowerCase()

    if (!language) throw new Error("Language not found, run 'codewars setup' first.")
    if (!/ruby|javascript/.test(language)) throw new Error(language + ' is unsupported. Ruby and JS only.')

    var strategy = JSON.parse(data).strategy.toLowerCase()
    df.resolve({language: language, token: token, strategy: strategy})
  })

  return df.promise
}

C.prototype.getCurrentChallenge = function () {
  var df = Q.defer()
  var currentChallenge = C.paths.currentChallenge

  if (fs.existsSync(currentChallenge)) {
    fs.readFile(currentChallenge, {encoding: 'utf-8'}, function (err, raw) {
      if (err) throw err
      var slug = JSON.parse(raw).slug
      var language = JSON.parse(raw).language
      var challenge = C.paths.challenges + slug + '.json'

      fs.readFile(challenge, {encoding: 'utf-8'}, function (err, raw) {
        if (err) throw err
        var data = JSON.parse(raw)._data
        data.language = language

        var challenge = require('./challenge')(JSON.stringify(data))

        df.resolve(challenge)
      })
    })
  } else {
    df.reject(new Error('no current challenge - run `codewars train` first'))
  }

  return df.promise
}

C.prototype.checkCurrentChallenge = function () {
  var df = Q.defer()
  var prompt = require('prompt')
  var currentChallenge = C.paths.currentChallenge

  if (fs.existsSync(currentChallenge)) {
    prompt.start()
    prompt.message = ''
    prompt.delimiter = ''
    prompt.get([{

      name: 'answer',
      message: 'Current challenge will be dismissed. Continue? [y/N]'.magenta

    }], function (err, result) {
      if (err) process.exit(1)

      var answer = result.answer

      if (!result.answer) answer = 'n'
      answer = answer.trim().toLowerCase()

      if (/^n/.test(answer)) {
        df.reject()
      }
      if (/^y/.test(answer)) {
        fs.unlink(currentChallenge, function (err) { if (err) console.log(err) })
        df.resolve()
      }
    })
  } else {
    df.resolve()
  }

  return df.promise
}

C.prototype.fetch = function (id) {
  var df = Q.defer()
  var http = require('./http')(C)

  this.checkCurrentChallenge()
  .then(this.validateLocalData)
  .then(function (args) {
    args.id = id
    return http.getChallenge(args)
  })
  .then(df.resolve.bind(this),
       df.reject.bind(this))

  return df.promise
}

C.prototype.train = function (challenge) {
  var df = Q.defer()
  var http = require('./http')(C)

  this.validateLocalData().then(function (args) {
    args.challenge = challenge
    return http.startChallenge(args)
  }).then(df.resolve.bind(this),
          df.reject.bind(this))

  return df.promise
}

C.prototype.getSolution = function (path) {
  var df = Q.defer()

  fs.readFile(path, {encoding: 'utf-8'}, function (err, raw) {
    if (err) throw err

    df.resolve(raw)
  })

  return df.promise
}

C.prototype.attempt = function (solution) {
  var currentChallenge = C.paths.currentChallenge
  var df = Q.defer()
  var http = require('./http')(C)

  this.validateLocalData().then(function (args) {
    if (fs.existsSync(currentChallenge)) {
      fs.readFile(currentChallenge, {encoding: 'utf-8'}, function (err, raw) {
        if (err) throw err
        args.challenge = JSON.parse(raw)
        args.solution = solution

        return http.attempt(args).then(df.resolve.bind(this))
          .fail(function (response) {
            df.reject(new HTTPError(response))
          })
      })
    } else {
      df.reject(new Error("Challenge not in progress. Run 'codewars train' first."))
    }
  })

  return df.promise
}

C.prototype.finalize = function () {
  var currentChallenge = C.paths.currentChallenge
  var df = Q.defer()
  var http = require('./http')(C)

  this.validateLocalData().then(function (args) {
    if (fs.existsSync(currentChallenge)) {
      fs.readFile(currentChallenge, {encoding: 'utf-8'}, function (err, raw) {
        if (err) throw err
        args.challenge = JSON.parse(raw)

        return http.finalize(args).then(df.resolve.bind(this), df.reject.bind(this))
      })
    } else {
      df.reject()
    }
  })

  return df.promise
}

C.prototype.poll = function (id) {
  var http = require('./http')(C)
  return http.poll({id: id, token: this.token})
}

C.prototype.test = function () {
  return this.fetch()
}
