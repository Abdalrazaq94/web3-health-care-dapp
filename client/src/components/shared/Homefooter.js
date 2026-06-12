export default function HomeFooter() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">MediChain</p>
              
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-5">
              A Web3 blockchain healthcare DApp, BSc (Hons) Software Development dissertation project, Glasgow Caledonian University. Supervised by Mr Ross Crawford.
            </p>
            <div className="flex flex-wrap gap-2">
              {["⛓️ Ethereum Sepolia","🌐 IPFS / Pinata","🔐 Privy Auth","📜 Solidity 0.8.20","🤖 On-Premise AI"].map(t => (
                <span key={t} className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-xs font-semibold">{t}</span>
              ))}
            </div>
          </div>
                
          <div>
            <p className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Navigate</p>
            <div className="space-y-3">
              {[["Home","/#home"],["About","/#about"],["Smart Contract","/#contract"],["AI Features","/#ai"],["Privacy","/#privacy"]].map(([l,h]) => (
                <a key={l} href={h} className="block text-gray-500 hover:text-indigo-400 text-sm transition-colors">{l}</a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Get Started</p>
            <div className="space-y-3">
              {[["Register as Patient","/patient/register"],["Register as Doctor","/doctor/register"],["Login","/login"]].map(([l,h]) => (
                <a key={l} href={h} className="block text-gray-500 hover:text-indigo-400 text-sm transition-colors">{l}</a>
              ))}
            </div>
            <div className="mt-6 p-3 bg-gray-800 rounded-xl">
              <p className="text-gray-500 text-xs font-semibold mb-1">Contract Address</p>
              <p className="text-gray-400 text-xs font-mono break-all">0x18B5630b...672560</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2025 MediChain · Abedulalrazaq Altaih · s2428152 · Glasgow Caledonian University</p>
          <p className="text-gray-700 text-xs">Deployed on Ethereum Sepolia Testnet</p>
        </div>
      </div>
    </footer>
  );
}