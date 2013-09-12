var fs = require('fs');
var detect = require('../index');

describe('detectGlobals', function() {

  it('should detect globals and ignore false positives', function() {
    var globals = detect.fromFile(__dirname+'/cases.js');
    globals.should.eql([
      'a',
      'a2',
      'b',
      'b2',
      'fn1',
      'a3',
      'a4',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'k2'
    ]);
  });

});

