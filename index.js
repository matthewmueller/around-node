/**
 * Module Dependencies
 */

var Iterator = require('dom-iterator');

/**
 * Expose `around`
 */

exports = module.exports = around;

/**
 * Word separator
 */

var rseparator = exports.separator = /\s/;

/**
 * Look around the `node`'s `offset` for a particular
 * string or pattern.
 *
 * Examples:
 *
 *   around('lol')
 *   around(/abc/)
 *
 * @param {String|Number|RegExp} pattern
 * @param {TextNode} node
 * @return {Number} offset (optional)
 */

function around(pattern, node, offset) {

  // get the number of spaces in string
  var spaces = count(pattern.source || pattern);

  // convert string to regexp
  pattern = ('string' == typeof pattern) ? new RegExp('^' + pattern + '$') : pattern;

  // get the text content
  var text = node.textContent;
  if (!text) return null;

  var str = '';

  var lchar = true;
  var rchar = true;

  var lnodes = [];
  var rnodes = [];

  var leftSpaces = spaces;
  var rightSpaces = spaces;

  var parent = node.parentNode;
  var it1 = new Iterator(node, parent).filter(Node.TEXT_NODE);
  var it2 = new Iterator(node, parent).filter(Node.TEXT_NODE);

  // match
  var m = null;
  var loffset = offset - 1;
  var lstr = text;
  var roffset = offset;
  var rstr = text;

  var lmarkoffset = null;
  var lmarknode = null;
  var rmarkoffset = null;
  var rmarknode = null;

  // walk back and forward
  while (1) {
    // get the previous character
    lchar = lchar && back();
    // get the next character
    rchar = rchar && forward();

    // if we can't move left or right, return
    if (!lchar && !rchar) return match(m);

    // console.log('lsr %s, ls: %s, sr: %s', (lchar + str + rchar).replace(/ /g, '_'), (lchar + str).replace(/ /g, '_'), (str + rchar).replace(/ /g, '_'));

    // test full match, left match, & right match
    if (lchar && rchar && test(lchar + str + rchar)) {
      m = lchar + str + rchar;
      // add markers to get boundary nodes & offsets
      lmarkoffset = loffset + 1;
      lmarknode = lnodes[lnodes.length - 1] || node;
      rmarkoffset = roffset;
      rmarknode = rnodes[rnodes.length - 1] || node;
    } else if (lchar && test(lchar + str)) {
      m = lchar + str;
      // add start markers, reset end markers
      lmarkoffset = loffset + 1;
      lmarknode = lnodes[lnodes.length - 1] || node;
      rmarkoffset = null;
      rmarknode = null;
    } else if (rchar && test(str + rchar)) {
      m = str + rchar;
      // add end markers, reset start markers
      lmarkoffset = null;
      lmarknode = null;
      rmarkoffset = roffset;
      rmarknode = rnodes[rnodes.length - 1] || node;
    } else if (m) {
      // we matches last time, we aren't matching now,
      // last match was largest match, so return that
      return match(m);
    }

    str = lchar + str + rchar;
  }

  function back() {
    var ch = lstr[loffset];

    // move on to the previous node
    if (undefined === ch) {
      var n = it1.prev();
      if (!n) return '';
      lnodes.push(n);
      lstr = n.nodeValue;
      loffset = lstr.length - 1;
      ch = lstr[loffset];
    }

    // if it's a space and we've run out of spaces, return
    if (rseparator.test(ch) && leftSpaces-- <= 0) return '';
    loffset--;

    return ch;
  }

  function forward() {
    var ch = rstr[roffset];

    // move on to the next node
    if (undefined == ch) {
      var n = it2.next();
      if (!n) return '';
      rnodes.push(n);
      rstr = n.nodeValue;
      roffset = 0;
      ch = rstr[roffset];
    }

    // if it's a space and we've run out of spaces, return
    if (rseparator.test(ch) && rightSpaces-- <= 0) return '';
    roffset++;

    return ch;
  }

  function test(str) {
    return pattern.test(str);
  }

  function match(str) {
    if (!str) return null;
    m = str.match(pattern);
    var n, val, len;

    if (lmarknode && rmarknode) {
      // both markers were saved
      m.startOffset = lmarkoffset;
      m.startNode = lmarknode;
      m.endOffset = rmarkoffset + m.index;
      m.endNode = rmarknode;
      return m;
    } else if (!lnodes.length && !rnodes.length) {
      // we're within the same text node
      m.startNode = m.endNode = lmarknode || rmarknode;
      console.log(rmarkoffset, lmarkoffset, m[0].length);
      m.startOffset = (undefined == lmarkoffset) ? rmarkoffset - m[0].length : lmarkoffset;
      m.endOffset = (undefined == rmarkoffset) ? lmarkoffset + m[0].length : rmarkoffset;
      return m;
    }

    var nodes = lnodes.reverse().concat(node).concat(rnodes);

    if (lmarknode) {
      // find end marker from start marker
      m.startOffset = lmarkoffset;
      n = m.startNode = lmarknode;
      val = n.nodeValue.slice(lmarkoffset);
      len = m[0].length - val.length;
      i = nodes.indexOf(n);

      while(len > 0 && (n = nodes[++i])) {
        val = n.nodeValue;
        len -= val.length;
      }

      m.endOffset = val.length + len;
      m.endNode = n;
      return m;
    } else if (rmarknode) {
      // find start marker from end marker
      m.endOffset = rmarkoffset;
      n = m.endNode = rmarknode;
      val = n.nodeValue.slice(0, rmarkoffset);
      len = m[0].length - val.length;
      i = nodes.indexOf(n);

      while (len > 0 && (n = nodes[--i])) {
        val = n.nodeValue;
        len -= val.length;
      }

      m.startOffset = val.length + len - 1;
      m.startNode = n;
      return m;
    }

    return null;
  }
}

/**
 * Count the number of spaces in `str`
 *
 * @param {String} str
 * @return {Number}
 */

function count(str) {
  return str.split(rseparator).length - 1;
}
