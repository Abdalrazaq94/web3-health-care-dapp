
// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../../utils/uploadToIPFS';

function DoctorRegister() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '', specialization: '', licenseNumber: '',
    email: '', phone: '',
    hospital: '', consultationFee: '', yearsOfExperience: '', bio: '',
    languages: [], languageInput: '',
    photo: null, certificate: null,
  });

  const handleKeyDown = (e) => { if (e.key === 'Enter' && currentStep < 4) e.preventDefault(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setErrorMsg('');

    try {
      // ── 1. Upload photo ──────────────────────────────────────────────────
      let photoCID = '';
      if (formData.photo) {
        setUploadStatus('📸 Uploading profile photo to IPFS...');
        photoCID = await uploadFileToIPFS(formData.photo);
      }

      // ── 2. Upload certificate ────────────────────────────────────────────
      let certificateCID = '';
      if (formData.certificate) {
        setUploadStatus('📋 Uploading medical certificate to IPFS...');
        certificateCID = await uploadFileToIPFS(formData.certificate);
      }

      // ── 3. Upload metadata JSON ──────────────────────────────────────────
      setUploadStatus('📦 Uploading profile metadata to IPFS...');
      const metadata = {
        email: formData.email, phone: formData.phone,
        hospital: formData.hospital,
        consultationFee: formData.consultationFee,
        yearsOfExperience: formData.yearsOfExperience,
        bio: formData.bio, languages: formData.languages,
        photoCID, certificateCID,
        registeredAt: new Date().toISOString(),
      };
      const metadataHash = await uploadJSONToIPFS(metadata, `doctor-${formData.name}`);

      // ── 4. Call relayer backend ──────────────────────────────────────────
      setUploadStatus('⛓️ Registering on blockchain...');
      const res = await fetch('http://localhost:5000/api/register-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorAddress: address,
          name: formData.name,
          specialization: formData.specialization,
          license: formData.licenseNumber,
          metadataHash,
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      console.log('✅ Doctor registered, tx:', result.hash);
      setIsSuccess(true);

    } catch (error) {
      console.error('Registration error:', error);
      setErrorMsg('Registration failed: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const nextStep = (e) => { e?.preventDefault(); e?.stopPropagation(); if (currentStep < 4) setCurrentStep(currentStep + 1); };
  const prevStep = (e) => { e?.preventDefault(); e?.stopPropagation(); if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const addLanguage = () => {
    if (formData.languageInput.trim()) {
      setFormData({ ...formData, languages: [...formData.languages, formData.languageInput.trim()], languageInput: '' });
    }
  };
  const removeLanguage = (index) => setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== index) });

  // ── Success screen ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-2xl text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Registration Submitted!</h2>
          <p className="text-gray-600 mb-2 text-lg">Your doctor registration is pending approval from the admin.</p>
          <p className="text-gray-500 mb-8">Your profile and documents have been stored on IPFS. You will be notified once your account is approved.</p>
          <button onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 font-semibold shadow-lg transition-all">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Doctor Registration</h1>
          <p className="text-gray-600">Join NHS Healthcare System - Provide quality care to patients</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1,2,3,4].map((step) => (
              <div key={step} className="flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'}`}>{step}</div>
                  {step < 4 && <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />}
                </div>
                <p className={`text-xs mt-2 transition-all duration-300 ${currentStep >= step ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                  {step === 1 && 'Basic Info'}{step === 2 && 'Contact Details'}{step === 3 && 'Professional Info'}{step === 4 && 'Experience & Bio'}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="text-3xl mr-3">👨‍⚕️</span>Basic Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="Dr. John Smith" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization *</label>
                    <select value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all" required>
                      <option value="">Select Specialization</option>
                      {['General Practice','Cardiology','Neurology','Pediatrics','Orthopedics','Dermatology','Psychiatry','Radiology','Surgery','Oncology','Gynecology','Ophthalmology','ENT','Other'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medical License Number *</label>
                    <input type="text" value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="GMC-123456" required />
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm text-yellow-800 flex items-start"><span className="text-xl mr-2">⚠️</span><span><strong>Note:</strong> Your registration requires admin approval before you can accept appointments.</span></p>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="text-3xl mr-3">📧</span>Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="doctor@hospital.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="+44 20 1234 5678" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Languages Spoken</label>
                    <div className="flex gap-2">
                      <input type="text" value={formData.languageInput} onChange={(e) => setFormData({...formData, languageInput: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                        placeholder="Type a language and press Add" />
                      <button type="button" onClick={addLanguage} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">Add</button>
                    </div>
                    {formData.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.languages.map((lang, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {lang}<button type="button" onClick={() => removeLanguage(index)} className="ml-2 text-green-600 hover:text-green-800">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="text-3xl mr-3">🏥</span>Professional Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hospital/Clinic Name *</label>
                    <input type="text" value={formData.hospital} onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="General Hospital" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee (£) *</label>
                    <input type="number" value={formData.consultationFee} onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="100" min="0" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience *</label>
                    <input type="number" value={formData.yearsOfExperience} onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                      placeholder="10" min="0" max="60" required />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="text-3xl mr-3">📝</span>About You & Documents</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Bio *</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all"
                    placeholder="Tell us about your experience, areas of expertise, education..." rows="6" required />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-all">
                      <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, photo: e.target.files[0]})} className="hidden" id="photo-upload" />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        {formData.photo ? <div><div className="text-4xl">📸</div><p className="text-sm text-green-600 font-semibold">{formData.photo.name}</p></div>
                          : <div><div className="text-4xl">👤</div><p className="text-sm text-gray-600">Click to upload photo</p><p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p></div>}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Certificate</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-all">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFormData({...formData, certificate: e.target.files[0]})} className="hidden" id="cert-upload" />
                      <label htmlFor="cert-upload" className="cursor-pointer">
                        {formData.certificate ? <div><div className="text-4xl">📄</div><p className="text-sm text-green-600 font-semibold">{formData.certificate.name}</p></div>
                          : <div><div className="text-4xl">📋</div><p className="text-sm text-gray-600">Click to upload certificate</p><p className="text-xs text-gray-400">PDF, JPG, PNG (Max 10MB)</p></div>}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-green-800 flex items-start"><span className="text-xl mr-2">🔗</span>
                    <span><strong>Decentralised Storage:</strong> Your photo, certificate, and profile details will be uploaded to IPFS before the blockchain transaction is submitted.</span></p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-lg">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center"><span className="text-xl mr-2">📜</span>Doctor Agreement & Code of Conduct</h4>
                  <ul className="text-sm text-green-800 space-y-2">
                    {['I agree to uphold the highest standards of medical ethics and patient care',
                      'I understand that all medical records on the blockchain are immutable',
                      'I will only access patient records with proper authorisation',
                      'I acknowledge that my registration requires admin approval'].map((t, i) => (
                      <li key={i} className="flex items-start"><span className="text-green-600 mr-2">✓</span><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Status messages */}
            {isUploading && uploadStatus && (
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-blue-600 flex-shrink-0" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <div><p className="font-bold text-blue-800">Please wait...</p><p className="text-sm text-blue-700">{uploadStatus}</p></div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-800 font-semibold">❌ {errorMsg}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 flex justify-between items-center border-t-2">
            <button type="button" onClick={prevStep} disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 font-semibold hover:text-gray-800 disabled:opacity-0 transition-all">
              ← Previous
            </button>
            <div className="text-sm font-semibold text-gray-500 bg-white px-4 py-2 rounded-full shadow">Step {currentStep} of 4</div>
            {currentStep < 4 ? (
              <button type="button" onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg">
                Next →
              </button>
            ) : (
              <button type="submit" disabled={isUploading}
                className="px-10 py-3 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                {isUploading
                  ? <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Registering...</span>
                  : <span>🎉 Submit Registration</span>}
              </button>
            )}
          </div>
        </form>

        <div className="text-center mt-8">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-800 font-semibold transition-all">← Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegister;