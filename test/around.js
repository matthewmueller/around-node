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
      found(obj, node, 0, node, 2);
    });



    it('should match left of the offset with pattern containing spaces', function() {


    });

    it('should match right of the offset', function() {
      var obj = around(/de/, node, 4);
      found(obj, node, 3, node, 5);
    });

    it('should match right of the offset with pattern containing spaces', function() {

    });

    it('should match both sides of the offset', function() {
      var obj = around(/abcde/, node, 7);
      found(obj, 0, node, 5, node);
    });

    it('should match both sides of the offset with pattern containing spaces', function() {

    });

  })

  describe('traversing multiple nodes', function() {

    beforeEach(function() {
      node = domify('zzz a<strong>b</strong>c<em>d</em>e zzz');
    })

    it('should match left of the offset', function() {
      node = node.lastChild;
      var obj = around(/ab/, node, 1);
      found(obj, 0, node, 2, node);
    });

    it('should match left of the offset with pattern containing spaces', function() {

    });

    it('should match right of the offset', function() {
      node = node.firstChild;
      var obj = around(/de/, node, 3);
      found(obj, 3, node, 5, node);
    });

    it('should match right of the offset with pattern containing spaces', function() {

    });

    it('should match both sides of the offset', function() {
      node = node.childNodes[2];
      var obj = around(/abcde/, node, 1);
      found(obj, 0, node, 5, node);
    });

    it('should match both sides of the offset with pattern containing spaces', function() {

    });

    it('should end after traversing siblings', function() {
      var obj = around('z', node, 3);
      assert(null == obj);
    });

    it('should end after traversing siblings with pattern containing spaces', function() {

    });

  })
})

/**
 * Match assertion helper
 */

function found(obj, sn, so, en, eo) {
  assert(obj, 'match not found');
  assert(sn == obj.startNode);
  assert(so == obj.startOffset);
  assert(en == obj.endNode);
  assert(eo == obj.endOffset);
}
