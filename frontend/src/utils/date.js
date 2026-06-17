// Date helpers for travel date selection.

export function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function plusDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// '2026-06-17' -> '17 Jun 2026'
export function formatDateID(iso) {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    }).format(new Date(iso + 'T00:00:00'));
  } catch {
    return iso;
  }
}

// '06:00', '09:00' -> '3 jam' or '3j 30m'
export function formatDuration(departure, arrival) {
  if (!departure || !arrival) return '-';
  const [dh, dm] = departure.split(':').map(Number);
  const [ah, am] = arrival.split(':').map(Number);
  let mins = (ah * 60 + am) - (dh * 60 + dm);
  if (mins < 0) mins += 24 * 60; // next-day arrival
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} jam`;
  return `${h}j ${m}m`;
}
