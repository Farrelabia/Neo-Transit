// [Lambda Expression] Helper enrich — join schedule dengan train & stations
// Pure function: mengembalikan objek baru, tidak mutasi input.
function enrichSchedule(schedule, db) {
  if (!schedule) return null;
  const train = (db.trains || []).find(t => t.id === schedule.trainId) || null;
  const stationFrom = (db.stations || []).find(st => st.id === schedule.from) || null;
  const stationTo = (db.stations || []).find(st => st.id === schedule.to) || null;
  return { ...schedule, train, stationFrom, stationTo };
}

// Belum dieksport — step berikutnya akan menambah validateTravelDate.
module.exports = { enrichSchedule };
