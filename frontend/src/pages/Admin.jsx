import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';

export default function Admin() {
  const [tab, setTab] = useState('schedules');
  const [schedules, setSchedules] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [shifts, setShifts] = useState({ current: null, all: [] });
  const [showForm, setShowForm] = useState(false);
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState({ trainId: '', from: '', to: '', departure: '', arrival: '', price: '', availableSeats: 80 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [scRes, wlRes, shRes, stRes] = await Promise.all([
      api.get('/schedules'),
      api.get('/waiting-list'),
      api.get('/shifts'),
      api.get('/routes/stations')
    ]);
    setSchedules(scRes.data.schedules);
    setWaitingList(wlRes.data);
    setShifts(shRes.data);
    setStations(stRes.data);
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedules', { ...form, price: Number(form.price), availableSeats: Number(form.availableSeats) });
      setShowForm(false);
      setForm({ trainId: '', from: '', to: '', departure: '', arrival: '', price: '', availableSeats: 80 });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menambah jadwal');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm('Hapus jadwal ini?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus');
    }
  };

  const handleRotate = async () => {
    await api.post('/shifts/rotate');
    loadData();
  };

  const formatPrice = (p) => 'Rp ' + p.toLocaleString('id-ID');

  const priorityBadgeClass = (reason) => {
    if (reason === 'vip') return 'bg-red-100 text-red-700 border border-red-300';
    if (reason === 'lansia' || reason === 'ibu-hamil') return 'bg-amber-100 text-amber-700 border border-amber-300';
    return 'bg-gray-100 text-gray-600 border border-gray-300';
  };

  const formatTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'no-date') return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const groupedWaitingList = useMemo(() => {
    const map = {};
    for (const wl of waitingList) {
      const key = `${wl.scheduleId}|${wl.date || 'no-date'}`;
      if (!map[key]) map[key] = [];
      map[key].push(wl);
    }
    return Object.entries(map)
      .map(([key, entries]) => {
        const [scheduleId, date] = key.split('|');
        return {
          scheduleId,
          date,
          entries: entries.sort((a, b) => a.position - b.position)
        };
      })
      .sort((a, b) => {
        if (a.date !== b.date) {
          if (a.date === 'no-date') return 1;
          if (b.date === 'no-date') return -1;
          return a.date.localeCompare(b.date);
        }
        const aDep = a.entries[0]?.schedule?.departure || '99:99';
        const bDep = b.entries[0]?.schedule?.departure || '99:99';
        return aDep.localeCompare(bDep);
      });
  }, [waitingList]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['schedules', 'waiting-list', 'shifts'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {t === 'schedules' ? 'Jadwal' : t === 'waiting-list' ? 'Waiting List' : 'Shift Petugas'}
          </button>
        ))}
      </div>

      {/* Schedules Tab */}
      {tab === 'schedules' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Daftar Jadwal ({schedules.length})</h2>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">
              {showForm ? 'Batal' : '+ Tambah Jadwal'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddSchedule} className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3">
              <input placeholder="Train ID (TR001)" value={form.trainId} onChange={e => setForm({...form, trainId: e.target.value})} className="border rounded px-3 py-2" required />
              <input placeholder="Departure (06:00)" value={form.departure} onChange={e => setForm({...form, departure: e.target.value})} className="border rounded px-3 py-2" required />
              <input placeholder="Arrival (09:00)" value={form.arrival} onChange={e => setForm({...form, arrival: e.target.value})} className="border rounded px-3 py-2" required />
              <input placeholder="Price (150000)" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="border rounded px-3 py-2" required />
              <select value={form.from} onChange={e => setForm({...form, from: e.target.value})} className="border rounded px-3 py-2" required>
                <option value="">Stasiun Asal</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={form.to} onChange={e => setForm({...form, to: e.target.value})} className="border rounded px-3 py-2" required>
                <option value="">Stasiun Tujuan</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">Simpan</button>
            </form>
          )}

          <div className="space-y-2">
            {schedules.map(sc => (
              <div key={sc.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <span className="font-medium">{sc.departure} → {sc.arrival}</span>
                  <span className="text-sm text-gray-500 ml-2">{sc.trainId} | {formatPrice(sc.price)} | Kursi: {sc.availableSeats}</span>
                </div>
                <button onClick={() => handleDeleteSchedule(sc.id)} className="text-red-600 hover:text-red-800 text-sm">Hapus</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waiting List Tab */}
      {tab === 'waiting-list' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Waiting List ({waitingList.length} penumpang, {groupedWaitingList.length} grup)</h2>
          {waitingList.length === 0 ? (
            <p className="text-gray-500">Tidak ada penumpang di waiting list.</p>
          ) : (
            <div className="space-y-4">
              {groupedWaitingList.map((group, gi) => {
                const first = group.entries[0];
                const schedule = first?.schedule;
                const train = first?.train;
                return (
                  <div key={gi} className="border rounded-lg overflow-hidden">
                    {/* Group header */}
                    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono bg-blue-600 text-white px-2 py-0.5 rounded">{group.scheduleId}</span>
                        <span className="font-semibold">{train?.name || 'Kereta tidak ditemukan'}</span>
                        {train && <span className="text-sm text-gray-600">· {train.class}</span>}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {first?.stationFrom?.name || schedule?.from || '—'} → {first?.stationTo?.name || schedule?.to || '—'}
                        {schedule && <span className="text-gray-500"> · {schedule.departure} → {schedule.arrival}</span>}
                        <span className="text-gray-500"> · {formatDate(group.date)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{group.entries.length} antrian</div>
                    </div>

                    {/* Entries */}
                    <div className="divide-y">
                      {group.entries.map((wl) => (
                        <div key={wl.id} className={`px-4 py-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-sm ${wl.position === 1 ? 'bg-yellow-50' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${wl.position === 1 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-700'}`}>
                              {wl.position}
                            </span>
                            <div>
                              <div className="font-medium">{wl.passengerName}</div>
                              <span className={`inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 ${priorityBadgeClass(wl.priorityReason)}`}>
                                {wl.priorityReason}
                              </span>
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="text-gray-700">{wl.user ? wl.user.email : <span className="italic text-gray-400">Tanpa login</span>}</div>
                            <div className="text-xs text-gray-500">{wl.user ? wl.user.name : '—'}</div>
                          </div>
                          <div className="text-gray-600">
                            <div className="text-xs text-gray-400">Booked</div>
                            <div>{formatTime(wl.bookedAt)}</div>
                          </div>
                          <div className="text-gray-500 font-mono text-xs">
                            <div className="text-xs text-gray-400">Code</div>
                            <div>{wl.bookingCode}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Shifts Tab */}
      {tab === 'shifts' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Rotasi Shift Petugas</h2>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="font-medium">Shift saat ini:</p>
            <p className="text-lg">{shifts.current?.name} — {shifts.current?.role}</p>
          </div>
          <button onClick={handleRotate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4">Rotate Shift</button>
          <div className="space-y-2">
            {shifts.all.map((of, i) => (
              <div key={i} className={`border rounded p-3 ${shifts.current?.id === of.id ? 'bg-blue-50 border-blue-300' : ''}`}>
                <span className="font-medium">{of.name}</span>
                <span className="text-sm text-gray-500 ml-2">{of.role}</span>
                {shifts.current?.id === of.id && <span className="ml-2 text-blue-600 text-sm font-medium">← Aktif</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
