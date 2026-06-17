import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatDateID } from '../utils/date';

const STATUS_STYLES = {
  confirmed: { label: 'Aktif', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  waiting:   { label: 'Menunggu', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  cancelled: { label: 'Batal', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
};

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'confirmed', label: 'Aktif' },
  { key: 'waiting', label: 'Menunggu' },
  { key: 'cancelled', label: 'Batal' }
];

function formatPrice(p) {
  if (!p && p !== 0) return '-';
  return 'Rp ' + Number(p).toLocaleString('id-ID');
}

function formatDate(iso) {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function titleCase(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/booking/history/${user.id}`);
      setTickets(res.data.tickets);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memuat riwayat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleCancel = async (bookingCode) => {
    if (!window.confirm('Batalkan tiket ini? Tindakan tidak bisa dibatalkan.')) return;
    setCancelling(bookingCode);
    try {
      await api.delete(`/booking/cancel/${bookingCode}`);
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal membatalkan tiket');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => t.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Riwayat Pemesanan</h1>
      <p className="text-gray-500 mb-6">Semua tiket yang pernah Anda pesan.</p>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchHistory} className="text-sm underline">Coba lagi</button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-center py-12">Memuat...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Belum ada riwayat pemesanan.</p>
          <button
            onClick={() => navigate('/booking')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Pesan Tiket
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const s = STATUS_STYLES[t.status] || STATUS_STYLES.confirmed;
            return (
              <div key={t.bookingCode} className="bg-white border rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${s.badge}`}>
                      {s.label}
                    </span>
                    <span className="text-xs text-gray-500">{titleCase(t.priorityReason)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-blue-600">{t.bookingCode}</span>
                    {t.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(t.bookingCode)}
                        disabled={cancelling === t.bookingCode}
                        className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2 py-1 rounded disabled:opacity-50"
                      >
                        {cancelling === t.bookingCode ? '...' : 'Batalkan'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium">{t.passengerName}</p>
                  {t.stationFrom && t.stationTo && (
                    <p className="text-gray-700">
                      {t.stationFrom.name} → {t.stationTo.name}
                    </p>
                  )}
                  {t.schedule && (
                    <p className="text-gray-600">
                      {t.schedule.departure} → {t.schedule.arrival}
                    </p>
                  )}
                  {t.date && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Keberangkatan:</span> {formatDateID(t.date)}
                    </p>
                  )}
                  {t.train && (
                    <p className="text-gray-600">{t.train.name} ({t.train.class})</p>
                  )}
                  {t.schedule && (
                    <p className="text-gray-900 font-semibold">{formatPrice(t.schedule.price)}</p>
                  )}
                  <p className="text-xs text-gray-400">Dipesan: {formatDate(t.bookedAt)}</p>
                  {t.cancelledAt && (
                    <p className="text-xs text-red-400">Dibatalkan: {formatDate(t.cancelledAt)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
