import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, CalendarCheck, UserCheck, ShieldCheck } from 'lucide-react';

const POPULAR_SPECIALTIES = [
  { label: 'General Physician', icon: '🩺' },
  { label: 'Cardiologist', icon: '❤️' },
  { label: 'Dentist', icon: '🦷' },
  { label: 'Dermatologist', icon: '🧴' },
  { label: 'Pediatrician', icon: '👶' },
  { label: 'Orthopedic', icon: '🦴' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: <Search size={28} className="text-teal-600" />,
    title: 'Search a Doctor',
    desc: 'Find doctors by name, specialty, or location across Bangladesh.',
  },
  {
    step: '2',
    icon: <CalendarCheck size={28} className="text-teal-600" />,
    title: 'Book an Appointment',
    desc: 'Pick a convenient date and time slot from available schedules.',
  },
  {
    step: '3',
    icon: <UserCheck size={28} className="text-teal-600" />,
    title: 'Visit the Doctor',
    desc: 'Show up at the clinic and get the care you need. It\'s that simple.',
  },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('name', query.trim());
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Find &amp; Book Top Doctors<br className="hidden sm:block" /> in Bangladesh
          </h1>
          <p className="text-teal-100 text-lg mb-10">
            Trusted by thousands of patients. Verified doctors across every major city.
          </p>

          {/* Hero search bar */}
          <form onSubmit={handleHeroSearch} className="flex items-center bg-white rounded-xl shadow-xl overflow-hidden max-w-xl mx-auto">
            <Search size={18} className="ml-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by doctor name or specialty..."
              className="flex-1 px-3 py-3.5 text-gray-800 text-sm focus:outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-3.5 transition-colors"
            >
              Search
            </button>
          </form>

          <p className="text-teal-200 text-xs mt-4">
            Or{' '}
            <Link to="/doctors" className="underline underline-offset-2 hover:text-white">
              browse all doctors
            </Link>
          </p>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Popular Specialties</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Browse doctors by what you need</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_SPECIALTIES.map(({ label, icon }) => (
              <Link
                key={label}
                to={`/doctors?specialty=${encodeURIComponent(label)}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-teal-300 transition-all duration-200 p-5 flex flex-col items-center gap-2 group"
              >
                <span className="text-3xl">{icon}</span>
                <span className="text-xs font-medium text-gray-600 text-center group-hover:text-teal-600 leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">How It Works</h2>
          <p className="text-center text-gray-500 text-sm mb-12">Book your appointment in 3 easy steps</p>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-teal-100 -translate-y-1/2" />

            {HOW_IT_WORKS.map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-7 py-3 rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-md"
            >
              <Search size={17} />
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10 px-4 bg-teal-600 text-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck size={32} className="opacity-80" />
            <div>
              <p className="font-semibold text-sm">BMDC Verified Doctors</p>
              <p className="text-teal-200 text-xs">All doctors are licensed &amp; verified</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-teal-500" />
          <div className="flex items-center gap-3">
            <CalendarCheck size={32} className="opacity-80" />
            <div>
              <p className="font-semibold text-sm">Instant Booking</p>
              <p className="text-teal-200 text-xs">Confirm appointments in seconds</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-teal-500" />
          <div className="flex items-center gap-3">
            <UserCheck size={32} className="opacity-80" />
            <div>
              <p className="font-semibold text-sm">Trusted by Patients</p>
              <p className="text-teal-200 text-xs">Thousands of successful bookings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
