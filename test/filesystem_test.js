/* eslint-env mocha */

var expect = require('expect.js')
var rewire = require('rewire')
var Codewars = rewire('../index')

describe('Codewars.setup', function () {
  it('writes passed settings to ~/.config/codewars/settings.json', function () {
    var settings = {token: 'foo', language: 'bar', strategy: 'default'}
    var fsStub = {
      existsSync: function (path) {},
      writeFile: function (path, data) {
        expect(path).to.be(Codewars().paths.settings + 'settings.json')
        expect(data).to.be(JSON.stringify(settings))
      }
    }

    Codewars.__set__('fs', fsStub)

    var client = Codewars()
    client.setup(settings)
  })
})
