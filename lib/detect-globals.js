// jshint node:true
"use strict";


var traverse = require('./traverse');
var find = require('mout/array/find');


// simplify and delegate logic
var hooks = {};


module.exports = function(ast) {
  var globals = [];

  traverse(ast, function(node, parent){
    node.parent = parent;
    node.context = getContextVars(node);

    if (node.type in hooks) {
      hooks[node.type](node, globals);
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



hooks.VariableDeclaration = function(node, globals){
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
};


hooks.AssignmentExpression = function(node, globals){
  var left = node.left;

  if (left.type ===  'MemberExpression') {
    if (left.object.type === 'ThisExpression' && isGlobal(node, left.name)) {
      globals.push(left.property.name);
    }
    return;
  }

  if (left.type === 'Identifier') {
    // if identifier doesn't exist on context it's an implied global
    if ( isGlobal(node, left.name) ) {
      globals.push(left.name);
    }
    return;
  }
};


function isGlobal(node, varName){
  return ! find(node.context, {name: varName});
}


