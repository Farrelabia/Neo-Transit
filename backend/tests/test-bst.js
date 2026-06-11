const { BinarySearchTree } = require('../data-structures/BinarySearchTree');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

console.log('=== BinarySearchTree Tests ===');

const bst = new BinarySearchTree();

bst.insert({ bookingCode: 'BK-AAA', passengerName: 'Budi', status: 'confirmed' });
bst.insert({ bookingCode: 'BK-BBB', passengerName: 'Ani', status: 'confirmed' });
bst.insert({ bookingCode: 'BK-CCC', passengerName: 'Citra', status: 'confirmed' });

// [Function Overloading] search by string (booking code)
const found = bst.search('BK-BBB');
assert(found && found.passengerName === 'Ani', 'search by booking code string');

const notFound = bst.search('BK-XXX');
assert(notFound === null, 'search returns null for missing code');

// inOrder traversal
const inOrder = bst.inOrder();
assert(inOrder[0].bookingCode === 'BK-AAA', 'inOrder first is AAA');
assert(inOrder[1].bookingCode === 'BK-BBB', 'inOrder second is BBB');
assert(inOrder[2].bookingCode === 'BK-CCC', 'inOrder third is CCC');

// delete
bst.delete('BK-BBB');
assert(bst.search('BK-BBB') === null, 'deleted item not found');
const afterDelete = bst.inOrder();
assert(afterDelete.length === 2, 'inOrder returns 2 items after delete');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
