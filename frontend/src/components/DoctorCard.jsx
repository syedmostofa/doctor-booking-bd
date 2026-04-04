import { Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';

const PLACEHOLDER_AVATAR = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'Doctor')}&background=ccfbf1&color=0f766e&size=128`;

export default function DoctorCard({ doctor }) {
  const avatarSrc = doctor.profile_picture || PLACEHOLDER_AVATAR(doctor.name);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="p-5 flex items-start gap-4 flex-1">
        <img
          src={avatarSrc}
          alt={doctor.name}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR(doctor.name); }}
          className="w-16 h-16 rounded-full object-cover flex-shrink-0 bg-teal-50"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">
            Dr. {doctor.name}
          </h3>
          <p className="text-teal-600 text-sm font-medium mt-0.5">
            {doctor.specialization || doctor.specialty}
          </p>

          <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{doctor.district || doctor.location || 'Bangladesh'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="flex-shrink-0" />
              {doctor.experience_years ?? '—'} yrs experience
            </span>
            {(doctor.avg_rating > 0 || doctor.total_reviews > 0) && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                {doctor.avg_rating || '—'} ({doctor.total_reviews} reviews)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
          <span className="text-base">৳</span>
          {doctor.consultation_fee ?? '—'}
          <span className="font-normal text-gray-400 text-xs"> / visit</span>
        </span>

        <Link
          to={`/doctors/${doctor.id}`}
          className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-700 active:scale-95 transition-all"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
}
