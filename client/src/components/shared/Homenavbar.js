import { useState, useEffect } from "react";

export default function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Home",          href: "/#home"     },
    { label: "About",         href: "/#about"    },
    { label: "Smart Contract",href: "/#contract" },
    { label: "AI Features",   href: "/#ai"       },
    { label: "Privacy",       href: "/#privacy"  },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100" : "bg-white/80 backdrop-blur-md"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-black text-lg leading-none tracking-tight">MediChain</p>

          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <a key={l.label} href={l.href}
              className="text-gray-600 hover:text-indigo-600 text-sm font-semibold transition-colors duration-200">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/login"
            className="px-4 py-2 text-indigo-600 border border-indigo-200 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all">
            Login
          </a>
          <a href="/patient/register"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105">
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
          <div className={`w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <div className={`w-6 h-0.5 bg-gray-700 my-1.5 transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <div className={`w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 space-y-4 shadow-xl">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              className="block text-gray-700 hover:text-indigo-600 font-semibold text-lg">{l.label}</a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
            <a href="/login"            className="text-center py-3 border border-indigo-200 text-indigo-600 rounded-xl font-bold">Login</a>
            <a href="/patient/register" className="text-center py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold">Register as Patient</a>
            <a href="/doctor/register"  className="text-center py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold">Register as Doctor</a>
          </div>
        </div>
      )}
    </nav>
  );
}