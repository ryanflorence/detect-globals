Detect Globals
==============

This is not complete!

It gets globals, and a few other things as well. Looking for any help I
can get on this module.

Run tests with `npm test`, or `npm run-script watch-test`.

API is simple, it should return an array of what the browser would put
on window. It puts a lot more than that right now though.

```js
var detect = require('detect-globals');
detect("var a = 'a'; this.b = 'b';");
// [ 'a', 'b' ]
```

