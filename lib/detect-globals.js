// jshint node:true
"use strict";


var traverse = require('./traverse');
var find = require('mout/array/find');
var insert = require('mout/array/insert');


// ---


var IMPLIED_GLOBALS = ['window', 'document'];
var GLOBAL_CONTEXT = 'window';
var CUSTOM_CONTEXT = '__CUSTOM_CONTEXT__';


// ---


// simplify and delegate logic
var hooks = {};


// ---


module.exports = function(ast) {
  var globals = [];

  traverse(ast, function(node, parent){
    node.parent = parent;
    node.scope = getScopeVars(node);
    node.context = getContext(node);

    if (node.type in hooks) {
      hooks[node.type](node, globals);
    }
  });

  return globals;
};


// ---


function getScopeVars(node) {
  if (node.type === 'Program') {
    // program is always the root
    return [];
  }

  if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
    // Functions create a new "scope"
    return node.parent.scope.slice();
  }

  // others just reuse same scope
  return node.parent.scope;
}


// gets reference to the "this" value
function getContext(node) {
  if (node.type === 'Program') {
    return GLOBAL_CONTEXT;
  }

  // IIFE (function(win){ win.x = 'x' }(window))
  if (node.type === 'CallExpression' && node.callee.type === 'FunctionExpression') {
    var args = node.arguments;
    var params = node.callee.params;
    if (args.length && params.length) {
      params.forEach(function(param, i){
        var arg = args[i] || {};
        var init = arg.type === 'ThisExpression'? node.context : arg.name;
        addVarToScope(node, {
          name: param.name,
          init: init
        });
      });
    }
  }

  // function.call and function.apply change the context
  if (node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      (node.callee.property.name === 'call' || node.callee.property.name === 'apply')) {
    var arg = node.arguments[0];
    var ctx = (!arg || arg.type === 'ThisExpression' ||
      (arg.type === 'Literal' && arg.value == null))? GLOBAL_CONTEXT : CUSTOM_CONTEXT;

    addVarToScope(node, {
      name: 'this',
      init: ctx,
      pointer: ctx
    });
    return ctx;
  }

  return node.parent.context;
}



// ---


hooks.VariableDeclaration = function(node, globals){
  node.declarations.forEach(function(declarator){

    var init;
    if (declarator.init) {
      init = (declarator.init.type === 'ThisExpression')? 'this' : declarator.init.value;
    }

    addVarToScope(node, {
      name: declarator.id.name,
      init: init
    });

    if (node.parent.type === 'Program') {
      insert(globals, declarator.id.name);
    }
  });
};


function addVarToScope(node, declarator) {
  // pointer is a reference to the original var value
  // in case the "init" points to another identifier
  if (!declarator.pointer) {
    if (declarator.init === 'this'){
      declarator.pointer = node.context;
    } else {
      var p = find(node.scope, {name: declarator.init});
      if (p) {
        declarator.pointer = p.init;
      } else {
        declarator.pointer = declarator.init;
      }
    }
  }

  // need to remove previous var (since we overwrite the value)
  node.scope.forEach(function(d, i, arr){
    if (d.name === declarator.name) {
      arr.splice(i, 1);
    }
  });

  node.scope.push(declarator);
}


hooks.AssignmentExpression = function(node, globals){
  var left = node.left;

  if (left.type === 'MemberExpression') {
    if (( left.object.type === 'ThisExpression' && isGlobal(node, 'this') ) ||
       (left.object.type === 'Identifier' && isGlobal(node, left.object.name))) {
      insert(globals, left.property.name);
    }
    return;
  }

  if (left.type === 'Identifier') {
    // if identifier doesn't exist on scope it's an implied global
    if ( isGlobal(node, left.name) ) {
      insert(globals, left.name);
    }
    return;
  }
};


function isGlobal(node, varName){
  var declaration = find(node.scope, {name: varName});
  return !declaration ||
    IMPLIED_GLOBALS.indexOf(declaration.pointer) !== -1 ||
    (varName === 'this' && node.context === GLOBAL_CONTEXT);
}


