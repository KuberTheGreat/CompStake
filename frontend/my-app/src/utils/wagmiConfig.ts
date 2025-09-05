import {createConfig} from '@privy-io/wagmi';
import {mainnet, sepolia} from 'viem/chains';
import {http} from 'wagmi';
import { injected } from '@wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()], 
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});