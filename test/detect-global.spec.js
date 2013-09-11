var fs = require('fs');
var detect = require('../index');

describe('detectGlobals', function() {

  it('detects globals', function() {
    var globals = detect.fromFile(__dirname+'/cases.js');
    globals.should.contain('a');
    globals.should.contain('a2');
    globals.should.contain('b');
    globals.should.contain('c');
    globals.should.contain('d');
    globals.should.contain('e');
    globals.should.contain('f');
    globals.should.contain('g');
    globals.should.contain('h');
    globals.should.contain('i');

    // checks for false positives
    globals.should.eql([
      'a',
      'a2',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i'
    ]);
  });

});

