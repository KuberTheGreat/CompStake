'use client'

import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { getPublicClient } from '@wagmi/core';
import { sepolia } from 'viem/chains';
import { parseEther } from 'viem';
import { config } from '@/utils/wagmiConfig';
import { TOKEN_ADDRESS, TOKEN_ABI, TASK_ADDRESS } from '@/utils/exports';

const GetTokensButton = () => {
  const { isConnected } = useAccount();

  // State for the token faucet transaction
  const [isGettingTokens, setIsGettingTokens] = useState(false);
  const [isGetTokensSuccess, setIsGetTokensSuccess] = useState(false);
  const [getTokensHash, setGetTokensHash] = useState<`0x${string}` | undefined>(undefined);
  
  // State for the approval transaction
  const [isApproving, setIsApproving] = useState(false);
  const [isApproveSuccess, setIsApproveSuccess] = useState(false);
  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>(undefined);
  
  const { writeContractAsync } = useWriteContract();

  const handleGetTokensAndApprove = async () => {
    try {
      // Step 1: Call the faucet function to get tokens
      setIsGettingTokens(true);
      setIsGetTokensSuccess(false);
      setIsApproveSuccess(false);
      
      const faucetTxHash = await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'faucet',
        args: [],
        chainId: sepolia.id,
      });

      const publicClient = getPublicClient(config);
      const { status: faucetStatus } = await publicClient.waitForTransactionReceipt({ hash: faucetTxHash });
      
      if (faucetStatus === 'success') {
        setGetTokensHash(faucetTxHash);
        setIsGettingTokens(false);
        setIsGetTokensSuccess(true);
        
        // Step 2: Approve the escrow contract to spend a large amount of tokens
        setIsApproving(true);
        const approveTxHash = await writeContractAsync({
          address: TOKEN_ADDRESS,
          abi: TOKEN_ABI,
          functionName: 'approve',
          args: [TASK_ADDRESS, parseEther('1000000')], // Approve a large amount
          chainId: sepolia.id,
        });
        
        const { status: approveStatus } = await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
        if (approveStatus === 'success') {
          setApproveHash(approveTxHash);
          setIsApproving(false);
          setIsApproveSuccess(true);
        } else {
          setIsApproving(false);
          // Handle approve failure
        }
      } else {
        setIsGettingTokens(false);
        // Handle faucet failure
      }
      
    } catch (error) {
      console.error("Failed to get tokens or approve:", error);
      setIsGettingTokens(false);
      setIsApproving(false);
      // Handle general error
    }
  };
  
  // Use useWaitForTransactionReceipt to track the status of the transactions
  useWaitForTransactionReceipt({
    hash: getTokensHash,
    query: {
        enabled: !!getTokensHash
    },
  });
  
  useWaitForTransactionReceipt({
    hash: approveHash,
    query: {
        enabled: !!approveHash
    },
  });

  const buttonText = isGettingTokens ? 'Getting Tokens...' : isApproving ? 'Approving...' : 'Get Tokens & Approve';
  const isPending = isGettingTokens || isApproving;

  if (!isConnected) return null;

  return (
    <div className="flex items-center space-x-2">
      <button 
        onClick={handleGetTokensAndApprove}
        disabled={isPending}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150
            ${isPending ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`
        }
      >
        {buttonText}
      </button>
      {isApproveSuccess && (
        <span className="text-green-500 text-sm">✓ Done</span>
      )}
    </div>
  );
};

export default GetTokensButton;
