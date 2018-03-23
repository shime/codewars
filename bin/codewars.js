#!/usr/bin/env node
'use strict'

const program = require('commander')

const codewars = require('../')
const client = codewars()
const HTTPError = require('../http_error')
const log = function () { return console.log.apply(console, arguments) }
const msee = require('msee')
const colors = require('colors')

// TODO: extract logger, probably
const responseError = response => {
  var status = response.statusCode
  var body = response.raw.toString('utf-8')

  log('HTTP error'.red)
  log('Status: ' + status)
  log('Body:  ' + body)
  process.exit(1)
}

const logTestData = data => {
  log(msee.parse('## Tests'))

  var buff = data.summary.passed.toString().green + ' passed'.green + ', ' +
    data.summary.failed.toString().red + ' failed'.red + ', ' +
    data.summary.errors.toString().red + ' errors'.red + ' in ' +
    data.wall_time.toString().yellow + 'ms'.yellow

  log(buff)
}

const logAttempt = data => {
  if (data.valid) {
    log('Well done! Solution is correct. :)'.green)
  } else {
    log('Nope. Your solution is incorrect. :('.red)
    log(msee.parse('## Stack trace\n' + data.reason))
  }

  logTestData(data)

  if (data.valid) {
    log('\n')
    log(msee.parse('You can still make some final changes, before submitting with:\n```\ncodewars submit```'))
  } else {
    log('')
  }
}

const test = () => {
  client.test().then(() => {
    log('Success - ready to rumble!')
    process.exit(0)
  }, responseError)
}

const setup = token => {
  if (!token) {
    console.log(token)
    log("Setup failed, missing required argument: Your 'API access token', from https://www.codewars.com/users/edit".red)
    log('Read your API access token here: https://www.codewars.com/users/edit'.yellow)
    log('\nUsage:')
    log('codewars setup --token <token>\n')
    process.exit(1)
  } else {
    if (!/javascript|ruby/.test(program.language)) {
      log('Setup failed, unsupported language: '.red + program.language.toString().red)
      process.exit(1)
    }
    console.log('eheeh')
    client.setup({
      language: program.language,
      token: token,
      strategy: program.strategy
    }).then(() => log('All done. Settings saved in ~/.config/codewars/settings.json'.green))
  }
}

const train = id => {
  client.fetch(id).then(data => {
    if (!data) return

    var challenge = require('../challenge')(data.raw.toString('utf-8'))
    var prompt = require('prompt')

    log(msee.parse(challenge.toString()))

    prompt.start()
    prompt.message = ''
    prompt.delimiter = ''

    prompt.get([{

      name: 'answer',
      message: 'Take this challenge? [y/N]'.magenta

    }], function (err, result) {
      if (err) process.exit(1)

      var answer = result.answer

      if (!result.answer) answer = 'n'
      answer = answer.trim().toLowerCase()

      if (/^n/.test(answer)) return
      if (/^y/.test(answer)) {
        client.train(challenge).then(data => {
          var challenge = require('../challenge')(data.raw.toString('utf-8'))
          client.save(challenge)
        }, responseError).then(() => log(msee.parse(challenge.acceptedMessage())))
      }
    })
  }).fail(responseError)
}

const print = () => {
  client.getCurrentChallenge().then(challenge => {
    log(msee.parse(challenge.toString()))
    log(msee.parse('-----'))
    log(msee.parse(challenge.instructions()))
  }).fail(err => console.log(err.message.red))
}

const verify = (path) => {
  if (!path){throw 'Path to solution not provided. Run with: codewars verify /path/to/solution' }

  client.getSolution(path).then(
    client.attempt.bind(client)).then(
      response => {
        var body = JSON.parse(response.raw.toString('utf-8'))
        if (body.success) {
          var poll = () => {
            client.poll(body.dmid).then(response => {
              var body = JSON.parse(response.raw.toString('utf-8'))
              if (!body.success) setTimeout(poll, 1000)
              else logAttempt(body)
            })
          }
          poll()
        } else {
          log('Error: ' + body.reason)
        }
      }).fail(err => {
        if (err instanceof HTTPError) {
          responseError(err.response)
        } else {
          console.log(err.message.red)
        }
      })
}

const submit = () => {
  client.finalize().then(response => {
    var body = JSON.parse(response.raw.toString('utf-8'))

    if (body.success) {
      log(msee.parse('## Kata completed'))
      log('See more solutions here: http://www.codewars.com/kata/' +
          client.challenge.slug +
          '/solutions/' + client.challenge.language)
      client.done()
    }
  }, responseError)
}

program
.option('-l, --language [language]', "The language you're practicing. Currently only JavaScript and Ruby are supported. Defaults to JavaScript.", /^(ruby|javascript)$/i, 'javascript')
.option('-s, --strategy', 'Strategy used for retreiving new challenges')

program
.command('setup <token>')
.description('Prepares you for communication with the API.')
.action(token => setup(token))

program
.command('train <id>')
.description('Starts new training session.')
.action(id => train(id))

program
.command('print')
.description('Prints instructions for current challenge.')
.action(print)

program
.command('verify <path>')
.description('Verifies provided solution.')
.action(path => verify(path))

program
.command('submit')
.description('Submits provided solution.')
.action(submit)

program
.command('test')
.description('Checks if the client is ready for communication.')
.action(test)

program.parse(process.argv)
