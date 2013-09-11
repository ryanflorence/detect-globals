var fs = require('fs');
var detect = require('../index');

describe('detectGlobals', function() {

  it('detects globals', function() {
    var globals = detect.fromFile(__dirname+'/cases.js');
    // checks for matches and false positives
    globals.should.eql([
      'a',
      'a2',
      'b',
      'b2',
      'fn1',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j'
    ]);
  });

});

