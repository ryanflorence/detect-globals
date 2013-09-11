// 1
var a = 'a',
    a2 = 'a2';

// 2
this.b = 'b';

// 3
(function(win) {
  win.c = 'c';
})(window);

// 4
(function(win) {
  var a;
  a = win.d = 'd';
  var b = win.e = 'e';
})(window);

// 5
(function() {
  this.f = 'f';
}).call(this);

// 6
(function() {
  var a = this;
  var b = a.g = 'g';
  var c;
  c = a.h = 'h';
}).call(this);

// 7
i = 123;


/*********** false positive tests *****************/

// 8
(function(window) {
  window.y = 'y';
})({});

// 9
(function() {
  this.z = 'z';
}).call({});


