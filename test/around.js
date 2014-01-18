/**
 * Module Dependencies
 */

var assert = require('assert');
var domify = require('domify');
var around = require('around-node');

/**
 * Test
 */

describe('around(pattern, node, offset)', function() {
  var node;


  describe('within a single textnode', function() {

    beforeEach(function() {
      node = document.createTextNode('zzz abcde zzz');
    })

    it('should match left of the offset', function() {
      var obj = around(/ab/, node, 9);
      found(obj, node, 4, node, 6);
    });



    it('should match right of the offset', function() {
      var obj = around(/de/, node, 4);
      found(obj, node, 7, node, 9);
    });



    it('should match both sides of the offset', function() {
      var obj = around(/abcde/, node, 7);
      found(obj, node, 4, node, 9);
    });


  })

  describe('single nodes with multiple spaces', function() {
    beforeEach(function() {
      node = document.createTextNode('a b c d e f');
    })

    it('should match left of the offset with pattern containing spaces', function() {
      var obj = around(/a b c/, node, 5);
      found(obj, node, 0, node, 5);
    });

    it('should match right of the offset with pattern containing spaces', function() {
      var obj = around(/^c d e$/, node, 5);
      found(obj, node, 5, node, 9);
    });

    it('should match both sides of the offset with pattern containing spaces', function() {

    });
  })

  describe('traversing multiple nodes', function() {

    beforeEach(function() {
      node = domify('zzz a<strong>b</strong>c<em>d</em>e zzz');
    })

    it('should match left of the offset', function() {
      var obj = around(/ab/, node.lastChild, 1);
      found(obj, node.firstChild, 4, node.childNodes[1].firstChild, 1);
    });

    it('should match left of the offset with pattern containing spaces', function() {

    });

    it('should match right of the offset', function() {
      var obj = around(/de/, node.firstChild, 4);
      found(obj, node.childNodes[3].firstChild, 0, node.childNodes[4], 1);
    });

    it('should match right of the offset with pattern containing spaces', function() {

    });

    it('should match both sides of the offset', function() {
      // console.time('blah');
      var obj = around(/abcde/, node.childNodes[2], 1);
      // console.timeEnd('blah');
      found(obj, node.firstChild, 4, node.lastChild, 1);
    });

    it('should match both sides of the offset with pattern containing spaces', function() {

    });

    it('should end after traversing siblings', function() {
      var obj = around('z', node.childNodes[2], 3);
      assert(null == obj);
    });

    it('should end after traversing siblings with pattern containing spaces', function() {

    });

  });
})

/**
 * Match assertion helper
 */

function found(obj, sn, so, en, eo) {
  assert(obj, 'match not found');
  assert(sn == obj.startNode, 'wrong startNode (' + obj.startNode.nodeValue + '). expected ' + sn.nodeValue);
  assert(so == obj.startOffset, 'wrong startOffset (' + obj.startOffset + '). expected ' + so);
  assert(en == obj.endNode, 'wrong endNode (' + obj.endNode.nodeValue + '). expected ' + en.nodeValue);
  assert(eo == obj.endOffset, 'wrong endOffset (' + obj.endOffset + '). expected ' + eo);
}
