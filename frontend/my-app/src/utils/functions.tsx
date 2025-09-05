import { TOKEN_ADDRESS, TASK_ABI, TASK_ADDRESS, TOKEN_ABI } from "./exports";
import { useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { taskContractConfig } from "./exports";
import { parseEther, type Address } from 'viem';
import { sepolia } from "viem/chains";

// ABI for the TaskEscrow contract

export const useCreateTask = () => {
    const {writeContract, data: hash, error, isPending} = useWriteContract();
    function create(reward: string, inputCid: string, title: string, description: string){
        const parsedReward = reward ? parseEther(reward) : 0;
        return writeContract({
            address: TASK_ADDRESS,
            abi: TASK_ABI,
            functionName: 'createTask',
            args: [parsedReward, inputCid, title, description],
            chainId: sepolia.id,
        })
    }
    
    const receipt = useWaitForTransactionReceipt({hash});
    return {create, hash, error, isPending, receipt};
};

export const useClaimTask = (taskId: number) => {
  return useSimulateContract({
    address: TASK_ADDRESS,
    abi: TASK_ABI,
    functionName: 'claimTask',
    args: [BigInt(taskId)],
  });
};

export const useCompleteTask = (taskId: number, outputCid: string) => {
  return useSimulateContract({
    address: TASK_ADDRESS,
    abi: TASK_ABI,
    functionName: 'completeTask',
    args: [BigInt(taskId), outputCid],
  });
};

export const useVerifyTask = (taskId: number) => {
  return useSimulateContract({
    address: TASK_ADDRESS,
    abi: TASK_ABI,
    functionName: 'verifyTask',
    args: [BigInt(taskId)],
  });
};

export const useRejectTask = (taskId: number) => {
  return useSimulateContract({
    address: TASK_ADDRESS,
    abi: TASK_ABI,
    functionName: 'rejectTask',
    args: [BigInt(taskId)],
  });
};

export const useTokenApprove = (amount: string) => {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0);
  return useSimulateContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'approve',
    args: [TASK_ADDRESS, parsedAmount],
  });
};

// --- READ HOOKS ---

export const useTask = (taskId: number) => {
  return useReadContract({
    address: TASK_ADDRESS,
    abi: TASK_ABI,
    functionName: 'tasks',
    args: [BigInt(taskId)],
    query: {
      enabled: taskId > 0, // Only fetch if taskId is valid
      staleTime: 5000,
    }
  });
};

export const useNextTaskId = () => {
  return useReadContract({
    address: TASK_ADDRESS,
    abi: TASK_ABI,
    functionName: 'nextTaskId',
  });
};
