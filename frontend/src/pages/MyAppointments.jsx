import { useEffect, useState } from 'react';
import { getMyAppointmentsApi, cancelAppointmentApi } from '../api/appointmentsApi';
import AppointmentCard from '../components/AppointmentCard';
import toast from 'react-hot-toast';
import { CalendarX } from 'lucide-react';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyAppointmentsApi()
      .then((res) => setAppointments(res.data.appointments ?? res.data))
      .catch(() => toast.error('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointmentApi(id);
      toast.success('Appointment cancelled.');
      load();
    } catch {
      toast.error('Failed to cancel.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarX size={40} className="mx-auto mb-3 opacity-50" />
          <p>No appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <AppointmentCard key={apt._id} appointment={apt} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}
