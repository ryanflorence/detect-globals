// borrowed from rocambole (https://github.com/millermedeiros/rocambole)
// released under MIT license
// since BYPASS_RECURSION is private we can't override it to ignore the
// "context" (needed to store variables on that context)
// XXX: change rocambole to allow overriding the recursion


var BYPASS_RECURSION = {
    root : true,
    comments : true,
    tokens : true,
    context: true,

    loc : true,
    range : true,

    parent : true,
    next : true,
    prev : true,

    // IMPORTANT! "value" can't be bypassed since it is used by object
    // expression
    type : true,
    raw : true,

    startToken : true,
    endToken : true
};



module.exports = function recursiveWalk(node, fn, parent, prev, next){

    if ( fn(node, parent, prev, next) === false ) {
        return; // stop recursion
    }

    // faster than for in
    var keys = Object.keys(node),
        child, key;

    for (var i = 0, nKeys = keys.length; i < nKeys; i++) {

        key = keys[i];
        child = node[key];

        // only need to recurse real nodes and arrays
        // ps: typeof null == 'object'
        if (!child || typeof child !== 'object' || BYPASS_RECURSION[key]) {
            continue;
        }

        // inception
        if (typeof child.type === 'string') { // faster than boolean coercion
            recursiveWalk(child, fn, node);
        } else if ( typeof child.length === 'number' ) { // faster than Array.isArray and boolean coercion
            // faster than forEach
            for (var k = 0, nChilds = child.length; k < nChilds; k++) {
                recursiveWalk(child[k], fn, node, (k? child[k - 1] : undefined), child[k + 1] );
            }
        }

    }

}
