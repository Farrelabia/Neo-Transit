import { useState } from 'react';
import api from '../api/axios';

export default function Checkin() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/checkin/${code}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking code tidak ditemukan');
    }
    setLoading(false);
  };

  const formatPrice = (p) => p ? 'Rp ' + p.toLocaleString('id-ID') : '-';

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-2">Check-in Portal</h1>
      <p className="text-gray-500 text-center mb-8">Masukkan kode booking untuk melihat tiket Anda</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Contoh: BK-ABC123" className="flex-1 border rounded px-4 py-2 text-lg" required />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? '...' : 'Cari'}
        </button>
      </form>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      {result && (
        <div className="bg-white border rounded-lg shadow-md p-6">
          <div className={`text-center mb-4 py-2 rounded ${result.ticket.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            <span className="font-bold text-lg">{result.ticket.status === 'confirmed' ? 'Terverifikasi' : 'Menunggu'}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Kode Booking</span>
              <span className="font-bold text-blue-600">{result.ticket.bookingCode}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Penumpang</span>
              <span className="font-medium">{result.ticket.passengerName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Kereta</span>
              <span className="font-medium">{result.train?.name || '-'} ({result.train?.class || '-'})</span>
            </div>
            {result.schedule && (
              <>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Rute</span>
                  <span className="font-medium">{result.schedule.departure} → {result.schedule.arrival}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Harga</span>
                  <span className="font-bold text-blue-600">{formatPrice(result.schedule.price)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
