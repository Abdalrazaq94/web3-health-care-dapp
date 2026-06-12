// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import DoctorAccessCard from '../../components/patient/DoctorAccessCard';

function ManageAccess() {
  const { address } = useAccount();
  const navigate    = useNavigate();
  const [appointmentIds, setAppointmentIds] = useState([]);
  const [uniqueDoctors, setUniqueDoctors]   = useState(new Set());

  const { data: appointmentCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointmentCount',
  });

  useEffect(() => {
    if (!appointmentCount) return;
    const count = Number(appointmentCount);
    const ids = [];
    for (let i = 1; i <= count; i++) ids.push(i);
    setAppointmentIds(ids);
  }, [appointmentCount]);

  // useCallback prevents infinite re-renders
  const handleDoctorFound = useCallback((doctorAddress) => {
    setUniqueDoctors(prev => new Set([...prev, doctorAddress]));
  }, []);

  const doctorList = Array.from(uniqueDoctors);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>🔐</span> Manage Doctor Access
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Control which doctors can view your medical records
            </p>
          </div>
          <button onClick={() => navigate('/patient/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow text-blue-600 font-semibold hover:shadow-md transition-all">
            ← Dashboard
          </button>
        </div>

        {/* Info banner */}
        <div className="p-5 bg-blue-50 border-l-4 border-blue-500 rounded-xl mb-6 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🛡️</span>
          <div>
            <p className="font-semibold text-blue-900">Your Data, Your Control</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Grant or revoke a doctor's access to your medical records at any time.
              Revoking access does not delete your records — it only prevents the doctor from viewing them.
            </p>
          </div>
        </div>

        {/* Hidden extractors — find all unique doctors from appointments */}
        {appointmentIds.map(id => (
          <DoctorExtractor
            key={id}
            appointmentId={id}
            patientAddress={address}
            onDoctorFound={handleDoctorFound}
          />
        ))}

        {/* Doctor access cards */}
        {doctorList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🔐</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Doctors Yet</h4>
            <p className="text-gray-500 text-sm mb-6">
              Doctors you've had appointments with will appear here.
            </p>
            <button onClick={() => navigate('/patient/browse-doctors')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all transform hover:scale-105">
              Browse Doctors
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-semibold">
              {doctorList.length} doctor{doctorList.length !== 1 ? 's' : ''} found
            </p>
            {doctorList.map(addr => (
              <DoctorAccessCard key={addr} doctorAddress={addr} patientAddress={address} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Silent extractor — reads appointment, fires callback if patient matches
function DoctorExtractor({ appointmentId, patientAddress, onDoctorFound }) {
  const { data: appointment } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointments', args: [appointmentId],
  });

  useEffect(() => {
    if (appointment && appointment[1]?.toLowerCase() === patientAddress?.toLowerCase()) {
      onDoctorFound(appointment[2]);
    }
  }, [appointment, patientAddress, onDoctorFound]);

  return null;
}

export default ManageAccess;