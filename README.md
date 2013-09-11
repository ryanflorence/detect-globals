Detect Globals
==============

This doesn't work. I want to use it in conjunction with
[bower-import](https://github.com/rpflorence/bower-import) to make an
assumption about what to export from a non-amd supporting script so the
whole tool can be automated and transparent to users. (The code
currently prompts the user [here](https://github.com/rpflorence/bower-import/blob/master/index.js#L31-L44).)

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

