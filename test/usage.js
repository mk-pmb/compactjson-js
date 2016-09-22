/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

module.exports = function usageDemo(require, console) {
  //#u
  var compactjson = require('compactjson'),
    data = { opts: compactjson.defaultOpts, '!': 1,
      tasks: [ 'wash cat', 'eat some vegetables', 'sort arrays (not)' ],
      dex: { kadabra: 64, abra: 63 },
      types: { num: -123.45, bool: false, Obj: {}, },
      q1: [], q2: [], q3: [ true, true ], q4: [], q5: [[[[[]]]]]
      },
    jsonStr = compactjson(data, { width: 64 });
  console.log(jsonStr);
  //#r
  //= `{ "!": 1, "dex": { "abra": 63, "kadabra": 64 },`
  //= `  "opts": { "breakAfterBroken": true,`
  //= `    "breakAfterContainer": "unless-empty", "indent": 2,`
  //= `    "maxItemsPerLine": 4, "serializer": null,`
  //= `    "sortKeys": true, "width": 79 },`
  //= `  "q1": [], "q2": [], "q3": [ true, true ],`
  //= `  "q4": [], "q5": [ [ [ [ [] ] ] ] ],`
  //= `  "tasks": [ "wash cat", "eat some vegetables", "sort arrays (not)" ],`
  //= `  "types": { "Obj": {}, "bool": false, "num": -123.45 } }`
  //#e
  usageDemo.data = data;
  usageDemo.json = jsonStr;
};





if (require.main === module) { module.exports(require, console); }
