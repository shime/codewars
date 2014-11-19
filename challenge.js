function Challenge(data){
  var data         = JSON.parse(data)

  this._data       = data
  this.name        = data.name
  this.description = data.description
  this.slug        = data.slug
  if (data.session){
    this.setup       = data.session.setup
    this.tests       = data.session.exampleFixture
    this.solutionId  = data.session.solutionId
    this.projectId   = data.session.projectId
  }
  if (typeof data.rank === 'object'){
    this.rank        = data.rank.id.toString().replace('-', '')
  } else {
    this.rank        = data.rank.toString().replace('-', '')
  }
  this.language    = data.language
}

Challenge.prototype.extensions = {
  ruby: 'rb',
  javascript: 'js'
}

Challenge.prototype.toString = function(){
  var buff = '#' + this.name + '\n' +

    '#' + this.rank + ' KYU' + '\n' +
    '\n------' + '\n' +

    '# Description' + '\n' +
    this.description + '\n'

  if (this.setup){
    buff = buff +
      '\n------' + '\n' +

      '# Provided code' + '\n```\n' +
      this.setup + '\n```\n';
  }

  if (this.tests) {
    buff = buff +
      '# Provided tests' + '\n```\n' +
      this.tests + '\n```\n';
  }
  return buff;
}

Challenge.prototype.acceptedMessage = function(){
  return '# Challenge started\n\n' +
    this.instructions()
}

Challenge.prototype.instructions = function(){
  var extension = this.extensions[this.language];

  return 'To print these instructions again, run: `codewars print`\n' +
  'To verify your solution, run: `codewars verify solution.' + extension + '`\n';
}

module.exports = function(args){
  return new Challenge(args);
}
