// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import DoctorCard from '../../components/patient/DoctorCard';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const SPECIALIZATIONS = [
  'General Practice', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics',
  'Dermatology', 'Psychiatry', 'Radiology', 'Surgery', 'Oncology',
  'Gynecology', 'Ophthalmology', 'ENT', 'Endocrinology', 'Urology',
];

function BrowseDoctors() {
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [availFilter, setAvailFilter] = useState('all'); // all | available | unavailable

  const { data: allDoctors } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'getAllApprovedDoctors',
    enabled: !isSearching,
  });

  const { data: filteredDoctors } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'getDoctorsBySpecialization',
    args: [search],
    enabled: isSearching && search.length > 0,
  });

  const doctors = (isSearching ? filteredDoctors : allDoctors) || [];

  // Apply availability filter on top
  const displayed = doctors.filter(d => {
    const active = d.isActive ?? d[6];
    if (availFilter === 'available')   return active;
    if (availFilter === 'unavailable') return !active;
    return true;
  });

  const handleSearch = () => { if (search.trim()) setIsSearching(true); };
  const handleClear  = () => { setSearch(''); setIsSearching(false); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>🏥</span> Browse Doctors
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {displayed.length} doctor{displayed.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button onClick={() => navigate('/patient/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow text-blue-600 font-semibold hover:shadow-md transition-all">
            ← Dashboard
          </button>
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6">

          {/* Search bar */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && search.trim()) handleSearch(); }}
                placeholder="Search by specialization (e.g. Cardiology, Pediatrics)..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"/>
            </div>
            <button onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow transform hover:scale-105">
              Search
            </button>
            {isSearching && (
              <button onClick={handleClear}
                className="px-5 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                Clear
              </button>
            )}
          </div>

          {/* Quick specialization chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SPECIALIZATIONS.map(s => (
              <button key={s}
                onClick={() => { setSearch(s); setIsSearching(true); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  search === s && isSearching
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {s}
              </button>
            ))}
          </div>

          {/* Availability filter */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            {[
              { value: 'all',         label: '👥 All Doctors' },
              { value: 'available',   label: '🟢 Available'   },
              { value: 'unavailable', label: '🔴 Unavailable' },
            ].map(f => (
              <button key={f.value} onClick={() => setAvailFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  availFilter === f.value
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor cards grid */}
        {displayed.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🏥</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">
              {isSearching ? `No doctors found for "${search}"` : 'No approved doctors yet'}
            </h4>
            {isSearching && (
              <button onClick={handleClear}
                className="mt-4 text-blue-600 font-semibold hover:underline">
                Show all doctors
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayed.map((doctor, i) => (
              <DoctorCard key={i} doctor={doctor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseDoctors;