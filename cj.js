/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

module.exports = (function () {
  function spaces(n) {
    n = (+n || 0);
    if (n < 1) { return ''; }
    var spc = '                                                  ';
    while (spc.length < n) { spc += spc; }
    return spc.slice(0, n);
  }

  function jsonify(x, opt, curIndent, width) {
    if (x === undefined) { return 'null'; }
    if ((x && typeof x) !== 'object') {
      return JSON.stringify(x, opt.serializer, opt.indent);
    }
    var jsonLines = '', curLnBuf, itemsInLine = 0,
      subIndent = curIndent + opt.indent,
      subWidth = width - opt.indent.length;
    x = jsonify.toLines(x, opt, subIndent, subWidth);
    x.lastIdx = x.length - 1;
    curLnBuf = x.brak[0];
    x.addItem = function (item, idx) {
      if (idx < x.lastIdx) { item += ','; }
      var fits = (itemsInLine === 0), prevItemEndChar;
      if (!fits) {
        fits = ((item.indexOf('\n') === -1)
          && ((curLnBuf.length + item.length) < subWidth)
          && (itemsInLine < opt.maxItemsPerLine)
          );
        if (fits && opt.forceBreakAfterContainer) {
          prevItemEndChar = curLnBuf[curLnBuf.length - 2];
          fits = ((prevItemEndChar !== ']') && (prevItemEndChar !== '}'));
        }
      }
      if (fits) {
        curLnBuf += ' ' + item;
        itemsInLine += 1;
      } else {
        jsonLines += curLnBuf;
        curLnBuf = subIndent + item;
        itemsInLine = 1;
      }
    };
    x.forEach(x.addItem);
    if (curLnBuf) {
      jsonLines += curLnBuf;
      curLnBuf = '';
    }
    x.endBrak = (x.length > 0 ? ' ' : '') + x.brak[1];
    if ((curLnBuf.length + x.endBrak.length) <= width) {
      jsonLines += x.endBrak;
    } else {
      jsonLines += curIndent + x.brak[1];
    }
    return jsonLines;
  }


  jsonify.toLines = function (x, opt, subIndent, subWidth) {
    if (Array.isArray(x)) {
      x = x.map(function (val) {
        val = jsonify(val, opt, subIndent, subWidth);
        return val;
      });
      x.brak = '[]';
      return x;
    }
    var keys = Object.keys(x);
    if (opt.sortKeys) {
      keys = (opt.sortKeys === true ? keys.sort() : keys.sort(opt.sortKeys));
    }
    x = keys.map(function (key) {
      var val = jsonify(x[key], opt, subIndent, subWidth);
      return (JSON.stringify(key) + ': ' + val);
    });
    x.brak = '{}';
    return x;
  };



  function compactJSONify(data, opt) {
    if (!opt) { opt = false; }
    opt = Object.assign({}, compactJSONify.defaultOpts, opt);
    opt.width = (+opt.width || 0);
    if (opt.width > 1) {
      if ((typeof opt.indent) === 'number') { opt.indent = spaces(opt.indent); }
    } else {
      opt.indent = 0;
    }
    if (!opt.indent) { return JSON.stringify(data, opt.serializer, 0); }
    data = jsonify(data, opt, '\n', opt.width);
    return data;
  }


  compactJSONify.defaultOpts = {
    forceBreakAfterContainer: true,
    indent: 2,
    maxItemsPerLine: 4,
    serializer: null,
    sortKeys: true,
    width: 79,
  };


  compactJSONify.cfg = function preconfigure(opts) {
    var pcj = function compactJSONify_preconfigured(data) {
      return compactJSONify(data, opts);
    };
    pcj.cfg = function reconfigure(newOpts) {
      newOpts = Object.assign({}, opts, newOpts);
      return compactJSONify.cfg(newOpts);
    };
    return pcj;
  };








  return compactJSONify;
}());
