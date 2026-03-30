import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Clock, Star } from 'lucide-react';

const SPECIALTIES = [
  'Medicine', 'Cardiology', 'Orthopedics', 'Dermatology',
  'Gynecology', 'Pediatrics', 'Neurology', 'Eye',
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Book Doctor Appointments in Bangladesh
          </h1>
          <p className="text-teal-100 text-lg mb-8">
            Find experienced doctors near you and book appointments instantly.
          </p>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 bg-white text-teal-600 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
          >
            <Search size={18} />
            Find a Doctor
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: <Search size={28} className="text-teal-600" />, title: 'Find Doctors', desc: 'Search by specialty, location, and availability across Bangladesh.' },
            { icon: <Clock size={28} className="text-teal-600" />, title: 'Book Instantly', desc: 'Select a time slot and confirm your appointment in seconds.' },
            { icon: <ShieldCheck size={28} className="text-teal-600" />, title: 'Verified Doctors', desc: 'All doctors are verified with valid BMDC registration.' },
          ].map((f) => (
            <div key={f.title} className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Browse by Specialty</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SPECIALTIES.map((s) => (
              <Link
                key={s}
                to={`/doctors?specialty=${s}`}
                className="bg-white border border-gray-100 rounded-xl p-4 text-center text-sm font-medium text-gray-700 hover:border-teal-400 hover:text-teal-600 hover:shadow-sm transition-all"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
