// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useNavigate } from 'react-router-dom';
import AppointmentCard from '../../components/patient/AppointmentCard';
import { useEffect, useState } from 'react';

const FILTERS = [
  { value: 'all',       label: 'All',          active: 'bg-blue-600 text-white',   inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200'     },
  { value: 'pending',   label: '⏳ Pending',    active: 'bg-orange-500 text-white', inactive: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
  { value: 'approved',  label: '✅ Approved',   active: 'bg-blue-500 text-white',   inactive: 'bg-blue-50 text-blue-600 hover:bg-blue-100'       },
  { value: 'completed', label: '✓ Completed',  active: 'bg-green-600 text-white',  inactive: 'bg-green-50 text-green-600 hover:bg-green-100'    },
  { value: 'cancelled', label: '🚫 Cancelled',  active: 'bg-gray-600 text-white',   inactive: 'bg-gray-50 text-gray-500 hover:bg-gray-100'       },
];

function Appointments() {
  const navigate = useNavigate();
  const [appointmentIds, setAppointmentIds] = useState([]);
  const [filter, setFilter] = useState('all');

  const { data: appointmentCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointmentCount',
  });

  useEffect(() => {
    if (!appointmentCount) return;
    const count = Number(appointmentCount);
    const ids = [];
    for (let i = count; i >= 1; i--) ids.push(i); // newest first
    setAppointmentIds(ids);
  }, [appointmentCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>📅</span> My Appointments
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {appointmentIds.length} total appointment{appointmentIds.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => navigate('/patient/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow text-blue-600 font-semibold hover:shadow-md transition-all">
            ← Dashboard
          </button>
        </div>

        {/* Filter pills */}
        <div className="bg-white rounded-2xl shadow p-4 mb-6 flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f.value ? f.active : f.inactive}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {appointmentIds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📅</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Appointments Yet</h4>
            <p className="text-gray-500 text-sm mb-6">Book your first appointment with a doctor.</p>
            <button onClick={() => navigate('/patient/browse-doctors')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              Browse Doctors
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointmentIds.map(id => (
              <AppointmentCard key={id} appointmentId={id} filter={filter} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointments;