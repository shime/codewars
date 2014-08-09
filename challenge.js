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
  this.rank = data.rank;
}

Challenge.prototype.toString = function(){
  return this.name + '\n=====\n' + this.description;
}

module.exports = function(args){
  return new Challenge(args);
}
