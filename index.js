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
  var bookmarks = {};

  // get the number of spaces in string
  var spaces = count(pattern.source || pattern);

  // convert string to regexp
  pattern = ('string' == typeof pattern) ? new RegExp('^' + pattern + '$') : pattern;

  var text = node.textContent;
  var tmpOffset = offset - 1;
  var tmpText = text;
  var tmpNode = node;
  var tmpSpace = spaces;
  var bound = 0;
  var str = '';
  var i = 0;
  var tmpStr;



  // get left substring
  while (1) {
    // jump to next node if out of bound
    if (tmpOffset < bound) {
      tmpNode = tmpNode.previousSibling;
      if (!tmpNode) break;
      tmpText = tmpNode.textContent;
      tmpOffset = tmpText.length - 1;
      bound = 0;
    }

    tmpStr = tmpText[tmpOffset--];
    if (rseparator.test(tmpStr) && tmpSpace-- <= 0) break;

    bookmarks[i++] = tmpNode;
    str = tmpStr + str;
  }

  // reset everything
  tmpOffset = offset;
  tmpText = text;
  tmpNode = node;
  tmpSpace = spaces;
  bound = text.length;

  // get right substring
  while(1) {
    // jump to next node if out of bound
    if (tmpOffset >= bound) {
      tmpNode = tmpNode.nextSibling;
      if (!tmpNode) break;
      tmpText = tmpNode.textContent;
      tmpOffset = 0;
      bound = tmpText.length;
    }

    tmpStr = tmpText[tmpOffset++];
    if (rseparator.test(tmpStr) && tmpSpace-- <= 0) break;

    // add to substring
    bookmarks[i++] = tmpNode;
    str += tmpStr;
  }

  // quick regex test for normal case
  if (!pattern.test(str)) return null;

  // match larger pattern
  var m = str.match(pattern);
  var out = {};
  var start = m.index;
  var end = start + m[0].length;
  m.startOffset = start;
  m.endOffset = end;
  m.startNode = bookmarks[start];
  m.endNode = bookmarks[end];
  return m;
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
