
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University


import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import { useEffect, useState, useCallback } from 'react';
import PatientCard      from './PatientCard';
import PatientExtractor from './PatientExtractor';

function PatientsList() {
  const { address } = useAccount();
  const [patientAddresses, setPatientAddresses] = useState(new Set());
  const [appointmentIds,   setAppointmentIds]   = useState([]);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filterAccess,  setFilterAccess]  = useState('all');

  const { data: appointmentCount } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'appointmentCount',
  });

  useEffect(() => {
    if (!appointmentCount) return;
    const count = Number(appointmentCount);
    const ids = [];
    for (let i = 1; i <= count; i++) ids.push(i);
    setAppointmentIds(ids);
  }, [appointmentCount]);

  const handlePatientFound = useCallback((patientAddress) => {
    setPatientAddresses(prev => {
      const next = new Set(prev);
      next.add(patientAddress);
      return next;
    });
  }, []);

  const patientList = Array.from(patientAddresses);

  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      {/* Hidden extractors */}
      {appointmentIds.map(id => (
        <PatientExtractor key={id} appointmentId={id} doctorAddress={address} onPatientFound={handlePatientFound} />
      ))}

      {/* Search & filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search patients by name..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all" />
        </div>
        <select value={filterAccess} onChange={e => setFilterAccess(e.target.value)}
          className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white font-semibold text-gray-700">
          <option value="all">All Patients</option>
          <option value="granted">Access Granted</option>
          <option value="no-access">No Access</option>
        </select>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500 font-semibold">
          {patientList.length === 0 ? 'No patients found' : `${patientList.length} patient${patientList.length > 1 ? 's' : ''}`}
        </span>
        {patientList.length > 0 && (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">{patientList.length}</span>
        )}
      </div>

      {patientList.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">👥</div>
          <h4 className="text-xl font-bold text-gray-700 mb-2">No Patients Yet</h4>
          <p className="text-gray-500 text-sm">Patients will appear here after they book appointments with you.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {patientList.map(addr => (
            <FilteredPatientCard key={addr} patientAddress={addr} searchTerm={searchTerm} filterAccess={filterAccess} />
          ))}
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function FilteredPatientCard({ patientAddress, searchTerm, filterAccess }) {
  const { address: doctorAddress } = useAccount();

  const { data: patient } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'patients', args: [patientAddress],
  });

  const { data: hasAccess } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'checkAccess', args: [patientAddress, doctorAddress],
  });

  if (!patient) return null;
  const name = patient[1]?.toLowerCase() || '';
  if (searchTerm && !name.includes(searchTerm.toLowerCase())) return null;
  if (filterAccess === 'granted'   && !hasAccess) return null;
  if (filterAccess === 'no-access' &&  hasAccess) return null;

  return <PatientCard patientAddress={patientAddress} />;
}

export default PatientsList;