'use client'

import React, { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { readContract, getPublicClient } from '@wagmi/core';
import { TASK_ABI, TASK_ADDRESS, TOKEN_ABI, TOKEN_ADDRESS } from '@/utils/exports';
import { config } from '@/utils/wagmiConfig';
import { formatEther, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import axios from 'axios';

// Define the structure of a Task for better type safety
interface Task {
    taskId: number;
    creator: `0x${string}`;
    worker: `0x${string}`;
    title: string;
    description: string;
    reward: bigint;
    stake: bigint;
    inputCid: string;
    outputCid: string;
    state: number;
}

const TaskStateText = (state: number) => {
    switch (state) {
        case 0: return 'Open';
        case 1: return 'Claimed';
        case 2: return 'Completed';
        case 3: return 'Verified';
        case 4: return 'Rejected';
        default: return 'Unknown';
    }
};

interface TransactionStatusProps {
    isPending: boolean;
    isSuccess: boolean;
    isError: boolean;
    hash: `0x${string}` | undefined;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ isPending, isSuccess, isError, hash }) => {
    if (!isPending && !isSuccess && !isError) return null;

    if (isPending) {
        return (
            <div className="p-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Transaction Pending...</span>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="p-2 bg-green-100 text-green-800 rounded-lg text-sm flex items-center space-x-2">
                <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.81a.75.75 0 10-1.22-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span>Transaction successful!</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-2 bg-red-100 text-red-800 rounded-lg text-sm flex items-center space-x-2">
                <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.875 1.627a.75.75 0 01-.645 1.034l-.45.083c-.927.172-1.78.69-2.454 1.458a.75.75 0 01-1.06-1.06 9.006 9.006 0 013.292-2.766c.203-.09.43-.031.597.159.167.19.214.453.125.666zM7.5 15.75a.75.75 0 01-.75-.75.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                </svg>
                <span>Transaction failed.</span>
            </div>
        );
    }
    return null;
};

const uploadToPinata = async (file: File): Promise<string> => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    const formData = new FormData();
    formData.append("file", file);
    console.log(process.env.PINATA_API_KEY)

    const res = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: "75ca51bf7ba492e1eb3b",
        pinata_secret_api_key: "0fe7a1db216fe45dff08797f3451cb35dc09b3fa92b4de808299e8037e006a18",
      },
    });
    console.log(process.env.PINATA_API_KEY)

    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  };

const TaskCard: React.FC<{ task: Task, walletAddress: string | undefined, stakePercentage: bigint | undefined }> = ({ task, walletAddress, stakePercentage }) => {
    const isVerified = task.state === 3;
    const isRejected = task.state === 4;
    const isOwner = walletAddress && walletAddress.toLowerCase() === task.creator.toLowerCase();
    const isWorker = walletAddress && walletAddress.toLowerCase() === task.worker.toLowerCase();

    // State for the claim transaction
    const [isApproving, setIsApproving] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isClaimError, setIsClaimError] = useState(false);
    const [claimHash, setClaimHash] = useState<`0x${string}` | undefined>(undefined);

    // State for the complete transaction
    const [outputFile, setOutputFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isCompleteError, setIsCompleteError] = useState(false);
    const [completeHash, setCompleteHash] = useState<`0x${string}` | undefined>(undefined);
    
    // State for the verify transaction
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerifyError, setIsVerifyError] = useState(false);
    const [verifyHash, setVerifyHash] = useState<`0x${string}` | undefined>(undefined);


    // Wagmi hooks for the claim transaction
    const { writeContractAsync: writeClaim } = useWriteContract();
    const { writeContractAsync: writeApprove } = useWriteContract();

    // Wagmi hooks for the complete transaction
    const { writeContractAsync: writeComplete } = useWriteContract();
    const { isLoading: isCompleteTxLoading, isSuccess: isCompleteTxSuccess, isError: isCompleteTxError } = useWaitForTransactionReceipt({
        hash: completeHash,
    });
    
    // Wagmi hooks for the verify transaction
    const { writeContractAsync: writeVerify } = useWriteContract();
    const { isLoading: isVerifyTxLoading, isSuccess: isVerifyTxSuccess, isError: isVerifyTxError } = useWaitForTransactionReceipt({
        hash: verifyHash,
    });


    // Get the transaction receipt and check for success
    const { isLoading: isClaimTxLoading, isSuccess: isClaimTxSuccess, isError: isClaimTxError } = useWaitForTransactionReceipt({
        hash: claimHash,
    });

    useEffect(() => {
        if (isClaimTxLoading) {
            setIsClaiming(true);
        } else {
            setIsClaiming(false);
        }
        if (isClaimTxError) {
            setIsClaimError(true);
        } else {
            setIsClaimError(false);
        }
    }, [isClaimTxLoading, isClaimTxError]);
    
    useEffect(() => {
        if (isCompleteTxLoading) {
            setIsCompleting(true);
        } else {
            setIsCompleting(false);
        }
        if (isCompleteTxError) {
            setIsCompleteError(true);
        } else {
            setIsCompleteError(false);
        }
    }, [isCompleteTxLoading, isCompleteTxError]);
    
    useEffect(() => {
        if (isVerifyTxLoading) {
            setIsVerifying(true);
        } else {
            setIsVerifying(false);
        }
        if (isVerifyTxError) {
            setIsVerifyError(true);
        } else {
            setIsVerifyError(false);
        }
    }, [isVerifyTxLoading, isVerifyTxError]);

    const handleClaimTask = async () => {
        if (!walletAddress || !stakePercentage) return;
        
        try {
            // Calculate the required stake
            const requiredStake = (task.reward * stakePercentage) / BigInt(10000);
            
            // Step 1: Approve the escrow contract to spend the stake
            setIsApproving(true);
            const approveTxHash = await writeApprove({
                address: TOKEN_ADDRESS,
                abi: TOKEN_ABI,
                functionName: 'approve',
                args: [TASK_ADDRESS, requiredStake],
                chainId: sepolia.id,
            });

            // Wait for the approval transaction to be confirmed
            const publicClient = getPublicClient(config);
            const { status: approveStatus } = await publicClient.waitForTransactionReceipt({ hash: approveTxHash });

            if (approveStatus === 'success') {
                setIsApproving(false);
                setIsClaiming(true);
                // Step 2: Call the claimTask function
                const claimTxHash = await writeClaim({
                    address: TASK_ADDRESS,
                    abi: TASK_ABI,
                    functionName: 'claimTask',
                    args: [BigInt(task.taskId)],
                    chainId: sepolia.id,
                });
                setClaimHash(claimTxHash);
            } else {
                setIsApproving(false);
                setIsClaimError(true);
            }
        } catch (error) {
            console.error("Failed to claim task:", error);
            setIsApproving(false);
            setIsClaiming(false);
            setIsClaimError(true);
        }
    };
    
    const handleCompleteTask = async () => {
        if (!outputFile) {
            alert("Please select a file to complete the task.");
            return;
        }

        try {
            setIsUploading(true);
            const outputCid = await uploadToPinata(outputFile);
            setIsUploading(false);

            setIsCompleting(true);
            const completeTxHash = await writeComplete({
                address: TASK_ADDRESS,
                abi: TASK_ABI,
                functionName: 'completeTask',
                args: [BigInt(task.taskId), outputCid],
                chainId: sepolia.id,
            });
            setCompleteHash(completeTxHash);
        } catch (error) {
            console.error("Failed to complete task:", error);
            setIsUploading(false);
            setIsCompleting(false);
            setIsCompleteError(true);
        }
    };
    
    const handleVerifyTask = async () => {
        try {
            setIsVerifying(true);
            const verifyTxHash = await writeVerify({
                address: TASK_ADDRESS,
                abi: TASK_ABI,
                functionName: 'verifyTask',
                args: [BigInt(task.taskId)],
                chainId: sepolia.id,
            });
            setVerifyHash(verifyTxHash);
        } catch (error) {
            console.error("Failed to verify task:", error);
            setIsVerifying(false);
            setIsVerifyError(true);
        }
    };

    const isClaimPending = isApproving || isClaiming;
    const isCompletePending = isUploading || isCompleting || isCompleteTxLoading;
    const isCompleteSuccess = isCompleteTxSuccess;
    const isCompleteErrorState = isCompleteError || isCompleteTxError;
    const completeButtonText = isUploading ? 'Uploading...' : isCompleting ? 'Completing...' : 'Complete Task';
    
    const isVerifyPending = isVerifying || isVerifyTxLoading;
    const isVerifySuccess = isVerifyTxSuccess;
    const isVerifyErrorState = isVerifyError || isVerifyTxError;

    return (
        <div className={`
            bg-white p-6 rounded-xl shadow-lg border-2
            ${isVerified ? 'border-green-400' : isRejected ? 'border-red-400' : 'border-transparent'}
            transition-transform duration-200 ease-in-out hover:scale-[1.01]
        `}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                <span className={`
                    px-3 py-1 text-sm font-semibold rounded-full
                    ${task.state === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                `}>
                    {TaskStateText(task.state)}
                </span>
            </div>
            <p className="text-gray-600 mb-4">{task.description}</p>
            <div className="text-sm font-medium text-gray-700 space-y-2">
                <div className="flex items-center">
                    <span className="w-24 text-gray-500">Reward:</span>
                    <span className="text-indigo-600 font-semibold">{formatEther(task.reward)}</span>
                </div>
                {task.state === 1 ? (
                    <div className="flex items-center">
                        <span className="w-24 text-gray-500">Input CID:</span>
                        <a
                            href={`${task.inputCid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate w-64"
                        >
                            {task.inputCid}
                        </a>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <span className="w-24 text-gray-500">Input CID:</span>
                        <span className="italic text-gray-400">Claim to view</span>
                    </div>
                )}
                {task.state === 2 || task.state === 3 || task.state === 4 ? (
                    <div className="flex items-center">
                        <span className="w-24 text-gray-500">Output CID:</span>
                        <a
                            href={`https://gateway.pinata.cloud/ipfs/${task.outputCid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate w-64"
                        >
                            {task.outputCid}
                        </a>
                    </div>
                ) : null}
                <div className="flex items-center">
                    <span className="w-24 text-gray-500">Creator:</span>
                    <span className="truncate w-64">{task.creator}</span>
                </div>
                {task.worker !== '0x0000000000000000000000000000000000000000' && (
                    <div className="flex items-center">
                        <span className="w-24 text-gray-500">Worker:</span>
                        <span className="truncate w-64">{task.worker}</span>
                    </div>
                )}
            </div>
            
            {/* Conditional rendering for claiming a task */}
            {task.state === 0 && !isOwner && walletAddress && (
                <div className="mt-4">
                    <button
                        onClick={handleClaimTask}
                        disabled={isClaimPending}
                        className={`w-full py-3 px-6 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150
                            ${isClaimPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                    >
                        {isApproving ? 'Approving...' : isClaiming ? 'Claiming...' : 'Claim Task'}
                    </button>
                    <div className="mt-2">
                        <TransactionStatus isPending={isClaimPending} isSuccess={isClaimTxSuccess} isError={isClaimTxError} hash={claimHash} />
                    </div>
                </div>
            )}
            
            {/* Conditional rendering for completing a task */}
            {task.state === 1 && isWorker && (
                <div className="mt-4">
                    <div className="space-y-4">
                        <label htmlFor="outputFile" className="block text-gray-700 font-medium">Upload Completed Work</label>
                        <input
                            id="outputFile"
                            type="file"
                            onChange={(e) => setOutputFile(e.target.files ? e.target.files[0] : null)}
                            className="block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-150"
                        />
                        <button
                            onClick={handleCompleteTask}
                            disabled={!outputFile || isCompletePending}
                            className={`w-full py-3 px-6 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150
                                ${isCompletePending || !outputFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                        >
                            {completeButtonText}
                        </button>
                    </div>
                    <div className="mt-2">
                        <TransactionStatus isPending={isCompletePending} isSuccess={isCompleteSuccess} isError={isCompleteErrorState} hash={completeHash} />
                    </div>
                </div>
            )}
            
            {/* Conditional rendering for verifying a task */}
            {task.state === 2 && isOwner && (
                <div className="mt-4">
                    <p className="text-gray-500 text-sm mb-2">Worker has submitted their work. Please review and verify to pay them.</p>
                    <button
                        onClick={handleVerifyTask}
                        disabled={isVerifyPending}
                        className={`w-full py-3 px-6 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150
                            ${isVerifyPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify Task'}
                    </button>
                    <div className="mt-2">
                        <TransactionStatus isPending={isVerifyPending} isSuccess={isVerifySuccess} isError={isVerifyErrorState} hash={verifyHash} />
                    </div>
                </div>
            )}
            
            {(!walletAddress || isOwner) && task.state === 0 && (
                <div className="mt-4 p-4 text-center text-sm font-medium rounded-lg bg-gray-50 text-gray-500">
                    { !walletAddress && 'Connect your wallet to claim this task.' }
                    { isOwner && 'You created this task.' }
                </div>
            )}
            
            {(isVerified || isRejected) && (
                <div className="mt-4 p-4 text-center text-sm font-medium rounded-lg bg-gray-50">
                    <p className="text-gray-500">This task has been {TaskStateText(task.state).toLowerCase()}.</p>
                </div>
            )}
        </div>
    );
};

const ExplorePage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { address } = useAccount();

    // Fetch the total number of tasks and the stake percentage from the contract
    const { data: nextTaskIdData, isLoading: isLoadingNextTaskId, isError: isErrorNextTaskId } = useReadContract({
        address: TASK_ADDRESS,
        abi: TASK_ABI,
        functionName: 'nextTaskId',
        chainId: sepolia.id,
    });
    
    const { data: stakePercentage } = useReadContract({
        address: TASK_ADDRESS,
        abi: TASK_ABI,
        functionName: 'stakePercentage',
        chainId: sepolia.id,
    });

    useEffect(() => {
        const fetchAllTasks = async () => {
            if (nextTaskIdData === undefined || nextTaskIdData === null) return;

            setIsLoadingTasks(true);
            setError(null);
            
            const totalTasks = Number(nextTaskIdData) - 1;
            const fetchedTasks: Task[] = [];

            // Fetch each task individually from the contract
            for (let i = 1; i <= totalTasks; i++) {
                try {
                    const task: any = await readContract(config, {
                        address: TASK_ADDRESS,
                        abi: TASK_ABI,
                        functionName: 'tasks',
                        args: [BigInt(i)],
                        chainId: sepolia.id,
                    });
                    
                    fetchedTasks.push({
                        taskId: i,
                        creator: task[0],
                        worker: task[1],
                        title: task[2],
                        description: task[3],
                        reward: task[4],
                        stake: task[5],
                        inputCid: task[6],
                        outputCid: task[7],
                        state: task[8],
                    });
                } catch (err) {
                    console.error(`Failed to fetch task with ID ${i}:`, err);
                    setError('Failed to fetch task data. Please try again.');
                    setIsLoadingTasks(false);
                    return;
                }
            }
            setTasks(fetchedTasks);
            setIsLoadingTasks(false);
        };

        if (nextTaskIdData !== undefined && nextTaskIdData !== null) {
            fetchAllTasks();
        }
    }, [nextTaskIdData]);

    if (isLoadingNextTaskId || isLoadingTasks) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl font-medium text-gray-500 animate-pulse">Loading tasks...</p>
            </div>
        );
    }

    if (isErrorNextTaskId || error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl font-medium text-red-500">
                    Error loading tasks. Please check your connection and try again.
                </p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8">
            <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10 tracking-tight">
                Explore All Tasks
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskCard key={task.taskId} task={task} walletAddress={address} stakePercentage={BigInt(1000)} />
                    ))
                ) : (
                    <div className="col-span-full text-center p-10 bg-white rounded-xl shadow-md">
                        <p className="text-gray-500 text-xl font-medium">No tasks found. Be the first to create one!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;
