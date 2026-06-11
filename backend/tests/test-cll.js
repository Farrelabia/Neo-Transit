const { CircularLinkedList } = require('../data-structures/CircularLinkedList');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

console.log('=== CircularLinkedList Tests ===');

const cll = new CircularLinkedList();
assert(cll.size === 0, 'starts empty');

cll.addOfficer({ id: 'OF001', name: 'Masinis A', role: 'masinis' });
cll.addOfficer({ id: 'OF002', name: 'Petugas B', role: 'loket' });
cll.addOfficer({ id: 'OF003', name: 'Masinis C', role: 'masinis' });

assert(cll.size === 3, 'size is 3');
assert(cll.getCurrent().id === 'OF001', 'current starts at first added');

cll.rotate();
assert(cll.getCurrent().id === 'OF002', 'after 1 rotate, current is OF002');

cll.rotate();
assert(cll.getCurrent().id === 'OF003', 'after 2 rotates, current is OF003');

cll.rotate();
assert(cll.getCurrent().id === 'OF001', 'after 3 rotates, wraps back to OF001');

const display = cll.display();
assert(display.length === 3, 'display returns all 3 officers');

cll.removeOfficer('OF002');
assert(cll.size === 2, 'size is 2 after remove');
cll.rotate();
assert(cll.getCurrent().id === 'OF003', 'rotate still works after remove');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
