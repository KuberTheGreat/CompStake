'use client'

import "./globals.css";
import {PrivyProvider} from '@privy-io/react-auth';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {WagmiProvider} from '@privy-io/wagmi';
import { config } from "@/utils/wagmiConfig";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PrivyProvider 
    appId="cmf3v4wj6014ol50bxysc7nk3"
    config={{
        // 2p6yjMuZSMutJUKGnk8n7cbDw3mAPJTpxk4JgunPzoyHwzAnrW5j3qgxyAvKj34mZPJwzo5qLHppLuPJqrQteogP
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}>
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={config}>
                    {children}
                </WagmiProvider>
            </QueryClientProvider>
    </PrivyProvider>
  );
}
