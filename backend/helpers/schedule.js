// [Lambda Expression] Helper enrich — join schedule dengan train & stations
// Pure function: mengembalikan objek baru, tidak mutasi input.
function enrichSchedule(schedule, db) {
  if (!schedule) return null;
  const train = (db.trains || []).find(t => t.id === schedule.trainId) || null;
  const stationFrom = (db.stations || []).find(st => st.id === schedule.from) || null;
  const stationTo = (db.stations || []).find(st => st.id === schedule.to) || null;
  return { ...schedule, train, stationFrom, stationTo };
}

// [Exception Handling] Validasi tanggal keberangkatan.
// Mengembalikan string error, atau null jika valid.
// today parameterizable agar testable (default = new Date()).
function validateTravelDate(date, today = new Date()) {
  if (!date || typeof date !== 'string') {
    return 'Date required (YYYY-MM-DD)';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return 'Invalid date format (YYYY-MM-DD required)';
  }
  const parsed = new Date(date + 'T00:00:00');
  if (isNaN(parsed.getTime())) {
    return 'Invalid date';
  }
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  const max = new Date(t); max.setDate(max.getDate() + 30);
  if (parsed < t) return 'Date cannot be in the past';
  if (parsed > max) return 'Date must be within 30 days from today';
  return null;
}

module.exports = { enrichSchedule, validateTravelDate };
