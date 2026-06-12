
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University    
    import { useState } from 'react';
    import { useReadContract } from 'wagmi';
    import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract';
    import PatientRow from '../../components/admin/PatientRow';
    import PatientProfileModal from '../../components/admin/PatientProfileModal';

    // Same pattern: loop through patientCount and fetch each by ID
    function PatientsPage() {
    const [viewingId, setViewingId] = useState(null);

    const { data: countData } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'patientCount',
    });
    const total = countData ? Number(countData) : 0;
    const patientIds = Array.from({ length: total }, (_, i) => i + 1);

    return (
        <div style={{ animation: 'fadeUp .3s ease-out' }}>
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-gray-800">Registered Patients</h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{total}</span>
            </div>
        </div>

        {total === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
            <p className="text-5xl mb-4">patients</p>
            <p className="font-bold text-gray-700 text-lg">No patients registered yet</p>
            <p className="text-sm text-gray-400 mt-1">Registered patients will appear here</p>
            </div>
        ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                    {['Patient', 'Age / Gender', 'Blood', 'Records', 'Appts', 'Joined', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {patientIds.map(id => (
                    <PatientRow key={id} patientId={id} onViewProfile={setViewingId} />
                ))}
                </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                {total} patient{total !== 1 ? 's' : ''} registered on the Ethereum blockchain
                </p>
            </div>
            </div>
        )}

        {viewingId !== null && (
            <PatientProfileModal patientId={viewingId} onClose={() => setViewingId(null)} />
        )}

        <style>{"@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}"}</style>
        </div>
    );
    }

    export default PatientsPage;