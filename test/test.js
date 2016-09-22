/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var EX = module.exports, fs = require('fs'),
  testDirPathPrefix = module.filename.replace(/\w+\.js$/, ''),
  async = require('async'),
  usageDemo = require('./usage.js'),
  compactjson = require('compactjson'),
  genDiff = require('generic-diff'),
  assert = require('assert'), eq = assert.deepStrictEqual,
  testsByName = Object.create(null);


function bindMthd(ctx, mthd, args) {
  return Function.bind.apply(ctx[mthd], [ctx].concat(args || []));
}


EX.runFromCLI = function () {
  var tests = process.argv.slice(2);
  tests = (tests.length ? tests.map(EX.jsonFileTest) : [

    // test ALL the JSONs!
    bindMthd(fs, 'readdir', testDirPathPrefix),
    EX.findJsonTests,
    async.parallel,
    EX.callLastArg,

    // This one is so ugly JSON that I rather pretend it's just random text
    // than explain to jslint why I'd ever want *ugly* JSON files.
    EX.jsonFileTest('.', 'indent-tabs.json.txt'),

    // run usage test last: in case it fails, hopefully the other tests
    // have already provided detailed hints why.
    EX.verifyUsageDemo,
  ]);
  async.waterfall(tests, function (err) {
    if (err) {
      console.error('-ERR ' + String(err.message || err));
      return process.exit(4);
    }
    console.log('+OK all tests passed');
  });
};


EX.callLastArg = function () { arguments[arguments.length - 1](); };


EX.verifyUsageDemo = function (next) {
  var req = function (mod) { return req[mod]; }, cons = [];
  req.assert = assert;
  req.compactjson = compactjson;
  cons.log = function () { cons.push(cons.slice.call(arguments)); };
  usageDemo(req, cons);
  eq(JSON.parse(usageDemo.json), usageDemo.data);
  cons.expect = String(usageDemo).split(/`(?:\n[\s\/=]*`|)/).slice(1, -1);
  EX.textEq(cons, cons.expect, 'verifyUsageDemo', next);
};


EX.textEq = function (actual, expect, testName, next) {
  if (testsByName[testName] !== undefined) {
    throw new Error('duplicate test name: ' + testName);
  }
  // normalize line endings: first join (if required),
  // then split (again) if we need to.
  if (Array.isArray(actual)) { actual = actual.join('\n'); }
  if (Array.isArray(expect)) { expect = expect.join('\n'); }
  if (actual === expect) {
    console.log('· ' + testName);
    testsByName[testName] = true;
    if (next) { setImmediate(next, null); }
    return true;
  }
  console.log('! ' + testName);
  genDiff(expect.split('\n'), actual.split('\n')).forEach(function (part) {
    var pfx = ' ' + ((part.added && '+') || (part.removed && '-') || ' ');
    console.log(pfx + part.items.join('\n' + pfx));
  });
  testsByName[testName] = false;
  if (next) { setImmediate(next, new Error('Test failed: ' + testName)); }
  return false;
};


EX.findJsonTests = function (dirItems, next) {
  var tests = dirItems.filter(bindMthd(/\.json$/, 'exec')
    ).sort().map(EX.jsonFileTest.bind(null, '.'));
  next(null, tests);
};


EX.jsonFileTest = function (fn, absFn) {
  if (fn === '.') {
    fn = absFn;
    absFn = testDirPathPrefix + fn;
  }
  return EX.withFileText(absFn || fn, EX.optionsTestJson, [fn]);
};


EX.withFileText = function (srcFn, testFunc, args, ctx) {
  if (args === true) { args = [srcFn]; }
  return function (whenTested) {
    fs.readFile(srcFn, 'UTF-8', function (err, text) {
      if (err) { return whenTested(err); }
      return testFunc.apply((ctx || null),
        [text].concat((args || []), whenTested));
    });
  };
};


EX.optionsTestJson = function (allTests, srcFn, whenAllTested) {
  var failCnt = 0;
  allTests = allTests.split(/\n\[/).slice(1);
  allTests.byName = Object.create(null);
  allTests.map(function (test, expect) {
    test = test.split(/\n\]/)[0];
    expect = (test.split(/\},\n(?: {2}|\t)(?=\S)/)[1] || ''
              ).replace(/\n(?: {2}|\t)/g, '\n');
    try {
      test = JSON.parse('[' + test + ']');
    } catch (parseErr) {
      console.error('-ERR', (parseErr.message || parseErr), '@ test',
        test.split(/^\s*|,\n\{|\\n/)[1].replace(/\s+/g, ' ').slice(0, 64));
      failCnt += 1;
      return;
    }
    test.expect = expect;
    test.name = '';
    while ((typeof test[0]) === 'string') { test.name += test.shift(); }
    test.name = '[' + srcFn + '] ' + test.name.split(/\n/)[0];
    test.opt = test.shift();
    if (test.opt === false) { return; }
    test.data = test.shift();
    if (test.length !== 0) {
      throw new Error('unexpected additional data in test "'
        + test.name + '": ' + compactjson(test));
    }
    return test;
  }).map(function (test) {
    if (!test) { return; }
    test.actual = compactjson(test.data, test.opt);
    EX.testVerifyLineLengths(test);
    if (!EX.textEq(test.actual, test.expect, test.name)) { failCnt += 1; }
  });
  whenAllTested(failCnt === 0 ? null
    : new Error('Failures in tests from file: ' + srcFn));
};


EX.testVerifyLineLengths = function (test) {
  var expectLL = test.opt['TEST:verifyLineLengths'], actualLL;
  if (!expectLL) { return ''; }
  actualLL = test.actual.split(/\n/).map(function (s) { return s.length; });
  actualLL.glue = ', ';
  if (expectLL[0] === 'max') {
    actualLL = [ actualLL, 0, '@', 0 ];
    actualLL[0].forEach(function (len, idx) {
      if (len > actualLL[1]) {
        actualLL[1] = len;
        actualLL[3] = idx;
      }
    });
    actualLL[0] = 'max';
    actualLL.glue = ' ';
  }
  actualLL.pfx = '\n// line lengths: ';
  test.actual += actualLL.pfx + actualLL.join(actualLL.glue);
  test.expect += actualLL.pfx + expectLL.join(actualLL.glue);
};

















if (require.main === module) { EX.runFromCLI(); }
