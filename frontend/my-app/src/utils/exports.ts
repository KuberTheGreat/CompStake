import TaskEscrowAbi from "../contract_data/TaskEscrowAbi.json";
import TokenAbi from "../contract_data/TokenAbi.json";

export const TASK_ADDRESS = "0x7753afc3cdE894fE7EdD873a869Ab327936652DC";
export const TOKEN_ADDRESS = "0x893b7F7BCBCAE4678F96a27E5c7cF9c7879120e3";

export const TASK_ABI = TaskEscrowAbi;
export const TOKEN_ABI = TokenAbi;

export const taskContractConfig = {
    address: TASK_ADDRESS,
    abi: TASK_ABI
} as const