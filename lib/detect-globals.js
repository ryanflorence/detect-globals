// jshint node:true
"use strict";


var traverse = require('./traverse');
var find = require('mout/array/find');
var insert = require('mout/array/insert');


// ---


var IMPLIED_GLOBALS = {'window':1, 'document':1};
var GLOBAL_CONTEXT = 'window';
var CUSTOM_CONTEXT = '__CUSTOM_CONTEXT__';


// ---


// simplify and delegate logic
var hooks = {};
var _globals;
var _root;


// ---


module.exports = function(ast) {
  _globals = [];
  _root = ast;

  traverse(ast, function(node, parent){
    node.parent = parent;
    setupScope(node);
    setupContext(node);

    if (node.type in hooks) {
      hooks[node.type](node);
    }
  });

  _root = null;
  return _globals;
};


// ---


function setupScope(node) {
  // by default reuse parent scope
  node.scope = (node.type === 'Program')? [] : node.parent.scope;

  if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
    // Functions create a new "scope" that "augments" parent scope
    node.scope = node.parent.scope.slice();
  }
}


// gets reference to the "this" value
function setupContext(node) {
  if (node.type === 'Program') {
    node.context = GLOBAL_CONTEXT;
    return;
  }

  // default context is the parent context
  node.context = node.parent.context;

  // IIFE (function(win){ win.x = 'x' }(window))
  if ( isIIFE(node) ) {
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
    node.context = node.parent.context;
    return;
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

    node.context = ctx;
    return;
  }

  if ((node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') && !isIIFE(node.parent)) {
    // params are "free variables"
    node.params.forEach(function(param){
      addVarToScope(node, {
        name: param.name,
        init: undefined
      });
    });

    // by default we assume that all properties of object use "this" to referece
    // itself even tho this might not be true depending on how the method is
    // called
    if (node.parent.type === 'Property' ||
        (node.parent.type === 'AssignmentExpression' &&
         node.parent.left.type === 'MemberExpression')) {
      node.context = CUSTOM_CONTEXT;
      return;
    }
  }

}


function isIIFE(node){
  return node.type === 'CallExpression' && node.callee.type === 'FunctionExpression';
}



// ---


hooks.VariableDeclaration = function(node){
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
      addGlobal(declarator.id.name);
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
      var p = getVar(node, declarator.init);
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


function addGlobal(varName){
  insert(_globals, varName);
}


hooks.AssignmentExpression = function(node){
  var left = node.left;

  if (left.type === 'MemberExpression') {
    if (( left.object.type === 'ThisExpression' && pointsToGlobal(node, 'this') ) ||
       (left.object.type === 'Identifier' && pointsToGlobal(node, left.object.name))) {
      // property can be a Literal obj['foo'] or an Identifier `obj.bar`
      var prop = left.property;
      addGlobal(prop.name || prop.value);
    }
    return;
  }

  // if identifier doesn't exist on scope it's an implied global
  if (left.type === 'Identifier' && notInScope(node, left.name) ) {
    addGlobal(left.name);
  }
};


hooks.FunctionDeclaration = function(node){
  if (node.parent.scope === _root.scope) {
    addGlobal(node.id.name);
  }
};


function pointsToGlobal(node, varName){
  var declaration = getVar(node, varName);
  return (declaration && declaration.pointer in IMPLIED_GLOBALS) ||
    (varName === 'this' && node.context === GLOBAL_CONTEXT) ||
    (!declaration && varName in IMPLIED_GLOBALS);
}


function notInScope(node, varName){
  return !getVar(node, varName);
}


function getVar(node, varName){
  return find(node.scope, {name: varName});
}

