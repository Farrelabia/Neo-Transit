import { useState, useEffect } from 'react';
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
          <h2 className="text-lg font-semibold mb-4">Waiting List ({waitingList.length})</h2>
          {waitingList.length === 0 ? (
            <p className="text-gray-500">Tidak ada penumpang di waiting list.</p>
          ) : (
            <div className="space-y-2">
              {waitingList.map((wl, i) => (
                <div key={i} className="border rounded p-3 flex justify-between">
                  <span>{wl.passengerName}</span>
                  <span className="text-sm text-gray-500">Prioritas: {wl.priority} ({wl.priorityReason}) | Jadwal: {wl.scheduleId}</span>
                </div>
              ))}
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
