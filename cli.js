#!/usr/bin/env nodejs
/*jslint indent: 2, maxlen: 80, node: true */
/* -*- coding: utf-8, tab-width: 2 -*- */
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


function fromStream(st, next) {
  var buf = '';
  st.once('error', function (err) {
    if (!next) { return; }
    setImmediate(next, err);
    next = null;
  });
  st.once('end', function () {
    if (!next) { return; }
    setImmediate(next, null, buf);
    next = null;
  });
  st.on('readable', function () { buf += String(st.read() || ''); });
}


function readFileOrStdin(next) {
  var srcFn = process.argv[2];
  switch (srcFn) {
  case undefined:
    if (process.stdin.isTTY) {
      console.error('I: Gonna read JSON from stdin.');
    }
    return fromStream(process.stdin, next);
  case '-':
    srcFn = 0;
    return fromStream(process.stdin, next);
  }
  return fs.readFile(srcFn, 'UTF-8', next);
}



readFileOrStdin(reformatJson);
