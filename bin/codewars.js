#!/usr/bin/env node

var fs = require("fs");
var argv = require('minimist')(process.argv.slice(2),{
  alias: { h: 'help', t: 'token', l: 'language' }
});
var codewars = require("../");

if (argv.help){
  fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
  return;
}

argv.language = argv.language || "javascript";
argv.language = argv.language.toLowerCase();
var command = argv._[0];

if (command === "setup"){
  if (!argv.token) {
    console.log("setup failed, missing required argument: token")
    process.exit(0);
  }
  if (!/javascript|ruby/.test(argv.language)){
    console.log("setup failed, unsupported language: " + argv.language);
  }
  codewars().setup();
  return;
}