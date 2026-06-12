
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
import AppointmentCard from './AppointmentCard';
import { useEffect, useState } from 'react';

function AppointmentsList() {
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

  const filters = [
    { value: 'all',       label: 'All',       cls: 'bg-gray-100 text-gray-700' },
    { value: 'pending',   label: 'Pending',   cls: 'bg-orange-100 text-orange-700' },
    { value: 'approved',  label: 'Approved',  cls: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Completed', cls: 'bg-green-100 text-green-700' },
  ];

  return (
    <div style={{ animation: 'fadeIn .4s ease-out' }}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>📅</span> Appointments
        </h3>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filter === f.value
                  ? f.cls + ' shadow ring-2 ring-offset-1 ring-current'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {appointmentIds.length === 0 ? (
        <EmptyState icon="📅" title="No Appointments Yet" subtitle="When patients book appointments with you, they will appear here." />
      ) : (
        <div className="space-y-4">
          {appointmentIds.map(id => (
            <FilteredCard key={id} appointmentId={id} filter={filter} />
          ))}
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function FilteredCard({ appointmentId, filter }) {
  const { data: appointment } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
    functionName: 'appointments', args: [appointmentId],
  });
  if (!appointment) return null;
  const status = Number(appointment[6]);
  if (filter === 'pending'   && status !== 0) return null;
  if (filter === 'approved'  && status !== 1) return null;
  if (filter === 'completed' && status !== 3) return null;
  return <AppointmentCard appointmentId={appointmentId} />;
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <div className="text-6xl mb-4">{icon}</div>
      <h4 className="text-xl font-bold text-gray-700 mb-2">{title}</h4>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );
}

export default AppointmentsList;