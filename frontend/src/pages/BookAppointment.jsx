import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorByIdApi, getDoctorSlotsApi } from '../api/doctorsApi';
import { createAppointmentApi } from '../api/appointmentsApi';
import CalendarPicker from '../components/CalendarPicker';
import TimeSlotPicker from '../components/TimeSlotPicker';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    getDoctorByIdApi(doctorId)
      .then((res) => setDoctor(res.data.doctor ?? res.data))
      .catch(() => toast.error('Failed to load doctor.'));
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    getDoctorSlotsApi(doctorId, format(selectedDate, 'yyyy-MM-dd'))
      .then((res) => setSlots(res.data.slots ?? res.data))
      .catch(() => toast.error('Failed to load slots.'))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, doctorId]);

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot.');
      return;
    }
    setLoading(true);
    try {
      const [hour, minute] = selectedSlot.replace(/[APM]/g, '').trim().split(':');
      const isPM = selectedSlot.includes('PM');
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(isPM ? parseInt(hour) + 12 : parseInt(hour), parseInt(minute), 0);

      await createAppointmentApi({ doctorId, scheduledAt: scheduledAt.toISOString(), notes });
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h1>
      <p className="text-gray-500 text-sm mb-6">with Dr. {doctor.name} &mdash; {doctor.specialty}</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Select Date</label>
          <CalendarPicker selected={selectedDate} onChange={setSelectedDate} />
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Select Time</label>
            {slotsLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <TimeSlotPicker slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Reason / Notes <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe your symptoms or reason for visit..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        {/* Summary */}
        {selectedDate && selectedSlot && (
          <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800">
            <p className="font-medium flex items-center gap-1.5"><CheckCircle size={15} /> Booking Summary</p>
            <p className="mt-1 text-teal-700">
              {format(selectedDate, 'EEEE, dd MMMM yyyy')} at {selectedSlot} &mdash; ৳{doctor.fee ?? 500}
            </p>
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={loading || !selectedDate || !selectedSlot}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </div>
    </div>
  );
}
