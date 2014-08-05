function Challenge(body){
  var body = JSON.parse(body);
  this.name = body.name;
  this.description = body.description;
}

Challenge.prototype.toString = function(){
  return this.name + '\n=====\n' + this.description;
}

module.exports = function(args){
  return new Challenge(args);
}
