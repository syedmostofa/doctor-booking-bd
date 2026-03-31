import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorByIdApi, getDoctorSlotsApi } from '../api/doctorsApi';
import { MapPin, Star, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import CalendarPicker from '../components/CalendarPicker';
import TimeSlotPicker from '../components/TimeSlotPicker';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    getDoctorByIdApi(id)
      .then((res) => setDoctor(res.data.doctor ?? res.data))
      .catch(() => toast.error('Failed to load doctor profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    getDoctorSlotsApi(id, format(selectedDate, 'yyyy-MM-dd'))
      .then((res) => setSlots(res.data.slots ?? res.data))
      .catch(() => toast.error('Failed to load available slots.'))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, id]);

  const handleBookSlot = () => {
    navigate(`/book/${id}/${selectedSlot.id}`, {
      state: {
        date: format(selectedDate, 'yyyy-MM-dd'),
        slotTime: selectedSlot.start_time,
        slotEndTime: selectedSlot.end_time,
        doctorName: doctor.name,
        specialty: doctor.specialty ?? doctor.specialization,
        fee: doctor.fee ?? doctor.consultation_fee,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doctor) return <div className="text-center py-20 text-gray-400">Doctor not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-3xl flex-shrink-0">
            {doctor.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Dr. {doctor.name}</h1>
            <p className="text-teal-600 font-medium text-sm mt-0.5">
              {doctor.specialty ?? doctor.specialization}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={13} />{doctor.location ?? doctor.district ?? 'Dhaka'}
              </span>
              <span className="flex items-center gap-1">
                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                {doctor.rating ?? '4.5'} rating
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />{doctor.experience ?? doctor.years_experience ?? '5'} years exp.
              </span>
              <span className="flex items-center gap-1">
                <Award size={13} />{doctor.bmdcReg ?? doctor.bmdc_reg ?? 'BMDC Verified'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Consultation Fee</p>
            <p className="text-2xl font-bold text-gray-900">
              ৳{doctor.fee ?? doctor.consultation_fee ?? '500'}
            </p>
          </div>
          {doctor.chamber_address && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Chamber</p>
              <p className="text-sm text-gray-700 max-w-xs">{doctor.chamber_address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{doctor.bio}</p>
        </div>
      )}

      {/* Education */}
      {doctor.education?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Education</h2>
          <ul className="space-y-2">
            {doctor.education.map((e, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-teal-600 mt-0.5">•</span> {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Booking section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Book an Appointment</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <CalendarPicker selected={selectedDate} onChange={setSelectedDate} />
        </div>

        {selectedDate && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Slots — {format(selectedDate, 'dd MMM yyyy')}
            </label>
            {slotsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <TimeSlotPicker slots={slots} selected={selectedSlot} onSelect={setSelectedSlot} />
            )}
          </div>
        )}

        {selectedSlot && (
          <button
            onClick={handleBookSlot}
            className="mt-5 w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
          >
            Book This Slot
          </button>
        )}
      </div>
    </div>
  );
}
