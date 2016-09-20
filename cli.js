/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var jsonify = require('compactjson'), fs = require('fs');


function reformatJson(err, data) {
  if (err) {
    console.error(err);
    return process.exit(4);
  }
  data = JSON.parse(data);
  console.log(jsonify(data));
}



function cliReadJson(next) {
  var srcFn = process.argv[2];
  switch (srcFn) {
  case undefined:
    if (process.stdin.isTTY) {
      console.error('I: Gonna read JSON from stdin.');
    }
    srcFn = 0;
    break;
  case '-':
    srcFn = 0;
    break;
  }
  fs.readFile(srcFn, 'UTF-8', next);
}



cliReadJson(reformatJson);
