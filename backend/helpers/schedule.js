// [Lambda Expression] Helper enrich — join schedule dengan train & stations
// Pure function: mengembalikan objek baru, tidak mutasi input.
function enrichSchedule(schedule, db) {
  if (!schedule) return null;
  const train = (db.trains || []).find(t => t.id === schedule.trainId) || null;
  const stationFrom = (db.stations || []).find(st => st.id === schedule.from) || null;
  const stationTo = (db.stations || []).find(st => st.id === schedule.to) || null;
  return { ...schedule, train, stationFrom, stationTo };
}

// [Exception Handling] Stub — implementasi asli ada di Task 2.
// Stub return string agar test file load bersih (TDD red per-assert).
function validateTravelDate() {
  return 'validateTravelDate: not implemented yet (Task 2)';
}

module.exports = { enrichSchedule, validateTravelDate };
