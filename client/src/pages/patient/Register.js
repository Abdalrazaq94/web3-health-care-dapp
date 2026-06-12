// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientAuth } from '../../components/hooks/usePatientAuth';

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYTEyNWY5OS0xYWY3LTQwMGMtYWViNi1jMjkzNjc1ZTBjOTUiLCJlbWFpbCI6ImluZm8uYWJkOTR0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MGY1MmE3MTdmY2IxNzQ5ODYwYyIsInNjb3BlZEtleVNlY3JldCI6IjhjYTJkNDkxZjcwZWFmZmFlOWY3ZmVhZWE5MTY2MjhiMTc0MzJmOTEyNDBiZmE5OTc2ZTI2ZDBjZDQwMzMyMTYiLCJleHAiOjE4MDgwMDMwMzJ9.KW19Gvsx_UkNnh-0AdTlguuvrObwn50O633IY-IZsOw';
console.log("JWT:", PINATA_JWT);

async function uploadToIPFS(data) {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: { name: `patient-${Date.now()}` },
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error('❌ Pinata JSON error:', errText);
    throw new Error(`Failed to upload to IPFS: ${errText}`);
  }
  const result = await response.json();
  return result.IpfsHash;
}

async function uploadPhotoToIPFS(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify({ name: `photo-${Date.now()}` }));
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error('❌ Pinata photo error:', errText);
    throw new Error(`Failed to upload photo to IPFS: ${errText}`);
  }
  const result = await response.json();
  return result.IpfsHash;
}

function PatientRegister() {
  const navigate = useNavigate();
  const { address } = usePatientAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodType: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    chronicConditions: '',
    photo: null,
    medicalRecords: null,
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentStep < 3) e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!address) throw new Error('No wallet found. Please log in again.');

      // ── Step 1: Upload photo if provided ────────────────────────────────
      let photoCID = null;
      if (formData.photo) {
        setStatusMsg('📸 Uploading photo to IPFS...');
        photoCID = await uploadPhotoToIPFS(formData.photo);
      }

      // ── Step 2: Upload metadata to IPFS ─────────────────────────────────
      setStatusMsg('📦 Uploading profile data to IPFS...');
      const metadata = {
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        photoCID: photoCID || null,
      };
      const metadataHash = await uploadToIPFS(metadata);
      console.log('✅ IPFS hash:', metadataHash);

      // ── Step 3: Register on blockchain via relayer ───────────────────────
      setStatusMsg('⛓️ Registering on blockchain...');
      const response = await fetch('http://localhost:5000/api/register-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAddress: address,
          name: formData.name,
          age: Number(formData.age),
          bloodType: formData.bloodType,
          gender: formData.gender,
          metadataHash,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      console.log('✅ Registered, tx hash:', result.hash);
      setStatusMsg('');
      setIsSuccess(true);
      setTimeout(() => navigate('/patient/dashboard'), 2000);

    } catch (err) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
      setStatusMsg('');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = (e) => { e?.preventDefault(); e?.stopPropagation(); if (currentStep < 3) setCurrentStep(currentStep + 1); };
  const prevStep = (e) => { e?.preventDefault(); e?.stopPropagation(); if (currentStep > 1) setCurrentStep(currentStep - 1); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Patient Registration</h1>
          <p className="text-gray-600">Healthcare Management System - Your health, our priority</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    currentStep >= step ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'
                  }`}>{step}</div>
                  {step < 3 && <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
                <p className={`text-xs mt-2 transition-all duration-300 ${currentStep >= step ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {step === 1 && 'Basic Info'}{step === 2 && 'Contact & Emergency'}{step === 3 && 'Medical History'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="text-3xl mr-3">📋</span>Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="John Doe" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
                    <input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="25" min="1" max="150" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Type *</label>
                    <select value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" required>
                      <option value="">Select Blood Type</option>
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all" required>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="text-3xl mr-3">📞</span>Contact & Emergency Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="john@example.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="+44 7700 900000" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Physical Address *</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      placeholder="123 Main Street, City, Country" required />
                  </div>
                </div>
                <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center"><span className="text-2xl mr-2">🚨</span>Emergency Contact</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name *</label>
                      <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                        placeholder="Jane Doe" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone *</label>
                      <input type="tel" value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                        placeholder="+44 7700 900001" required />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="text-3xl mr-3">🏥</span>Medical Information & Documents</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Known Allergies</label>
                  <textarea value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="List any allergies..." rows="3" />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if none</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chronic Conditions</label>
                  <textarea value={formData.chronicConditions} onChange={(e) => setFormData({...formData, chronicConditions: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    placeholder="List any ongoing conditions..." rows="3" />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if none</p>
                </div>

                {/* File Uploads */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-all">
                      <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, photo: e.target.files[0]})} className="hidden" id="photo-upload" />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        {formData.photo
                          ? <div><div className="text-4xl">📸</div><p className="text-sm text-blue-600 font-semibold">{formData.photo.name}</p></div>
                          : <div><div className="text-4xl">👤</div><p className="text-sm text-gray-600">Click to upload photo</p><p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p></div>}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Optional - stored on IPFS</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Medical Records</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-all">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={(e) => setFormData({...formData, medicalRecords: e.target.files})} className="hidden" id="records-upload" />
                      <label htmlFor="records-upload" className="cursor-pointer">
                        {formData.medicalRecords?.length > 0
                          ? <div><div className="text-4xl">📄</div><p className="text-sm text-blue-600 font-semibold">{formData.medicalRecords.length} file(s) selected</p></div>
                          : <div><div className="text-4xl">🩺</div><p className="text-sm text-gray-600">Upload previous records</p><p className="text-xs text-gray-400">PDF, JPG, PNG</p></div>}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Optional - stored on IPFS</p>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center"><span className="text-xl mr-2">📜</span>Patient Agreement & Privacy Policy</h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    {[
                      'I consent to the storage of my medical data on the blockchain',
                      'I understand that I control access to my medical records',
                      'I agree to the Healthcare Management System privacy policy',
                      'I acknowledge that blockchain data is immutable and permanent',
                    ].map((t, i) => (
                      <li key={i} className="flex items-start"><span className="text-green-600 mr-2">✓</span><span>{t}</span></li>
                    ))}
                  </ul>
                </div>

                {/* Status message */}
                {statusMsg && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <p className="text-sm text-blue-700 font-semibold">{statusMsg}</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-sm text-red-700 font-semibold">❌ {error}</p>
                  </div>
                )}

                {/* Success */}
                {isSuccess && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                    <p className="font-bold text-green-800">✅ Registration Successful!</p>
                    <p className="text-sm text-green-700">Redirecting to your dashboard...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 flex justify-between items-center border-t-2">
            <button type="button" onClick={prevStep} disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 font-semibold hover:text-gray-800 disabled:opacity-0 transition-all">
              Previous
            </button>
            <div className="text-sm font-semibold text-gray-500 bg-white px-4 py-2 rounded-full shadow">Step {currentStep} of 3</div>
            {currentStep < 3 ? (
              <button type="button" onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                Next
              </button>
            ) : (
              <button type="submit" disabled={isLoading}
                className="px-10 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registering...
                  </span>
                ) : <span>Complete Registration</span>}
              </button>
            )}
          </div>
        </form>

        <div className="text-center mt-8">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-800 font-semibold transition-all">Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default PatientRegister;