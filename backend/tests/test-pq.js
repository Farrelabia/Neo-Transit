const { PriorityQueue } = require('../data-structures/PriorityQueue');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

console.log('=== PriorityQueue Tests ===');

const pq = new PriorityQueue();
assert(pq.isEmpty(), 'starts empty');

pq.enqueue({ name: 'Budi', reason: 'regular' }, 1);
pq.enqueue({ name: 'Ani', reason: 'lansia' }, 3);
pq.enqueue({ name: 'Citra', reason: 'ibu hamil' }, 3);
pq.enqueue({ name: 'Deni', reason: 'regular' }, 1);

assert(pq.size() === 4, 'size is 4');
assert(!pq.isEmpty(), 'not empty');

// Higher priority number should dequeue first
const first = pq.dequeue();
assert(first.name === 'Ani' || first.name === 'Citra', 'first dequeue has highest priority');

const second = pq.dequeue();
assert(second.name === 'Ani' || second.name === 'Citra', 'second dequeue has highest priority');

const third = pq.dequeue();
assert(third.name === 'Budi' || third.name === 'Deni', 'third dequeue has lower priority');

const peeked = pq.peek();
assert(peeked !== null, 'peek returns element');

pq.dequeue();
assert(pq.isEmpty(), 'empty after all dequeued');
assert(pq.dequeue() === null, 'dequeue on empty returns null');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
