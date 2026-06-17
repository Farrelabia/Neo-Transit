const { enrichSchedule, validateTravelDate } = require('../helpers/schedule');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  PASS: ${msg}`); }
  else { failed++; console.error(`  FAIL: ${msg}`); }
}

const db = {
  trains: [
    { id: 'TR001', name: 'Argo Parahyangan', class: 'Executive', capacity: 80 }
  ],
  stations: [
    { id: 'ST001', name: 'Gambir', city: 'Jakarta' },
    { id: 'ST002', name: 'Bandung', city: 'Bandung' }
  ]
};

console.log('=== enrichSchedule Tests ===');

// Null/undefined input
assert(enrichSchedule(null, db) === null, 'returns null for null input');
assert(enrichSchedule(undefined, db) === null, 'returns null for undefined input');

// Valid schedule
const valid = { id: 'SC001', trainId: 'TR001', from: 'ST001', to: 'ST002', departure: '06:00', arrival: '09:00', price: 150000, availableSeats: 80 };
const enriched = enrichSchedule(valid, db);
assert(enriched !== null, 'returns object for valid schedule');
assert(enriched.id === 'SC001', 'preserves id');
assert(enriched.price === 150000, 'preserves price');
assert(enriched.train && enriched.train.name === 'Argo Parahyangan', 'attaches train');
assert(enriched.stationFrom && enriched.stationFrom.name === 'Gambir', 'attaches stationFrom');
assert(enriched.stationTo && enriched.stationTo.name === 'Bandung', 'attaches stationTo');

// Unknown trainId — should not crash, train is null
const unknown = { id: 'SC999', trainId: 'TRXXX', from: 'ST001', to: 'ST002', departure: '06:00', arrival: '09:00', price: 100000, availableSeats: 50 };
const e2 = enrichSchedule(unknown, db);
assert(e2.train === null, 'null train for unknown trainId');
assert(e2.stationFrom !== null, 'still attaches known stations');

console.log('=== validateTravelDate Tests ===');

const today = new Date('2026-06-17T00:00:00');

assert(validateTravelDate('2026-06-17', today) === null, 'today is valid');
assert(validateTravelDate('2026-07-17', today) === null, '+30 days is valid');
assert(validateTravelDate('2026-07-18', today) !== null, '+31 days rejected');
assert(validateTravelDate('2026-06-16', today) !== null, 'yesterday rejected');
assert(validateTravelDate('not-a-date', today) !== null, 'invalid format rejected');
assert(validateTravelDate('', today) !== null, 'empty string rejected');
assert(validateTravelDate(undefined, today) !== null, 'undefined rejected');
assert(validateTravelDate('2026-13-45', today) !== null, 'impossible date rejected');
assert(validateTravelDate('2026-02-30', today) !== null, 'Feb 30 rejected (silent rollover)');
assert(validateTravelDate('2026-02-29', today) !== null, 'Feb 29 non-leap rejected');
assert(validateTravelDate('2026-04-31', today) !== null, 'Apr 31 rejected');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
