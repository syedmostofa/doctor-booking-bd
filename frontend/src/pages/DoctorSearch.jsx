import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDoctorsApi } from '../api/doctorsApi';
import DoctorCard from '../components/DoctorCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dentist',
  'Dermatologist',
  'Gynecologist',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
];

const LOCATIONS = ['Sylhet', 'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna'];

export default function DoctorSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get('name') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const buildParams = () => {
    const params = {};
    if (name.trim()) params.name = name.trim();
    if (specialty) params.specialty = specialty;
    if (location) params.location = location;
    return params;
  };

  const fetchDoctors = async (params) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await getDoctorsApi(params);
      setDoctors(res.data.doctors ?? res.data ?? []);
    } catch {
      toast.error('Failed to load doctors.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Run search on initial load if URL has params
  useEffect(() => {
    const initialParams = {};
    if (searchParams.get('name')) initialParams.name = searchParams.get('name');
    if (searchParams.get('specialty')) initialParams.specialty = searchParams.get('specialty');
    if (searchParams.get('location')) initialParams.location = searchParams.get('location');
    if (Object.keys(initialParams).length > 0) {
      fetchDoctors(initialParams);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = buildParams();
    setSearchParams(params);
    fetchDoctors(params);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Find a Doctor</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Name search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Search by doctor name..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Specialty dropdown */}
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="sm:w-52 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Location dropdown */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="sm:w-44 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 active:scale-95 transition-all whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-9 h-9 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : searched && doctors.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <SlidersHorizontal size={44} className="mx-auto mb-3 opacity-40" />
          <p className="text-base">No doctors found.</p>
          <p className="text-sm mt-1">Try a different name, specialty, or location.</p>
        </div>
      ) : !searched ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={44} className="mx-auto mb-3 opacity-40" />
          <p className="text-base">Use the filters above to find doctors.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <DoctorCard key={doc._id} doctor={doc} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
