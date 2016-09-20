
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
from [usage.js](usage.js):

<!--#include file="usage.js" start="  //++" stop="  //--" code="javascript"
  outdent="  " -->
<!--#verbatim lncnt="15" -->
```javascript
var compactjson = require('compactjson'), data, jsonStr,
  assert = require('assert');

data = { '_': 'hello',
  opts: compactjson.defaultOpts,
  tasks: [ 'wash cat', 'eat some vegetables', 'sort arrays (not)' ],
  dex: { kadabra: 64, abra: 63, hocus: null },
  types: { num: -123.45, bool: false, Obj: {} }
  };
jsonStr = compactjson(data, { width: 71 });

assert.deepStrictEqual(JSON.parse(jsonStr), data);
console.log(jsonStr);
```
<!--/include-->

Result:

<!--#include file="usage.js" start="  //--" stop="};" code="json"
  cut-head="//= `" cut-tail="`" -->
<!--#verbatim lncnt="9" -->
```json
{ "_": "hello", "dex": { "abra": 63, "hocus": null, "kadabra": 64 },
  "opts": { "forceBreakAfterContainer": true, "indent": 2,
    "maxItemsPerLine": 4, "serializer": null, "sortKeys": true,
    "width": 79 },
  "tasks": [ "wash cat", "eat some vegetables", "sort arrays (not)" ],
  "types": { "Obj": {},
    "bool": false, "num": -123.45 } }
```
<!--/include-->

```bash
$ compactjson foo
bar
```

```javascript
var compactjson = require('compactjson');
D.result  = compactjson(null);
D.expect('===',           null);
```


<!--#toc stop="scan" -->


  [compact-json]: https://www.npmjs.com/package/compact-json


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
