import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ScheduleCard from '../components/ScheduleCard';
import { todayISO, plusDaysISO } from '../utils/date';

export default function Home() {
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState(null);
  const [alternatives, setAlternatives] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [date, setDate] = useState(todayISO());
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/routes/stations').then(res => setStations(res.data)).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [shortestRes, altRes] = await Promise.all([
        api.get('/routes/shortest', { params: { from, to } }),
        api.get('/routes/alternatives', { params: { from, to } })
      ]);
      setResults(shortestRes.data);
      setAlternatives(altRes.data);
    } catch (err) {
      setResults(null);
      setAlternatives(null);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">NeoTransit</h1>
          <p className="text-blue-100 mb-8">Pemesanan Tiket Kereta Cepat Antar-Kota</p>
          <form onSubmit={handleSearch} className="bg-white rounded-lg p-6 flex flex-wrap gap-4 items-end text-gray-800">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1">Stasiun Asal</label>
              <select value={from} onChange={e => setFrom(e.target.value)} className="w-full border rounded px-3 py-2" required>
                <option value="">Pilih stasiun</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1">Stasiun Tujuan</label>
              <select value={to} onChange={e => setTo(e.target.value)} className="w-full border rounded px-3 py-2" required>
                <option value="">Pilih stasiun</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.name} ({s.city})</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium mb-1">Tanggal Keberangkatan</label>
              <input
                type="date"
                value={date}
                min={todayISO()}
                max={plusDaysISO(30)}
                onChange={e => setDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" disabled={loading}>
              {loading ? 'Mencari...' : 'Cari Rute'}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">Rute Tercepat</h2>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {results.path.path.map((s, i) => (
                <span key={s.id} className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">{s.name}</span>
                  {i < results.path.path.length - 1 && <span className="text-blue-400">→</span>}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">{results.path.stations} stasiun (termasuk transit)</p>
          </div>

          {/* Schedule Results */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Jadwal Kereta</h3>
            <div className="flex gap-2">
              <button onClick={() => setSortBy('price')} className={`px-3 py-1 rounded text-sm ${sortBy === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Termurah</button>
              <button onClick={() => setSortBy('departure')} className={`px-3 py-1 rounded text-sm ${sortBy === 'departure' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Paling Awal</button>
            </div>
          </div>

          {(sortBy === 'price' ? results.schedules : [...results.schedules].sort((a, b) => a.departure.localeCompare(b.departure))).map(sc => (
            <ScheduleCard
              key={sc.id}
              schedule={sc}
              date={date}
              actionLabel="Pesan"
              onAction={() => navigate('/booking', { state: { scheduleId: sc.id, date } })}
            />
          ))}

          {/* Alternative Routes */}
          {alternatives && alternatives.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Rute Alternatif</h3>
              {alternatives.slice(1).map((alt, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 mb-2">
                  <p className="text-sm">{alt.path.map(s => s.name).join(' → ')} ({alt.stations} stasiun)</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
