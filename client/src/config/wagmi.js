import { http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { createConfig } from '@privy-io/wagmi';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
    injected({ target: 'trust' }),
    walletConnect({
      projectId: 'f237d6844bb6d2ecaca35d2c059f5757',
      showQrModal: true,
    }),
    coinbaseWallet({ appName: 'Healthcare DApp' }),
  ],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/7tczAF6mUVJMku6r-NMaf'),
  },
});