var a = 'a',
    a2 = 'a2';

this.b = 'b';

function fn1(arg1){
  arg1 = 'arg1';
  function fn2(){
    arg1 = 'arg2';
  }
}

(function(win) {
  win.a = 'ac';
  win.c = 'c';
})(window);

(function(win) {
  var da;
  da = win.d = 'd';
  var db = win.e = 'e';
})(window);

(function() {
  this.f = 'f';
}).call(this);

(function() {
  var ga = this;
  var gb = ga.g = 'g';
  var gc;
  gc = ga.h = 'h';
}).call(this);

i = 123;

(function() {
  this.j = 4;
}).call(null);


/*********** false positive tests *****************/

(function(window) {
  window.y = 'y';
  function foo(){
    window.y2 = 'y2';
  }
})({});

(function() {
  this.z = 'z';
}).call({});

(function(window, undefined){
  foo.bar = function(arg){
    return arg + 1;
  };
}(window));

(function(){
  var obj = {
    setName: function(name){
      this.name = name;
    }
  };
  obj.reset = function(){
    this.color = null;
  };
}());

(function(){
  function fn(val){
    val = 123;
  }
}());

(function(){
  var foo = getBar(function(lang){
    lang = 'lang';
  });
}());

