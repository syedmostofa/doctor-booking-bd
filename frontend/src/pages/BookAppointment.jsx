import { useState } from 'react';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { createAppointmentApi } from '../api/appointmentsApi';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { CalendarDays, Clock, User, Banknote } from 'lucide-react';

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export default function BookAppointment() {
  const { doctorId, slotId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const state = location.state ?? {};
  const { date, slotTime, slotEndTime, doctorName, specialty, fee } = state;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await createAppointmentApi({ slot_id: slotId, notes });
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Confirm Appointment</h1>
      <p className="text-gray-500 text-sm mb-6">Review your booking details before confirming.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <User size={16} className="text-teal-600 flex-shrink-0" />
            <div>
              <span className="text-gray-400 text-xs block">Doctor</span>
              <span className="font-medium">Dr. {doctorName ?? '—'}</span>
              {specialty && <span className="text-teal-600 ml-1.5 text-xs">{specialty}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700">
            <CalendarDays size={16} className="text-teal-600 flex-shrink-0" />
            <div>
              <span className="text-gray-400 text-xs block">Date</span>
              <span className="font-medium">
                {date ? format(parseISO(date), 'EEEE, dd MMMM yyyy') : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Clock size={16} className="text-teal-600 flex-shrink-0" />
            <div>
              <span className="text-gray-400 text-xs block">Time</span>
              <span className="font-medium">
                {slotTime ? `${formatTime(slotTime)}${slotEndTime ? ` – ${formatTime(slotEndTime)}` : ''}` : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Banknote size={16} className="text-teal-600 flex-shrink-0" />
            <div>
              <span className="text-gray-400 text-xs block">Consultation Fee</span>
              <span className="font-semibold text-lg text-gray-900">৳{fee ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe your symptoms or reason for visit..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
