
<!--#echo json="package.json" key="name" underline="=" -->
compactjson
===========
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
JSON.stringify(data) with fewer mostly-blank lines.
<!--/#echo -->

Mnemonic: [`compact-json`][compact-json] has the -dash- in its name
to remind you that it produces a -dash- bullet list, not JSON.


Usage
-----
from [test/usage.js](test/usage.js):

<!--#include file="test/usage.js" start="  //#u" stop="  //#r"
  outdent="  " code="javascript" -->
<!--#verbatim lncnt="11" -->
```javascript
var compactjson = require('compactjson'),
  data = { opts: compactjson.defaultOpts, '!': 1,
    tasks: [ 'wash cat', 'eat some vegetables', 'sort arrays (not)' ],
    dex: { kadabra: 64, abra: 63 },
    types: { num: -123.45, bool: false, Obj: {}, arr: [] },
    q1: [], q2: [], q3: [ true, true ], q4: [], q5: [],
    },
  jsonStr = compactjson(data, { width: 64 });
console.log(jsonStr);
```
<!--/include-->

Result:

<!--#include file="usage.js" start="  //#r" stop="  //#e" code="json"
  cut-head="//= `" cut-tail="`" -->
<!--#verbatim lncnt="11" -->
```json
{ "!": 1, "dex": { "abra": 63, "kadabra": 64 },
  "opts": { "breakAfterBroken": true,
    "breakAfterContainer": "unless-empty", "indent": 2,
    "maxItemsPerLine": 4, "serializer": null,
    "sortKeys": true, "width": 79 },
  "q1": [], "q2": [], "q3": [ true, true ],
  "q4": [], "q5": [],
  "tasks": [ "wash cat", "eat some vegetables", "sort arrays (not)" ],
  "types": { "Obj": {}, "arr": [], "bool": false, "num": -123.45 } }
```
<!--/include-->

CLI:

```bash
$ compactjson package.json | grep main
  "license": "ISC", "main": "cj.js", "name": "compactjson",
```


Options
-------
For defaults, see `"opts": { … }` above.
For edge cases, see [the tests](test/).

  * `indent`: A string, or the number of spaces, to be used for indentation.
  * `breakAfterBroken`: (bool) Whether to force a new line after any value
    whose JSON encoding contained a line break.
  * `breakAfterContainer`:
    * `false`: Data containers have no special effect on line wrap.
    * `true`: Force a new line after any container.
    * `'unless-empty'`: Empty containers have no special effect on line wrap,
      but force a new line after any that actually contain data.
  * `maxItemsPerLine`: Force a new line in front of the next value
    if the current line already contains this many values.
  * `serializer`: The 2nd argument for any call to native `JSON.stringify`.
  * `sortKeys`: (bool or func) Secret ninja option.
  * `width`: Try to keep lines at most this long.



Caveats
-------
  * Line width for wrapping measures items in JavaScript native string length
    (= UCS-2 characters) and thus produces unexpectedly short lines if there
    are lots of high Unicode characters in them.






<!--#toc stop="scan" -->


  [compact-json]: https://www.npmjs.com/package/compact-json


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
