import { useEffect, useState } from 'react';
import { getDoctorAppointmentsApi, updateAppointmentStatusApi } from '../api/appointmentsApi';
import AppointmentCard from '../components/AppointmentCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LayoutDashboard } from 'lucide-react';

const TABS = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const load = () => {
    setLoading(true);
    getDoctorAppointmentsApi()
      .then((res) => setAppointments(res.data.appointments ?? res.data))
      .catch(() => toast.error('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatusApi(id, status);
      toast.success(`Appointment ${status}.`);
      load();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const filtered = appointments.filter((a) => a.status === tab);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="text-teal-600" size={24} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, Dr. {user?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {TABS.map((t) => {
          const count = appointments.filter((a) => a.status === t).length;
          return (
            <div key={t} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-teal-600">{count}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">{t}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No {tab} appointments.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => (
            <AppointmentCard
              key={apt._id}
              appointment={apt}
              isDoctor
              onStatusChange={tab === 'pending' ? handleStatusChange : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
