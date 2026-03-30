import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctorsApi } from '../api/doctorsApi';
import DoctorCard from '../components/DoctorCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const SPECIALTIES = ['All', 'Medicine', 'Cardiology', 'Orthopedics', 'Dermatology', 'Gynecology', 'Pediatrics', 'Neurology', 'Eye'];

export default function DoctorSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || 'All');

  const fetchDoctors = async (params) => {
    setLoading(true);
    try {
      const res = await getDoctorsApi(params);
      setDoctors(res.data.doctors ?? res.data);
    } catch {
      toast.error('Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (specialty && specialty !== 'All') params.specialty = specialty;
    fetchDoctors(params);
  }, [specialty]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (query) params.q = query;
    if (specialty && specialty !== 'All') params.specialty = specialty;
    setSearchParams(params);
    fetchDoctors(params);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find a Doctor</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button type="submit" className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
          Search
        </button>
      </form>

      {/* Specialty filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              specialty === s
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <SlidersHorizontal size={40} className="mx-auto mb-3 opacity-50" />
          <p>No doctors found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => <DoctorCard key={doc._id} doctor={doc} />)}
        </div>
      )}
    </div>
  );
}
