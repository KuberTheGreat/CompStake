// "use client";

// import { useState, useEffect } from 'react';
// import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
// import {
//   useCreateTask,
//   useTokenApprove
// } from '../utils/functions';
// import { parseEther } from 'viem';
// import { TASK_ABI, TASK_ADDRESS } from '@/utils/exports';
// import { sepolia } from 'viem/chains';
// import { writeContract } from '@wagmi/core';
// import { config } from '@/utils/wagmiConfig';


// interface TransactionStatusProps {
//   isPending: boolean;
//   isSuccess: boolean;
//   isError: boolean;
//   hash: `0x${string}` | undefined;
// }

// // A simple UI component to display a transaction status message.
// const TransactionStatus: React.FC<TransactionStatusProps> = ({ isPending, isSuccess, hash }) => {
//   if (isPending) {
//     return (
//       <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
//         Transaction Pending... Please wait for a few moments.
//       </div>
//     );
//   }

//   if (isSuccess) {
//     return (
//       <div className="p-4 bg-green-100 text-green-800 rounded-lg">
//         Transaction successful!
//         <p className="break-all mt-2">
//           Tx Hash: <a href={`https://etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600">{hash}</a>
//         </p>
//       </div>
//     );
//   }

// //   if (isError) {
// //     return (
// //       <div className="p-4 bg-red-100 text-red-800 rounded-lg">
// //         Something went wrong with the transaction. Please try again.
// //       </div>
// //     );
// //   }

//   return null;
// };


// // The main component for creating a new task.
// const CreateTaskPage = () => {
//   const [reward, setReward] = useState<string>('');
//   const [title, setTitle] = useState<string>('');
//   const [description, setDescription] = useState<string>('');
//   const [inputCid, setInputCid] = useState<string>('');
//   const { isConnected } = useAccount();

//   // --- WAGMI HOOKS FOR CONTRACT INTERACTIONS ---
//   // Approve Token Transfer
//   const { data: approveConfig, isError: isApproveConfigError, isPending: isApproveConfigPending } = useTokenApprove(reward);
//   const { writeContract: writeApprove, data: approveHash, isPending: isApproveWritePending } = useWriteContract();
//   const { isSuccess: isApproveSuccess, isError: isApproveTxError, isPending: isApproveTxPending } = useWaitForTransactionReceipt({
//     hash: approveHash,
//     query:{
//         enabled: !!approveHash
//     }
//   });

//   // Create Task
// //   const { data: createConfig, isError: isCreateConfigError, isPending: isCreateConfigPending } = useCreateTask(reward, inputCid, title, description);
//   const { writeContract: writeCreate, data: createHash, isPending: isCreateWritePending } = useWriteContract();
//   const { isSuccess: isCreateSuccess, isError: isCreateTxError, isPending: isCreateTxPending } = useWaitForTransactionReceipt({
//     hash: createHash,
//     query:{
//         enabled: !!createHash
//     }
//   });

//   const {create, hash, error, isPending ,receipt} = useCreateTask();
// //   const {writeContract} = useWriteContract();
  
//   const handleCreateTask = async (e: React.FormEvent) => {
    
//     e.preventDefault();

//     try{
//         // create(reward, inputCid, title, description); 
//         const parsedReward = reward ? parseEther(reward) : 0;
//         // writeContract({
//         //     address: TASK_ADDRESS,
//         //     abi: TASK_ABI,
//         //     functionName: 'createTask',
//         //     args: [parsedReward, inputCid, title, description],
//         //     chainId: sepolia.id,
//         // })
//         console.log("Function called!")
//     }
//     catch(err){
//         console.log(err);
//     }
//   };

//   // Listen for the approval transaction to be confirmed before sending the create task transaction
// //   useEffect(() => {
// //     if (isApproveSuccess && createConfig && createConfig.request) {
// //       writeCreate(createConfig.request);
// //     }
// //   }, [isApproveSuccess, createConfig, writeCreate]);

//   // Handle all loading and error states for a single message
//   const isTransactionPending = isApproveWritePending || isCreateWritePending || isApproveTxPending || isCreateTxPending || isApproveConfigPending;
//   const isTransactionSuccess = isCreateSuccess;
// //   const isTransactionError = isApproveTxError || isCreateTxError || isApproveConfigError || isCreateConfigError;
//   const transactionHash = isCreateTxPending ? createHash : approveHash;

//   return (
//     <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-start">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
//         <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Create a New Task</h1>
        
//         {!isConnected ? (
//           <div className="p-6 bg-blue-100 text-blue-800 rounded-lg text-center">
//             <p className="text-lg">Please connect your wallet to create a task.</p>
//           </div>
//         ) : (
//           <form onSubmit={handleCreateTask} className="space-y-6">
//             <div>
//               <label htmlFor="reward" className="block text-gray-700 font-medium">Reward (in Tokens)</label>
//               <input
//                 id="reward"
//                 type="number"
//                 value={reward}
//                 onChange={(e) => setReward(e.target.value)}
//                 placeholder="e.g., 100"
//                 className="mt-1 block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="title" className="block text-gray-700 font-medium">Task Title</label>
//               <input
//                 id="title"
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="e.g., Design a Website Mockup"
//                 className="mt-1 block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="description" className="block text-gray-700 font-medium">Description</label>
//               <textarea
//                 id="description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 placeholder="Provide a detailed description of the task."
//                 rows={4}
//                 className="mt-1 block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="inputCid" className="block text-gray-700 font-medium">Input CID (IPFS Hash)</label>
//               <input
//                 id="inputCid"
//                 type="text"
//                 value={inputCid}
//                 onChange={(e) => setInputCid(e.target.value)}
//                 placeholder="e.g., Qm... (link to files)"
//                 className="mt-1 block w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
//                 required
//               />
//             </div>
            
//             <button
//               type="submit"
//               onClick={async () => {
//                 const parsedReward = reward ? parseEther(reward) : 0;
//                 await writeContract(config, {
//                     address: TASK_ADDRESS,
//                     abi: TASK_ABI,
//                     functionName: 'createTask',
//                     args: [parsedReward, inputCid, title, description],
//                     chainId: sepolia.id,
//                 })
//               }}
//               className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 disabled:bg-gray-400"
//             >
//               {'Create Task'}
//             </button>
//           </form>
//         )}
        
//         <div className="mt-6">
//           {/* <TransactionStatus
//             isPending={isTransactionPending}
//             isSuccess={isTransactionSuccess}
//             // isError={isTransactionError}
//             hash={transactionHash}
//           /> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateTaskPage;




'use client'

import { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { writeContract } from '@wagmi/core';
import { parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { TASK_ABI, TASK_ADDRESS } from '@/utils/exports';
import { config } from '@/utils/wagmiConfig';
import axios from "axios";


interface TransactionStatusProps {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  hash: `0x${string}` | undefined;
}

// A simple UI component to display a transaction status message.
const TransactionStatus: React.FC<TransactionStatusProps> = ({ isPending, isSuccess, isError, hash }) => {
  if (isPending) {
    return (
      <div className="flex items-center p-4 bg-yellow-100 text-yellow-800 rounded-xl shadow-md space-x-3">
        <svg className="w-6 h-6 animate-spin text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="font-medium">Transaction Pending... Awaiting confirmation.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center p-4 bg-green-100 text-green-800 rounded-xl shadow-md space-x-3">
        <svg className="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.815a.75.75 0 01.933 1.054l-5.638 6.474a.75.75 0 01-1.072.052l-2.73-2.613a.75.75 0 111.042-1.09l2.254 2.158 5.114-5.874z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="font-medium">Task created successfully!</p>
          <p className="break-all mt-1 text-sm text-gray-600">
            Tx Hash: <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-600 font-mono transition-colors">{hash}</a>
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg shadow-md space-x-3">
        <p className="font-medium">An error occurred during the transaction. Please try again.</p>
      </div>
    );
  }

  return null;
};

// The main component for creating a new task.
const CreateTaskPage = () => {
  const [reward, setReward] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { isConnected } = useAccount();

  const { isLoading: isPending, isSuccess: isSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  });

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setTxHash(undefined);

    try {
      const cid = await uploadToPinata(file);
      setIsUploading(false);

      const parsedReward = reward ? parseEther(reward) : 0;
      const hash = await writeContract(config, {
        address: TASK_ADDRESS,
        abi: TASK_ABI,
        functionName: 'createTask',
        args: [parsedReward, cid, title, description],
        chainId: sepolia.id,
      });
      setTxHash(hash);
    } catch (err) {
      console.error("Error creating task:", err);
      setIsUploading(false);
      setUploadError("File upload or transaction failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8 flex justify-center items-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-2xl transition-all duration-300 transform hover:scale-[1.005]">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center tracking-tight">Create a New Task</h1>
        
        {!isConnected ? (
          <div className="p-8 bg-blue-50 text-blue-800 rounded-xl text-center border-2 border-blue-200 shadow-inner">
            <p className="text-xl font-semibold">Please connect your wallet to create a task.</p>
            <p className="text-sm mt-2 text-blue-600">The task creation form will appear once you are connected.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateTask} className="space-y-6">
            <div>
              <label htmlFor="reward" className="block text-gray-700 font-semibold mb-1">Reward (in Tokens)</label>
              <input
                id="reward"
                type="number"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="e.g., 100"
                className="mt-1 block w-full px-5 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-gray-700 font-semibold mb-1">Task Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Design a Website Mockup"
                className="mt-1 block w-full px-5 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-gray-700 font-semibold mb-1">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the task requirements, deliverables, and any other important information."
                rows={4}
                className="mt-1 block w-full px-5 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="inputCid" className="block text-gray-700 font-semibold mb-1">
                Input File (for IPFS Upload)
              </label>
              <input
                id="inputCid"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  } else {
                    setFile(null);
                  }
                }}
                className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="w-full py-4 px-6 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.01]"
            >
              {isUploading ? 'Uploading to IPFS...' : isPending ? 'Processing...' : 'Create Task'}
            </button>
          </form>
        )}
        
        <div className="mt-8">
          <TransactionStatus
            isPending={isPending || isUploading}
            isSuccess={isSuccess}
            isError={isTxError || !!uploadError}
            hash={txHash}
          />
        </div>
        {uploadError && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg shadow-md space-x-3">
            <p className="font-medium">Error: {uploadError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTaskPage;
