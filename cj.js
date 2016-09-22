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
    x = EX.jsonify(x, opt, opt.width).join('\n');
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


  EX.jsonify = function (x, opt, width, finalAppendage) {
    if (x === undefined) { return 'null'; }
    if ((x && typeof x) !== 'object') {
      return [JSON.stringify(x, opt.serializer, opt.indent
        ) + (finalAppendage || '')];
    }
    var buf = { jsonLines: [], curLn: '', itemsInLine: 0,
      curWidth: width,
      subWidth: width - opt.indent.length
      };
    buf.items = EX.containerToLines(x, buf, opt);
    buf.curLn = buf.items.brak[0];
    if (buf.items.length === 0) { return [buf.items.brak + finalAppendage]; }
    buf.end = buf.items.brak[1] + (finalAppendage || '');
    buf.items.forEach(EX.appendItem.bind(null, buf, opt, ' '));
    //EX.appendItem(buf, opt, (buf.items.length && ' '), buf.end);
    EX.finishLine(buf, opt);
    buf.jsonLines.push(buf.end);
    console.dir({ jsonified: buf.jsonLines });
    return buf.jsonLines;
  };


  EX.appendItem = function (buf, opt, preSep, item) {
    if (!item) { return; }
    if ((typeof item) !== 'string') {
      throw new Error('can only append strings, not ' + JSON.stringify(item));
    }
    if (!preSep) { preSep = ''; }
    var fits = EX.checkItemFit(buf, opt, preSep, item);
    //* <-- to un-comment .debugFit, add another slash in front.
    if (opt.debugFit) {
      console.error({ fit: [ (buf.curLn.length + item.length),
        buf.curWidth, (fits ? ', ' : ' ¶')], cur: buf.curLn, add: item });
    } // */
    if (fits) {
      buf.curLn += preSep + item;
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


  EX.prevItemWasContainer = function (buf) {
    return EX.charWhich(buf.curLn, ']}', -2);
  };                //  buf.curLn       [-1] = ','


  EX.checkItemFit = function (buf, opt, preSep, item) {
    if (buf.itemsInLine === 0) { return true; }
    var lengthEstimate, isValue = !EX.charWhich(item, ']}', 0);

    if (isValue) {
      if (buf.itemsInLine >= opt.maxItemsPerLine) { return false; }
      if (opt.breakAfterBroken && (item.indexOf('\n')) !== -1) { return false; }
    }

    lengthEstimate = buf.curLn.length + preSep.length + item.length;
    if (lengthEstimate > buf.curWidth) { return false; }

    if (isValue && EX.prevItemWasContainer(buf)) {
      switch (opt.breakAfterContainer) {
      case true:
        return false;
      case 'unless-empty':
        if (!EX.charWhich(buf.curLn, '{[', -3)) { return false; }
        break;
      }
    }

    return true;
  };


  EX.finishLine = function (buf, opt, startNext) {
    ignVar(opt);
    if (buf.curLn) { buf.jsonLines.push(buf.curLn); }
    buf.curLn = '';
    buf.itemsInLine = 0;
    if (startNext) {
      buf.curLn = opt.indent + startNext;
      buf.itemsInLine += 1;
    }
  };


  EX.keyLine = function (obj, buf, opt, lastIdx, val, idx) {
    var key = '';
    if (obj) {
      key = JSON.stringify(val, opt.serializer, 0) + ': ';
      val = obj[val];
    }
    val = EX.jsonify(val, opt, buf.subWidth,
      (idx < lastIdx ? ',' : ''));
    console.dir({ keyLineVal: val });
    if (key) {
      val[0] = key + val[0];
      console.dir({ keyLine: val });
    }
    return val;
  };


  EX.containerToLines = function (x, buf, opt) {
    var keys = (Array.isArray(x) ? null : Object.keys(x)),
      lastIdx = (keys || x).length - 1;
    if (keys && opt.sortKeys) {
      keys = (opt.sortKeys === true ? keys.sort() : keys.sort(opt.sortKeys));
    }
    x = (keys || x).map(EX.keyLine.bind(null, (keys && x),
      buf, opt, lastIdx));
    x.brak = (keys ? '{}' : '[]');
    return x;
  };









  return EX;
}());
