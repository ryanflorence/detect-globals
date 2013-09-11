var a = 'a';
this.b = 'b';

(function(win) {
  win.c = 'c';
})(window);

(function(win) {
  var a;
  a = win.d = 'd';
  var b = win.e = 'e';
})(window);

(function() {
  this.f = 'f';
}).call(this);

(function() {
  var a = this;
  var b = a.g = 'g';
  var c;
  c = a.h = 'h';
}).call(this);

/*********** false positive tests *****************/

(function(window) {
  window.y = 'y';
})({});

(function() {
  this.z = 'z';
}).call({});

