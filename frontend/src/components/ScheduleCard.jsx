import { formatDateID, formatDuration } from '../utils/date';

const CLASS_STYLES = {
  Executive: 'bg-blue-100 text-blue-700',
  Bisnis: 'bg-purple-100 text-purple-700',
  Ekonomi: 'bg-green-100 text-green-700'
};

function formatPrice(p) {
  if (p == null) return '-';
  return 'Rp ' + Number(p).toLocaleString('id-ID');
}

export default function ScheduleCard({ schedule, date, actionLabel, onAction }) {
  if (!schedule) return null;
  const train = schedule.train || {};
  const from = schedule.stationFrom || {};
  const to = schedule.stationTo || {};
  const classStyle = CLASS_STYLES[train.class] || 'bg-gray-100 text-gray-700';

  return (
    <div className="border rounded-lg p-4 mb-3 hover:shadow-md transition bg-white">
      {/* Timeline row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="text-left">
          <p className="text-xl font-bold text-gray-900">{schedule.departure}</p>
          <p className="text-sm font-medium text-gray-700">{from.name || '-'}</p>
          <p className="text-xs text-gray-500">{from.city || ''}</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center pt-2">
          <p className="text-xs text-gray-500 mb-1">{formatDuration(schedule.departure, schedule.arrival)}</p>
          <div className="w-full flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="flex-1 border-t-2 border-dashed border-gray-300 mx-1"></span>
            <span className="text-blue-600">🚆</span>
            <span className="flex-1 border-t-2 border-dashed border-gray-300 mx-1"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{schedule.arrival}</p>
          <p className="text-sm font-medium text-gray-700">{to.name || '-'}</p>
          <p className="text-xs text-gray-500">{to.city || ''}</p>
        </div>
      </div>

      {/* Train info row */}
      <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-gray-100">
        {train.name && (
          <span className="text-sm font-semibold text-gray-800">{train.name}</span>
        )}
        {train.class && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${classStyle}`}>
            {train.class}
          </span>
        )}
        {date && (
          <span className="text-xs text-gray-500 ml-auto">
            📅 {formatDateID(date)}
          </span>
        )}
      </div>

      {/* Footer row: price, seats, action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-blue-600">{formatPrice(schedule.price)}</p>
          <p className="text-xs text-gray-500">
            Kursi tersedia: <span className="font-medium text-gray-700">{schedule.availableSeats}</span>
          </p>
        </div>
        <button
          onClick={onAction}
          className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
