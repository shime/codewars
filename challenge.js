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
  this.rank = data.rank.toString().replace('-', '');
}

Challenge.prototype.extensions = {
  ruby: 'rb',
  javascript: 'js'
}

Challenge.prototype.toString = function(){
  return '#' + this.name + '\n#' + this.rank + ' KYU\n' + this.description;
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
