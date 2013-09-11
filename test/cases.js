// 1
var a = 'a',
    a2 = 'a2';

// 2
this.b = 'b';

// 3
(function(win) {
  win.a = 'ac';
  win.c = 'c';
})(window);

// 4
(function(win) {
  var da;
  da = win.d = 'd';
  var db = win.e = 'e';
})(window);

// 5
(function() {
  this.f = 'f';
}).call(this);

// 6
(function() {
  var ga = this;
  var gb = ga.g = 'g';
  var gc;
  gc = ga.h = 'h';
}).call(this);

// 7
i = 123;

// 8
(function() {
  this.j = 4;
}).call(null);


/*********** false positive tests *****************/

// 9
(function(window) {
  window.y = 'y';
  function foo(){
    window.y2 = 'y2';
  }
})({});

// 10
(function() {
  this.z = 'z';
}).call({});

// 11
(function(window, undefined){
  foo.bar = function(arg){
    return arg + 1;
  };
}(window));


