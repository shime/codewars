function HTTPError (response) {
  this.name = 'HTTPError'
  this.response = (response || {})
}
HTTPError.prototype = Object.create(Error.prototype)

module.exports = HTTPError
