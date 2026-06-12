import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// ── usePatientAuth ─────────────────────────────────────────────────────────────
// Use this hook in ALL patient pages instead of useAccount()
// Returns the patient's embedded wallet address from Privy
// Redirects to /patient/login if not authenticated

export function usePatientAuth() {
  const { ready, authenticated, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      navigate('/patient/login');
    }
  }, [ready, authenticated, navigate]);

  // Get the embedded wallet (first wallet Privy creates)
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address || null;

  // Patient display info from Privy
  const email = user?.email?.address || null;

 // in usePatientAuth.js, change return to:
return { address, email, authenticated, ready, logout, user, wallets };
}