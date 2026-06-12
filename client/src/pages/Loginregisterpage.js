// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University
import { useState, useEffect } from "react";
import { useConnect, useAccount, useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { useNavigate } from "react-router-dom";
import HomeNavbar from "../components/shared/Homenavbar";
import HomeFooter from "../components/shared/Homefooter";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/contract";

const ADMIN_ADDRESS = "0xae84AC4dc6049f4014DA54cCcD341A74D6203868";

function Icon({ name, className = "w-5 h-5" }) {
  const paths = {
    metamask: (
      <svg className={className} viewBox="0 0 318.6 318.6" fill="none">
        <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1,35.5 174.6,109.4 193,65.8"/>
        <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4,35.5 143.1,110.1 125.6,65.8"/>
        <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="238.3,206.8 211.8,247.4 268.5,263 284.8,207.7"/>
        <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="33.9,207.7 50.1,263 106.8,247.4 80.3,206.8"/>
        <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="103.6,138.2 87.8,162.1 144.1,164.6 142.1,104.1"/>
        <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="214.9,138.2 175.9,103.4 174.6,164.6 230.8,162.1"/>
        <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="106.8,247.4 140.6,230.9 111.4,208.1"/>
        <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="177.9,230.9 211.8,247.4 207.1,208.1"/>
      </svg>
    ),
  };
  if (name === "metamask") return paths.metamask;

  const icons = {
    shield:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>,
    check:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>,
    stethoscope:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>,
    fingerprint:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>,
    zap:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>,
    hospital:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>,
    arrow:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>,
    wallet:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>,
    key:        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>,
    lock:       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>,
  };

  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name] || icons.shield}
    </svg>
  );
}

function ConnectWalletButton() {
  const { connect, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const isAdmin = address && address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const { data: doctorInfo } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "doctors",
    args: [address],
    enabled: !!address && isConnected && !isAdmin,
  });

  const isRegisteredDoctor = !isAdmin && doctorInfo && doctorInfo[1] && doctorInfo[1] !== "";

  const redirectNow = () => {
    if (isAdmin) navigate("/admin/dashboard");
    else if (isRegisteredDoctor) navigate("/doctor/dashboard");
    else navigate("/doctor/register");
  };

  useEffect(() => {
    if (!shouldRedirect || !isConnected) return;
    if (isAdmin) { navigate("/admin/dashboard"); setShouldRedirect(false); return; }
    if (doctorInfo !== undefined) {
      navigate(isRegisteredDoctor ? "/doctor/dashboard" : "/doctor/register");
      setShouldRedirect(false);
    }
  }, [shouldRedirect, isConnected, isAdmin, doctorInfo, isRegisteredDoctor, navigate]);

  const handleConnect = async () => {
    if (isConnected) { redirectNow(); return; }
    setConnecting(true);
    try {
      connect({ connector: injected() }, {
        onSuccess: () => { setShouldRedirect(true); setConnecting(false); },
        onError: () => setConnecting(false),
      });
    } catch (_) { setConnecting(false); }
  };

  const busy = isPending || connecting || (shouldRedirect && !isAdmin && doctorInfo === undefined);
  const connectedLabel = isAdmin ? "Go to Admin Dashboard" : isRegisteredDoctor ? "Go to Dashboard" : "Register as Doctor";

  return (
    <div className="space-y-3">
      <button
        onClick={handleConnect}
        disabled={busy}
        className="group flex items-center justify-center gap-3 w-full py-5 bg-white hover:bg-emerald-50 text-emerald-800 font-black rounded-2xl shadow-2xl shadow-black/20 transition-all transform hover:scale-[1.02] text-base disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {busy ? (
          <>
            <svg className="animate-spin h-5 w-5 text-emerald-700" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting...
          </>
        ) : isConnected ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span className="font-mono text-sm text-emerald-700">{address?.slice(0,6)}...{address?.slice(-4)}</span>
            <span className="text-emerald-800 font-black">→ {connectedLabel}</span>
          </>
        ) : (
          <>
            <Icon name="metamask" className="w-6 h-6 flex-shrink-0" />
            Connect Wallet
            <Icon name="arrow" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {isConnected && (
        <p className="text-emerald-300/80 text-xs text-center font-semibold">
          Wallet connected · {isAdmin ? "Admin detected" : isRegisteredDoctor ? "Doctor account found" : "New doctor — complete registration"}
        </p>
      )}
      {!isConnected && (
        <p className="text-white/50 text-xs text-center">
          Wallet detected automatically · Register or login in one step
        </p>
      )}
    </div>
  );
}

// Doctor info cards — SVG icons only
const DOCTOR_CARDS = [
  {
    icon: "metamask",
    title: "MetaMask Required",
    desc: "Doctors use MetaMask for on-chain accountability",
  },
  {
    icon: "check",
    title: "Admin Verified",
    desc: "Credentials reviewed and approved on Ethereum",
  },
  {
    icon: "stethoscope",
    title: "Full Clinical Access",
    desc: "Add records, manage appointments, view patients",
  },
];

// Patient info cards — SVG icons only
const PATIENT_CARDS = [
  {
    icon: "fingerprint",
    title: "Passkey Login",
    desc: "Biometric or device PIN — no password needed",
  },
  {
    icon: "zap",
    title: "No Wallet Required",
    desc: "Gas fees covered — you never touch crypto",
  },
  {
    icon: "hospital",
    title: "Full Patient Access",
    desc: "Records, appointments, access control — all yours",
  },
];

export default function LoginRegisterPage() {
  const [hoveredSide, setHoveredSide] = useState(null);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        .side-panel { transition: flex 0.6s cubic-bezier(0.4,0,0.2,1); }
        .side-panel:hover { flex: 1.18; }
        .card-hover { transition: all 0.25s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
      `}</style>

      <HomeNavbar />

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden pt-[72px]">

        {/* LEFT — Doctor (green/teal) */}
        <div
          className="side-panel relative flex-1 flex flex-col items-center justify-center px-8 py-16 min-h-screen overflow-hidden"
          style={{ background: "linear-gradient(135deg, #065f46 0%, #0d9488 50%, #0891b2 100%)" }}
          onMouseEnter={() => setHoveredSide("doctor")}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-5 w-48 h-48 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />

          {/* Floating wallet bg icon */}
          <div className="absolute top-1/4 right-8 opacity-10 pointer-events-none"
            style={{ animation: "floatY 4s ease-in-out infinite" }}>
            <Icon name="wallet" className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10 w-full max-w-sm" style={{ animation: "fadeUp .6s ease-out both" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-white/90 text-xs font-bold tracking-widest uppercase">For Doctors</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Join as a<br />
              <span className="text-emerald-300">Verified Doctor</span>
            </h2>

            <p className="text-white/70 text-base leading-relaxed mb-10">
              Connect your MetaMask wallet — one button to register or access your dashboard. Your identity is cryptographically verified on Ethereum.
            </p>

            <div className="space-y-3 mb-10">
              {DOCTOR_CARDS.map((item, i) => (
                <div key={i} className="card-hover flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{item.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <ConnectWalletButton />

            <p className="text-white/30 text-xs text-center mt-4">
              MetaMask extension required · Sepolia testnet
            </p>
          </div>
        </div>

        {/* OR divider — desktop */}
        <div className="hidden md:flex flex-col items-center justify-center z-20 relative" style={{ width: 0 }}>
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
            <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
            <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
              <span className="text-xs font-black text-gray-500">OR</span>
            </div>
            <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
          </div>
        </div>

        {/* OR divider — mobile */}
        <div className="md:hidden flex items-center gap-4 px-8 py-4 bg-gray-100">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* RIGHT — Patient (blue/indigo) */}
        <div
          className="side-panel relative flex-1 flex flex-col items-center justify-center px-8 py-16 min-h-screen overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #2563eb 100%)" }}
          onMouseEnter={() => setHoveredSide("patient")}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-5 w-48 h-48 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />

          {/* Floating fingerprint bg icon */}
          <div className="absolute top-1/4 left-8 opacity-10 pointer-events-none"
            style={{ animation: "floatY 5s ease-in-out infinite 1s" }}>
            <Icon name="fingerprint" className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10 w-full max-w-sm" style={{ animation: "fadeUp .6s ease-out .15s both" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
              <span className="text-white/90 text-xs font-bold tracking-widest uppercase">For Patients</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Join as a<br />
              <span className="text-blue-300">Patient</span>
            </h2>

            <p className="text-white/70 text-base leading-relaxed mb-10">
              Register or log in with your email and biometric passkey. No crypto wallet needed — no gas fees, ever. Your identity is secured by Privy.
            </p>

            <div className="space-y-3 mb-10">
              {PATIENT_CARDS.map((item, i) => (
                <div key={i} className="card-hover flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{item.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <a href="/patient/register"
                className="group flex items-center justify-center gap-3 w-full py-4 bg-white hover:bg-blue-50 text-indigo-800 font-black rounded-2xl shadow-2xl shadow-black/20 transition-all transform hover:scale-[1.02] text-base">
                <Icon name="hospital" className="w-5 h-5 text-indigo-600" />
                Register as Patient
                <Icon name="arrow" className="w-4 h-4 group-hover:translate-x-1 transition-transform text-indigo-600" />
              </a>
              <a href="/patient/login"
                className="flex items-center justify-center gap-3 w-full py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold rounded-2xl transition-all backdrop-blur-sm text-base">
                <Icon name="key" className="w-5 h-5 text-white/70" />
                Already Registered? Login
              </a>
            </div>

            <p className="text-white/40 text-xs text-center mt-6">
              Secured by Privy · No crypto knowledge required
            </p>
          </div>
        </div>

      </div>

      <HomeFooter />
    </div>
  );
}