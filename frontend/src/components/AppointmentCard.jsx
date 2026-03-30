import { formatDateTime } from '../utils/formatDate';
import { Calendar, User, Clock } from 'lucide-react';

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-gray-100 text-gray-600',
};

export default function AppointmentCard({ appointment, onCancel, onStatusChange, isDoctor }) {
  const { doctor, patient, scheduledAt, status, _id } = appointment;
  const displayName = isDoctor ? patient?.name : `Dr. ${doctor?.name}`;
  const specialty = !isDoctor && doctor?.specialty;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
            {displayName?.charAt(isDoctor ? 0 : 4) ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
            {specialty && <p className="text-teal-600 text-xs">{specialty}</p>}
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
        <Calendar size={14} />
        <span>{formatDateTime(scheduledAt)}</span>
      </div>

      {(onCancel || onStatusChange) && status === 'pending' && (
        <div className="mt-4 flex gap-2">
          {onCancel && (
            <button
              onClick={() => onCancel(_id)}
              className="flex-1 text-center py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}
          {onStatusChange && (
            <button
              onClick={() => onStatusChange(_id, 'confirmed')}
              className="flex-1 text-center py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Confirm
            </button>
          )}
        </div>
      )}
    </div>
  );
}
