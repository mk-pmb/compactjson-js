/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';


module.exports = (function () {
  var EX, ignVar = Boolean;


  EX = function compactJSONify(x, opt) {
    if (!opt) { opt = false; }
    opt = Object.assign({}, EX.defaultOpts, opt);
    opt.width = (+opt.width || 0);
    if (!opt.indent) { return JSON.stringify(x, opt.serializer, 0); }
    if ((typeof opt.indent) === 'number') {
      opt.indent = EX.spaces(opt.indent);
    }
    x = EX.jsonify(x, opt, '', opt.width);
    return x;
  };


  EX.defaultOpts = {
    breakAfterBroken: true,
    breakAfterContainer: 'unless-empty',
    indent: 2,
    maxItemsPerLine: 4,
    serializer: null,
    sortKeys: true,
    width: 79,
  };


  EX.spaces = function (n) {
    n = (+n || 0);
    if (n < 1) { return ''; }
    var spc = '                                                  ';
    while (spc.length < n) { spc += spc; }
    return spc.slice(0, n);
  };


  EX.jsonify = function (x, opt, curIndent, width) {
    if (x === undefined) { return 'null'; }
    if ((x && typeof x) !== 'object') {
      return JSON.stringify(x, opt.serializer, opt.indent);
    }
    var buf = { jsonLines: '', curLn: '', itemsInLine: 0,
      curIndent: curIndent,
      subIndent: curIndent + opt.indent,
      curWidth: width,
      subWidth: width - opt.indent.length
      };
    buf.items = EX.containerToLines(x, buf, opt);
    buf.curLn = buf.items.brak[0];
    buf.items.forEach(EX.appendItem.bind(null, buf, opt));
    EX.appendEndBrak(buf.items.brak[1], buf, opt);
    EX.finishLine(buf, opt);
    return buf.jsonLines;
  };


  EX.appendItem = function (buf, opt, item) {
    var fits = EX.checkItemFit(buf, opt, item);
    // if (opt.debugFit) {
    //   console.error(['fit?', (buf.curLn.length + item.length),
    //     buf.curWidth, (fits ? '+' : '¶')], buf.curLn, item);
    // }
    if (fits) {
      buf.curLn += ' ' + item;
      buf.itemsInLine += 1;
    } else {
      EX.finishLine(buf, opt, item);
    }
  };


  EX.charWhich = function (ch, list, idx) {
    if (!ch) { return 0; }
    if (idx < 0) { idx += ch.length; }
    return list.indexOf(ch[idx || 0]) + 1;
  };


  EX.checkItemFit = function (buf, opt, item) {
    if (buf.itemsInLine === 0) { return true; }
    if (buf.itemsInLine >= opt.maxItemsPerLine) { return false; }
    if (opt.breakAfterBroken && (item.indexOf('\n')) !== -1) { return false; }
    var lengthEstimate = buf.curLn.length + 1 + item.length;
    if (lengthEstimate > buf.curWidth) { return false; }

    switch (opt.breakAfterContainer) {
    case true:
      // buf.curLn[-1] = ','
      if (EX.charWhich(buf.curLn, ']}', -2)) { return false; }
      break;
    case 'unless-empty':
      if (EX.charWhich(buf.curLn, ']}', -2)) {
        if (!EX.charWhich(buf.curLn, '{[', -3)) { return false; }
      }
      break;
    }

    return true;
  };


  EX.finishLine = function (buf, opt, startNext) {
    ignVar(opt);
    if (buf.curLn) {
      if (buf.jsonLines) { buf.jsonLines += '\n'; }
      buf.jsonLines += buf.curLn;
    }
    buf.curLn = (startNext ? buf.subIndent + startNext : '');
    buf.itemsInLine = (startNext ? 1 : 0);
  };


  EX.appendEndBrak = function (brak, buf, opt) {
    EX.finishLine(buf, opt);
    var spBrak = (buf.items.length > 0 ? ' ' : '') + brak;
    if ((buf.curLn.length + spBrak.length) <= buf.curWidth) {
      buf.jsonLines += spBrak;
    } else {
      buf.jsonLines += '\n' + buf.curIndent + brak;
    }
  };


  EX.keyLine = function (obj, buf, opt, lastIdx, val, idx) {
    var key = '';
    if (obj) {
      key = JSON.stringify(val, opt.serializer, 0) + ': ';
      val = obj[val];
    }
    val = key + EX.jsonify(val, opt, buf.subIndent, buf.subWidth);
    if (idx < lastIdx) { val += ','; }
    return val;
  };


  EX.containerToLines = function (x, buf, opt) {
    var keys = (Array.isArray(x) ? null : Object.keys(x)),
      lastIdx = (keys || x).length - 1;
    if (keys && opt.sortKeys) {
      keys = (opt.sortKeys === true ? keys.sort() : keys.sort(opt.sortKeys));
    }
    x = (keys || x).map(EX.keyLine.bind(null, (keys && x), buf, opt, lastIdx));
    x.brak = (keys ? '{}' : '[]');
    return x;
  };









  return EX;
}());
