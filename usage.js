/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

module.exports = function usageDemo(require, console) {
  //++
  var compactjson = require('compactjson'), data, jsonStr,
    assert = require('assert');

  data = { '_': 'hello',
    opts: compactjson.defaultOpts,
    tasks: [ 'wash cat', 'eat some vegetables', 'sort arrays (not)' ],
    dex: { kadabra: 64, abra: 63, hocus: null },
    types: { num: -123.45, bool: false, Obj: {}, arr: [] }
    };
  jsonStr = compactjson(data, { width: 71 });

  assert.deepStrictEqual(JSON.parse(jsonStr), data);
  console.log(jsonStr);
  //--
  //= `{ "_": "hello", "dex": { "abra": 63, "hocus": null, "kadabra": 64 },`
  //= `  "opts": { "forceBreakAfterContainer": true, "indent": 2,`
  //= `    "maxItemsPerLine": 4, "serializer": null, "sortKeys": true,`
  //= `    "width": 79 },`
  //= `  "tasks": [ "wash cat", "eat some vegetables", "sort arrays (not)" ],`
  //= `  "types": { "Obj": {},`
  //= `    "arr": [],`
  //= `    "bool": false, "num": -123.45 } }`
};

if (require.main === module) { module.exports(require, console); }
