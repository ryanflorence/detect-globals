var traverse = require('./traverse');
var detectRootVar = require('./detect-root-var');

module.exports = function(ast) {
  var globals = [];
  traverse(ast, function(node) {
    var global;
    if (global = detectRootVar(node)) {
      globals.push(global);
    }
  });
  return globals;
};

