const { DoublyLinkedList } = require('../data-structures/DoublyLinkedList');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

console.log('=== DoublyLinkedList Tests ===');

const dll = new DoublyLinkedList();
assert(dll.size === 0, 'starts empty');

dll.insert({ id: 'SC003', departure: '12:00', price: 100000 });
dll.insert({ id: 'SC001', departure: '06:00', price: 80000 });
dll.insert({ id: 'SC002', departure: '09:00', price: 120000 });

assert(dll.size === 3, 'size is 3 after 3 inserts');
const display = dll.display();
assert(display[0].id === 'SC001', 'first item sorted by departure');
assert(display[1].id === 'SC002', 'second item sorted');
assert(display[2].id === 'SC003', 'third item sorted');

const found = dll.search('SC002');
assert(found && found.id === 'SC002', 'search finds by id');

const notFound = dll.search('SC999');
assert(notFound === null, 'search returns null for missing');

dll.delete('SC002');
assert(dll.size === 2, 'size decremented after delete');
assert(dll.search('SC002') === null, 'deleted item not found');

// [STL Iterator] test via for...of
const items = [];
for (const item of dll) { items.push(item.id); }
assert(JSON.stringify(items) === JSON.stringify(['SC001','SC003']), 'iterator works with for...of');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
