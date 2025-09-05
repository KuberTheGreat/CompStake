// 'use client'

// import { usePrivy } from '@privy-io/react-auth';
// import React from 'react';
// import { useConnectWallet } from "@privy-io/react-auth";
// import { useAccount } from 'wagmi';

// const WalletConnect = () => {
//     // Get the Privy ready state to show a loading message
//     const { ready } = usePrivy();
//     // Get the Privy connect function
//     const { connectWallet } = useConnectWallet();
//     // Get the wallet address from wagmi
//     const { address } = useAccount();

//     // Show a loading state if Privy is not yet ready
//     if (!ready) {
//         return (
//             <div className="flex items-center justify-center p-4 bg-gray-100 rounded-xl shadow-md">
//                 <p className="text-gray-600 animate-pulse">Initializing...</p>
//             </div>
//         );
//     }

//     // Render the UI based on the connection status
//     return (
//         <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 text-center transition-all duration-300">
//             {address ? (
//                 // Connected State: Show a success message and the wallet address
//                 <div className="flex flex-col items-center">
//                     <div className="p-2 bg-green-100 rounded-full mb-4">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                         </svg>
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-800 mb-2">Wallet Connected</h2>
//                     <p className="text-sm text-gray-600 font-mono break-words">{address}</p>
//                 </div>
//             ) : (
//                 // Disconnected State: Show a prompt and the connect button
//                 <div className="space-y-4">
//                     <h2 className="text-xl font-bold text-gray-800">Connect Your Wallet</h2>
//                     <p className="text-gray-500 text-sm">
//                         Connect to interact with the Task Escrow smart contract.
//                     </p>
//                     <button
//                         onClick={connectWallet}
//                         className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
//                     >
//                         Connect
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default WalletConnect;



'use client'

import React from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useConnectWallet } from "@privy-io/react-auth";
import { useAccount } from 'wagmi';

// A UI component to display the wallet connection button.
const WalletConnect = () => {
    const { ready } = usePrivy();
    const { connectWallet } = useConnectWallet();
    const { address } = useAccount();

    if (!ready) {
        return (
            <div className="flex items-center justify-center">
                <p className="text-gray-600 animate-pulse text-sm">Initializing...</p>
            </div>
        );
    }

    return (
        <div>
            {address ? (
                // Connected State: Show a success message and the wallet address
                <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                    <div className="p-1 bg-green-200 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-sm font-mono break-words text-gray-700">{address.slice(0, 6)}...{address.slice(-4)}</p>
                </div>
            ) : (
                // Disconnected State: Show a prompt and the connect button
                <button
                    onClick={connectWallet}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-sm"
                >
                    Connect Wallet
                </button>
            )}
        </div>
    );
};

// The main Navbar component.
const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand Name */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-gray-800 tracking-wide">
                           TaskEscrow
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors">
                                Home
                            </Link>
                            <Link href="/explore" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors">
                                Explore
                            </Link>
                            <Link href="/create" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors">
                                Create Task
                            </Link>
                            <Link href="/my-tasks" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors">
                                My Tasks
                            </Link>
                        </div>
                    </div>

                    {/* Wallet Connect */}
                    <div className="flex items-center">
                        <WalletConnect />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
