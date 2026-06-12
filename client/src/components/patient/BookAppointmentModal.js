

// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { useState } from 'react';
import { usePatientAuth } from '../hooks/usePatientAuth';

function BookAppointmentModal({ doctor, onClose }) {
  const { address: patientAddress } = usePatientAuth();
  const [formData, setFormData] = useState({ date: '', time: '', reason: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const doctorAddress = doctor.walletAddress  || doctor[4];
  const doctorName    = doctor.name           || doctor[1] || 'Doctor';
  const spec          = doctor.specialization || doctor[2] || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAddress,
          doctorAddress,
          date: formData.date,
          time: formData.time,
          reason: formData.reason,
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setIsSuccess(true);
      setTimeout(() => { window.location.href = '/patient/dashboard'; }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden" style={{ animation: 'modalIn .3s ease-out' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2"><span>📅</span> Book Appointment</h2>
              <p className="text-blue-100 text-sm mt-1">Dr. {doctorName} · {spec}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-blue-200 text-3xl leading-none">×</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-green-800">Appointment Booked!</p>
                <p className="text-green-600 text-sm">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-semibold">❌ {errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">📅 Appointment Date *</span>
              <input type="date" required
                value={formData.date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"/>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">🕐 Preferred Time *</span>
              <input type="time" required
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"/>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">💬 Reason for Visit *</span>
              <textarea required rows="3"
                value={formData.reason} placeholder="Describe your symptoms or reason..."
                onChange={e => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"/>
            </label>

            {isLoading && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-blue-700 text-sm font-semibold">Booking appointment...</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isLoading || isSuccess}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                {isLoading
                  ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Booking...</>
                  : <><span>📅</span> Confirm Booking</>}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}

export default BookAppointmentModal;