const { Sorter } = require('../data-structures/Sorter');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

console.log('=== Sorter Tests ===');

const schedules = [
  { id: 'SC003', price: 150000, departure: '14:00' },
  { id: 'SC001', price: 80000, departure: '06:00' },
  { id: 'SC002', price: 120000, departure: '09:00' },
  { id: 'SC004', price: 60000, departure: '18:00' }
];

// Quick Sort by price
const byPrice = Sorter.quickSort([...schedules], (a, b) => a.price - b.price);
assert(byPrice[0].id === 'SC004', 'quickSort: cheapest first');
assert(byPrice[3].id === 'SC003', 'quickSort: most expensive last');

// Merge Sort by departure
const byTime = Sorter.mergeSort([...schedules], (a, b) => a.departure.localeCompare(b.departure));
assert(byTime[0].id === 'SC001', 'mergeSort: earliest first');
assert(byTime[3].id === 'SC004', 'mergeSort: latest last');

// Empty array
const empty = Sorter.quickSort([]);
assert(empty.length === 0, 'handles empty array');

// Single element
const single = Sorter.mergeSort([{ id: 'X', price: 100, departure: '10:00' }]);
assert(single.length === 1, 'handles single element');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
