Detect Globals
==============

This doesn't work.

Please fork and make it work and I'll send you flowers.

I've included the test cases I care about, anything else would be a
huge bonus.

Run tests with `npm test`, or `npm run-script watch-test`.

API is simple, it should return an array of what the browser would put
on window.

```js
var detect = require('detect-globals');
detect("var a = 'a'; this.b = 'b';");
// [ 'a', 'b' ]
```

