import { Calendar, Clock } from 'lucide-react';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function AppointmentCard({ appointment, onCancel, onStatusChange, isDoctor, onPay }) {
  const {
    id, status, notes, slot_date, start_time, end_time, created_at,
    doctor_name, specialization, consultation_fee, district,
    patient_name, patient_phone,
  } = appointment;

  const displayName = isDoctor ? patient_name : `Dr. ${doctor_name}`;
  const subtitle = isDoctor ? patient_phone : specialization;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
            {displayName?.charAt(isDoctor ? 0 : 4) ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
            {subtitle && <p className="text-teal-600 text-xs">{subtitle}</p>}
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
          {status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
        {slot_date && (
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(slot_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {start_time && (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatTime(start_time)}{end_time ? ` - ${formatTime(end_time)}` : ''}
          </span>
        )}
        {!isDoctor && consultation_fee && (
          <span className="text-gray-600 font-medium">৳{consultation_fee}</span>
        )}
      </div>

      {notes && (
        <p className="mt-2 text-xs text-gray-400 line-clamp-2">Notes: {notes}</p>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        {/* Patient actions */}
        {onCancel && (status === 'pending' || status === 'confirmed') && (
          <button
            onClick={() => onCancel(id)}
            className="flex-1 text-center py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        )}
        {onPay && (status === 'pending' || status === 'confirmed') && (
          <button
            onClick={() => onPay(appointment)}
            className="flex-1 text-center py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Pay ৳{consultation_fee || '—'}
          </button>
        )}

        {/* Doctor actions */}
        {onStatusChange && status === 'pending' && (
          <button
            onClick={() => onStatusChange(id, 'confirmed')}
            className="flex-1 text-center py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Confirm
          </button>
        )}
        {onStatusChange && status === 'confirmed' && (
          <button
            onClick={() => onStatusChange(id, 'completed')}
            className="flex-1 text-center py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}
