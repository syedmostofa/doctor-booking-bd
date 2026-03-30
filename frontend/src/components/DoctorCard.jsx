import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';

export default function DoctorCard({ doctor }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl flex-shrink-0">
          {doctor.name?.charAt(0) ?? 'D'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">Dr. {doctor.name}</h3>
          <p className="text-teal-600 text-sm font-medium">{doctor.specialty}</p>
          <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
            <MapPin size={12} />
            <span className="truncate">{doctor.location || 'Dhaka, Bangladesh'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="flex items-center gap-1">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
            {doctor.rating ?? '4.5'}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {doctor.experience ?? '5'} yrs
          </span>
        </div>
        <span className="font-semibold text-gray-800">৳{doctor.fee ?? '500'}</span>
      </div>

      <Link
        to={`/doctors/${doctor._id}`}
        className="mt-4 block w-full text-center bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
      >
        View Profile
      </Link>
    </div>
  );
}
