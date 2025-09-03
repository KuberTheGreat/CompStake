'use client'

import { usePrivy } from '@privy-io/react-auth';
import React, { useEffect, useState } from 'react'
import {useConnectWallet} from "@privy-io/react-auth";
import {useAccount} from 'wagmi';

const WalletConnect = () => {
  const {ready} = usePrivy();
  const [isConnected, setIsConnected] = useState(false);
  const {connectWallet} = useConnectWallet();
  const {address} = useAccount();

  if (!ready) {
    return <div>Loading...</div>;
  }

    return (
        <div>
            <button onClick={connectWallet}>Connect</button>
            <p>{isConnected == false ? address : "Not connected"}</p>
        </div>
    );
}

export default WalletConnect
