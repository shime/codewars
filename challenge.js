function Challenge(data){
  var data = JSON.parse(data);

  this._data = data;
  this.name = data.name;
  this.description = data.description;
  this.slug = data.slug;
  this.setup = data.session.setup;
  this.tests = data.session.exampleFixture;
  this.solutionId = data.session.solutionId;
  this.projectId = data.session.projectId;
  this.setup = data.session.setup;
  this.rank = data.rank.toString().replace('-', '');
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
    this.description + '\n' + 
    '\n------' + '\n' +
    '# Provided code' + '\n```\n' +
    this.setup + '\n```\n';

  if (this.tests) {
    buff = buff + 
      '# Provided tests' + '\n```\n' +
      this.tests + '\n```\n';
  }
  return buff;
}

Challenge.prototype.acceptedMessage = function(){
  var extension = this.extensions[this.language];

  return '# Challenge started\n\n' +
  'To print these instructions again, run: `codewars print`\n' +
  'To verify your solution, run: `codewars attempt solution.' +
  extension + '`\n';
}

module.exports = function(args){
  return new Challenge(args);
}
