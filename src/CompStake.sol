// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error TaskNotFound();
error Unauthorized();
error TaskNotOpen();
error TaskNotClaimed();
error TaskNotCompleted();
error AlreadyClaimed();
error InsufficientStake(uint256 requiredStake);
error InsufficientAllowance(uint256 requiredAllowance);

contract TaskEscrow {
    IERC20 public immutable token;
    uint256 public nextTaskId;
    uint256 public immutable stakePercentage; 

    enum TaskState {
        Open,
        Claimed,
        Completed,
        Verified,
        Rejected
    }

    struct Task {
        address creator;
        address worker;
        uint256 reward;
        uint256 stake;
        string inputCid;
        string outputCid;
        TaskState state;
    }

    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public tasksByCreator;
    mapping(address => uint256[]) public tasksByWorker;

    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 reward, string inputCid);
    event TaskClaimed(uint256 indexed taskId, address indexed worker, uint256 stake);
    event TaskCompleted(uint256 indexed taskId, string outputCid);
    event TaskVerified(uint256 indexed taskId);
    event TaskRejected(uint256 indexed taskId);

    constructor(address _tokenAddress, uint256 _stakePercentage) {
        require(_tokenAddress != address(0), "Invalid token address");
        require(_stakePercentage <= 10000, "Stake percentage must be <= 10000"); // Max 100%
        
        token = IERC20(_tokenAddress);
        stakePercentage = _stakePercentage;
        nextTaskId = 1;
    }

    function createTask(uint256 _reward, string memory _inputCid, string memory _taskTitle, string memory _taskDescription) external {
        if (token.allowance(msg.sender, address(this)) < _reward) {
            revert InsufficientAllowance(_reward);
        }

        if (!token.transferFrom(msg.sender, address(this), _reward)) {
            revert("Token transfer failed");
        }
        
        uint256 taskId = nextTaskId;
        tasks[taskId] = Task({
            creator: msg.sender,
            worker: address(0),
            reward: _reward,
            stake: 0,
            inputCid: _inputCid,
            outputCid: "",
            state: TaskState.Open
        });

        tasksByCreator[msg.sender].push(taskId);
        nextTaskId++;

        emit TaskCreated(taskId, msg.sender, _reward, _inputCid);
    }

    function claimTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];

        if (task.creator == address(0)) revert TaskNotFound();
        if (task.state != TaskState.Open) revert TaskNotOpen();
        if (task.creator == msg.sender) revert("Creator cannot claim their own task");

        uint256 requiredStake = (task.reward * stakePercentage) / 10000;
        
        if (token.allowance(msg.sender, address(this)) < requiredStake) {
            revert InsufficientAllowance(requiredStake);
        }
        
        if (!token.transferFrom(msg.sender, address(this), requiredStake)) {
            revert("Stake transfer failed");
        }

        task.worker = msg.sender;
        task.stake = requiredStake;
        task.state = TaskState.Claimed;

        tasksByWorker[msg.sender].push(_taskId);

        emit TaskClaimed(_taskId, msg.sender, requiredStake);
    }

    function completeTask(uint256 _taskId, string memory _outputCid) external {
        Task storage task = tasks[_taskId];

        if (task.creator == address(0)) revert TaskNotFound();
        if (task.state != TaskState.Claimed) revert TaskNotClaimed();
        if (task.worker != msg.sender) revert Unauthorized();

        task.outputCid = _outputCid;
        task.state = TaskState.Completed;

        emit TaskCompleted(_taskId, _outputCid);
    }

    function verifyTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];

        if (task.creator == address(0)) revert TaskNotFound();
        if (task.state != TaskState.Completed) revert TaskNotCompleted();
        if (task.creator != msg.sender) revert Unauthorized();

        if (!token.transfer(task.worker, task.reward + task.stake)) {
            revert("Payment to worker failed");
        }
        
        task.state = TaskState.Verified;

        emit TaskVerified(_taskId);
    }
    
    function rejectTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];

        if (task.creator == address(0)) revert TaskNotFound();
        if (task.state != TaskState.Completed) revert TaskNotCompleted();
        if (task.creator != msg.sender) revert Unauthorized();

        if (!token.transfer(task.creator, task.reward)) {
            revert("Reward return to creator failed");
        }
        
        if (!token.transfer(task.creator, task.stake)) {
            revert("Stake transfer to creator failed");
        }
        
        task.state = TaskState.Rejected;

        emit TaskRejected(_taskId);
    }
}
