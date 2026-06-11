import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Booking() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [passengerName, setPassengerName] = useState(user?.name || '');
  const [priority, setPriority] = useState('regular');
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    api.get('/schedules').then(res => {
      setSchedules(res.data.schedules);
      if (location.state?.scheduleId) {
        const sc = res.data.schedules.find(s => s.id === location.state.scheduleId);
        if (sc) {
          setSelectedSchedule(sc);
          setStep(2);
          api.post('/booking/start', { userId: user.id }).catch(() => {});
          api.post('/booking/select-train', { userId: user.id, scheduleId: sc.id }).catch(() => {});
        }
      }
    });
  }, []);

  const handleSelectTrain = async (schedule) => {
    setSelectedSchedule(schedule);
    try {
      await api.post('/booking/start', { userId: user.id });
      await api.post('/booking/select-train', { userId: user.id, scheduleId: schedule.id });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memilih kereta');
    }
  };

  const handleSubmitInfo = async (e) => {
    e.preventDefault();
    try {
      const priorityMap = { regular: 1, lansia: 3, 'ibu-hamil': 3, vip: 5 };
      await api.post('/booking/passenger-info', {
        userId: user.id,
        passengerName,
        priority: priorityMap[priority] || 1,
        priorityReason: priority
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan data');
    }
  };

  const handleConfirm = async () => {
    try {
      const res = await api.post('/booking/confirm', { userId: user.id });
      setTicket(res.data.ticket);
      setStep(4);
    } catch (err) {
      if (err.response?.data?.error?.includes('seats')) {
        setError('Kursi penuh! Anda akan dialihkan ke waiting list.');
      } else {
        setError(err.response?.data?.error || 'Konfirmasi gagal');
      }
    }
  };

  const handleUndo = async () => {
    try {
      await api.post('/booking/undo', { userId: user.id });
      setStep(prev => Math.max(1, prev - 1));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Undo gagal');
    }
  };

  const handleJoinWaitingList = async () => {
    try {
      const priorityMap = { regular: 1, lansia: 3, 'ibu-hamil': 3, vip: 5 };
      await api.post('/waiting-list/join', {
        scheduleId: selectedSchedule.id,
        passengerName,
        priority: priorityMap[priority] || 1,
        priorityReason: priority,
        userId: user.id
      });
      setStep(4);
      setTicket({ status: 'waiting', passengerName, scheduleId: selectedSchedule.id });
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal masuk waiting list');
    }
  };

  const formatPrice = (p) => 'Rp ' + p.toLocaleString('id-ID');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
        ))}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Step 1: Select Train */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Pilih Kereta</h2>
          {schedules.map(sc => (
            <div key={sc.id} className="border rounded-lg p-4 mb-3 flex justify-between items-center hover:shadow-md">
              <div>
                <p className="font-semibold">{sc.departure} → {sc.arrival}</p>
                <p className="text-sm text-gray-600">Kursi: {sc.availableSeats} | {formatPrice(sc.price)}</p>
              </div>
              <button onClick={() => handleSelectTrain(sc)} className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">Pilih</button>
            </div>
          ))}
        </div>
      )}

      {/* Step 2: Passenger Info */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Data Penumpang</h2>
          <div className="bg-blue-50 rounded p-3 mb-4">
            <p className="font-semibold">{selectedSchedule?.departure} → {selectedSchedule?.arrival}</p>
            <p className="text-sm text-gray-600">{formatPrice(selectedSchedule?.price)} | Kursi: {selectedSchedule?.availableSeats}</p>
          </div>
          <form onSubmit={handleSubmitInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Penumpang</label>
              <input type="text" value={passengerName} onChange={e => setPassengerName(e.target.value)}
                className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="regular">Regular</option>
                <option value="lansia">Lansia</option>
                <option value="ibu-hamil">Ibu Hamil</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleUndo} className="flex-1 border py-2 rounded hover:bg-gray-50">Kembali (Undo)</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Lanjut</button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Konfirmasi Booking</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
            <p><span className="font-medium">Kereta:</span> {selectedSchedule?.departure} → {selectedSchedule?.arrival}</p>
            <p><span className="font-medium">Harga:</span> {formatPrice(selectedSchedule?.price)}</p>
            <p><span className="font-medium">Penumpang:</span> {passengerName}</p>
            <p><span className="font-medium">Kategori:</span> {priority}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleUndo} className="flex-1 border py-2 rounded hover:bg-gray-50">Kembali (Undo)</button>
            <button onClick={handleConfirm} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700">Konfirmasi</button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && ticket && (
        <div className="text-center">
          {ticket.status === 'confirmed' ? (
            <>
              <div className="text-green-500 text-5xl mb-4">&#10003;</div>
              <h2 className="text-xl font-bold mb-2">Booking Berhasil!</h2>
              <div className="bg-green-50 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-600">Kode Booking</p>
                <p className="text-2xl font-bold text-green-700">{ticket.bookingCode}</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-yellow-500 text-5xl mb-4">&#9203;</div>
              <h2 className="text-xl font-bold mb-2">Anda Masuk Waiting List</h2>
              <p className="text-gray-600">Kursi sedang penuh. Anda akan diberitahu saat tersedia.</p>
            </>
          )}
          <div className="mt-6">
            <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Kembali ke Beranda</button>
          </div>
        </div>
      )}
    </div>
  );
}
