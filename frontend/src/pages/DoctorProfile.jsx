import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorByIdApi, getDoctorSlotsApi } from '../api/doctorsApi';
import { getDoctorReviewsApi, createReviewApi } from '../api/reviewsApi';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import CalendarPicker from '../components/CalendarPicker';
import TimeSlotPicker from '../components/TimeSlotPicker';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg_rating: 0, total_reviews: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    getDoctorByIdApi(id)
      .then((res) => setDoctor(res.data.doctor ?? res.data))
      .catch(() => toast.error('Failed to load doctor profile.'))
      .finally(() => setLoading(false));

    loadReviews();
  }, [id]);

  const loadReviews = () => {
    getDoctorReviewsApi(id, { limit: 10 })
      .then((res) => {
        setReviews(res.data.reviews ?? []);
        if (res.data.stats) setReviewStats(res.data.stats);
      })
      .catch(() => {});
  };

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
        specialty: doctor.specialization ?? doctor.specialty,
        fee: doctor.consultation_fee ?? doctor.fee,
      },
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await createReviewApi({
        doctor_id: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
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
              {doctor.specialization ?? doctor.specialty}
            </p>
            {doctor.qualification && (
              <p className="text-gray-500 text-xs mt-0.5">{doctor.qualification}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={13} />{doctor.district ?? doctor.location ?? 'Bangladesh'}
              </span>
              <span className="flex items-center gap-1">
                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                {reviewStats.avg_rating || '—'} ({reviewStats.total_reviews} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />{doctor.experience_years ?? '—'} years exp.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Consultation Fee</p>
            <p className="text-2xl font-bold text-gray-900">
              ৳{doctor.consultation_fee ?? '—'}
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

      {/* Reviews */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Reviews ({reviewStats.total_reviews})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{r.patient_name}</span>
                  <span className="text-xs text-gray-300">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Review form - only for logged in patients */}
        {user?.role === 'patient' && (
          <form onSubmit={handleReviewSubmit} className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Leave a Review</p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewForm((p) => ({ ...p, rating: s }))}
                >
                  <Star
                    size={22}
                    className={`cursor-pointer transition-colors ${
                      s <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
              rows={2}
              placeholder="Share your experience (optional)..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none mb-3"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

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
