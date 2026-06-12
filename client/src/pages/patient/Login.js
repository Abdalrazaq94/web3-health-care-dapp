// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { usePrivy } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function PatientLogin() {
  const { ready, authenticated, login, user } = usePrivy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState(null); // 'email' | 'passkey'

  // If already logged in — go to dashboard
  useEffect(() => {
    if (ready && authenticated) {
      navigate('/patient/dashboard');
    }
  }, [ready, authenticated, navigate]);

  const handleLogin = async (loginMethod) => {
    setMethod(loginMethod);
    setLoading(true);
    try {
      await login({ loginMethods: [loginMethod] });
    } catch (err) {
      console.error('Login error:', err);
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏥</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Patient Portal</h1>
            <p className="text-blue-100 text-sm mt-1"> Healthcare System</p>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            <p className="text-center text-gray-600 text-sm mb-8">
              Sign in securely to access your health records
            </p>

            {/* Login options */}
            <div className="space-y-4">

              {/* Email OTP */}
              <button
                onClick={() => handleLogin('email')}
                disabled={loading}
                className="w-full flex items-center gap-4 px-6 py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📧</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">Email Code</p>
                  <p className="text-xs text-gray-500">We'll send a 6-digit code to your email</p>
                </div>
                {loading && method === 'email'
                  ? <svg className="animate-spin h-5 w-5 text-blue-600 ml-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <span className="ml-auto text-blue-400 group-hover:text-blue-600">→</span>}
              </button>

              {/* Passkey (Fingerprint / Face ID) */}
              <button
                onClick={() => handleLogin('passkey')}
                disabled={loading}
                className="w-full flex items-center gap-4 px-6 py-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 rounded-2xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🔐</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">Fingerprint / Face ID</p>
                  <p className="text-xs text-gray-500">Use your device biometrics to sign in</p>
                </div>
                {loading && method === 'passkey'
                  ? <svg className="animate-spin h-5 w-5 text-purple-600 ml-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <span className="ml-auto text-purple-400 group-hover:text-purple-600">→</span>}
              </button>

            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <p className="text-xs text-gray-400 font-semibold">SECURE & PRIVATE</p>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Security badges */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-lg mb-1">🔒</p>
                <p className="text-xs text-green-700 font-semibold">End-to-end encrypted</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-lg mb-1">🛡️</p>
                <p className="text-xs text-blue-700 font-semibold">GDPR compliant</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-lg mb-1">⛓️</p>
                <p className="text-xs text-purple-700 font-semibold">Blockchain secured</p>
              </div>
            </div>

            {/* Back to home */}
            <button
              onClick={() => navigate('/')}
              className="w-full mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to home
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          No password needed. No crypto wallet required.
        </p>
      </div>
    </div>
  );
}

export default PatientLogin;