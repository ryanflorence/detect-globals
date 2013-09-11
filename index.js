var fs = require('fs');
var esprima = require('esprima');
var detectGlobals = require('./lib/detect-globals');

module.exports = detect;

function detect(code) {
  return detect.fromAst(esprima.parse(code));
}

detect.fromAst = detectGlobals;

detect.fromFile = function(path) {
  return detect(fs.readFileSync(path).toString());
};

