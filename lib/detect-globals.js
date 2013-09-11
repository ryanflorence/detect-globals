// jshint node:true
"use strict";


var traverse = require('./traverse');
var find = require('mout/array/find');


module.exports = function(ast) {
  var globals = [];

  traverse(ast, function(node, parent){
    node.parent = parent;
    node.context = getContextVars(node);

    var type = node.type;

    if (type === 'VariableDeclaration') {
      processVariableDeclaration(node, globals);
    }


    if (node.type === 'AssignmentExpression') {

      var left = node.left;

      if (left.type ===  'MemberExpression') {
      } else if (left.type === 'Identifier') {
        if (! find(node.context, {name: left.name}) ) {
          globals.push(left.name);
        }
      }
    }

  });

  return globals;
};



function getContextVars(node) {
  var context;
  if (node.type === 'Program') {
    // program is always the root
    context = [];
  } else if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
    // Functions create a new "context"
    context = node.parent.context.slice();
  } else {
    // others just reuse same context
    context = node.parent.context;
  }
  return context;
}



function processVariableDeclaration(node, globals){
  node.declarations.forEach(function(declarator){
    // TODO: store reference to real value in case the init points to
    // some identifier that maps to other value
    node.context.push({
      name: declarator.id.name,
      init: declarator.init && declarator.init.value
    });

    if (node.parent.type === 'Program') {
      globals.push(declarator.id.name);
    }
  });
}
