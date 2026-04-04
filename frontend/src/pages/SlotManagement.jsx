import { useState, useEffect } from 'react';
import { getMeApi } from '../api/authApi';
import { getDoctorSlotsApi, createSlotApi, deleteSlotApi } from '../api/doctorsApi';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar, Clock, Trash2, Plus } from 'lucide-react';
import CalendarPicker from '../components/CalendarPicker';

export default function SlotManagement() {
  const [doctorId, setDoctorId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newSlot, setNewSlot] = useState({ start_time: '09:00', end_time: '09:30' });

  useEffect(() => {
    getMeApi()
      .then((res) => {
        if (res.data.doctor) setDoctorId(res.data.doctor.id);
      })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    loadSlots();
  }, [doctorId, selectedDate]);

  const loadSlots = () => {
    if (!doctorId) return;
    getDoctorSlotsApi(doctorId, format(selectedDate, 'yyyy-MM-dd'))
      .then((res) => setSlots(res.data.slots ?? []))
      .catch(() => toast.error('Failed to load slots.'));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newSlot.start_time >= newSlot.end_time) {
      return toast.error('End time must be after start time.');
    }
    setCreating(true);
    try {
      await createSlotApi({
        slot_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
      });
      toast.success('Slot created!');
      setShowForm(false);
      setNewSlot({ start_time: '09:00', end_time: '09:30' });
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create slot.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await deleteSlotApi(slotId);
      toast.success('Slot deleted.');
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete slot.');
    }
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">
        <p>Please set up your doctor profile first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-teal-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Manage Slots</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} /> Add Slot
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <CalendarPicker selected={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* Add slot form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-teal-50 rounded-xl border border-teal-100 p-4 mb-6">
          <p className="text-sm font-medium text-teal-800 mb-3">
            New slot for {format(selectedDate, 'dd MMM yyyy')}
          </p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot((p) => ({ ...p, start_time: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot((p) => ({ ...p, end_time: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {creating ? '...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Slots list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-4">
          Slots for {format(selectedDate, 'dd MMM yyyy')}
        </h2>
        {slots.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No slots for this date.</p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                  slot.is_booked
                    ? 'bg-red-50 border-red-100'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock size={16} className={slot.is_booked ? 'text-red-400' : 'text-teal-600'} />
                  <span className="text-sm font-medium text-gray-800">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </span>
                  {slot.is_booked && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Booked</span>
                  )}
                </div>
                {!slot.is_booked && (
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Delete slot"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
