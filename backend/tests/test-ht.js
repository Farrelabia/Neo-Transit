const { HashTable } = require('../data-structures/HashTable');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

console.log('=== HashTable Tests ===');

const ht = new HashTable();

ht.set('admin@neo.com', { id: 'US001', email: 'admin@neo.com', name: 'Admin', role: 'admin' });
ht.set('budi@mail.com', { id: 'US002', email: 'budi@mail.com', name: 'Budi', role: 'user' });
ht.set('ani@mail.com', { id: 'US003', email: 'ani@mail.com', name: 'Ani', role: 'user' });

assert(ht.size === 3, 'size is 3');

const admin = ht.get('admin@neo.com');
assert(admin && admin.name === 'Admin', 'get returns correct user by email');

assert(ht.has('budi@mail.com'), 'has returns true for existing key');
assert(!ht.has('nonexist@mail.com'), 'has returns false for missing key');

ht.delete('budi@mail.com');
assert(!ht.has('budi@mail.com'), 'deleted key no longer exists');
assert(ht.size === 2, 'size is 2 after delete');

const all = ht.display();
assert(all.length === 2, 'display returns all remaining entries');

// Collision test — multiple keys in same bucket
const htSmall = new HashTable(5);
for (let i = 0; i < 20; i++) {
  htSmall.set(`user${i}@test.com`, { name: `User${i}` });
}
assert(htSmall.size === 20, 'handles collisions with chaining');
assert(htSmall.get('user15@test.com').name === 'User15', 'retrieves from chained bucket');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
