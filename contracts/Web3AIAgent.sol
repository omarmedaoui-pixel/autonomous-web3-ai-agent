// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title Web3AIAgent
 * @dev A sample smart contract for AI Agent interaction
 */
contract Web3AIAgent {
    string public name = "Web3 AI Agent";
    uint256 public taskCount;
    address public owner;

    struct Task {
        uint256 id;
        string description;
        address creator;
        bool completed;
        uint256 timestamp;
    }

    mapping(uint256 => Task) public tasks;
    mapping(address => uint256) public userTaskCount;

    event TaskCreated(uint256 indexed taskId, string description, address indexed creator);
    event TaskCompleted(uint256 indexed taskId, address indexed completer);
    event AgentAction(string action, address indexed agent, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        taskCount = 0;
    }

    /**
     * @dev Create a new task for the AI Agent
     */
    function createTask(string memory _description) public returns (uint256) {
        taskCount++;
        uint256 taskId = taskCount;

        tasks[taskId] = Task({
            id: taskId,
            description: _description,
            creator: msg.sender,
            completed: false,
            timestamp: block.timestamp
        });

        userTaskCount[msg.sender]++;

        emit TaskCreated(taskId, _description, msg.sender);
        emit AgentAction("TaskCreated", msg.sender, block.timestamp);

        return taskId;
    }

    /**
     * @dev Mark a task as completed
     */
    function completeTask(uint256 _taskId) public {
        Task storage task = tasks[_taskId];
        require(task.id != 0, "Task does not exist");
        require(!task.completed, "Task already completed");
        require(task.creator == msg.sender, "Not task creator");

        task.completed = true;

        emit TaskCompleted(_taskId, msg.sender);
        emit AgentAction("TaskCompleted", msg.sender, block.timestamp);
    }

    /**
     * @dev Get task details
     */
    function getTask(uint256 _taskId) public view returns (
        uint256 id,
        string memory description,
        address creator,
        bool completed,
        uint256 timestamp
    ) {
        Task memory task = tasks[_taskId];
        require(task.id != 0, "Task does not exist");

        return (task.id, task.description, task.creator, task.completed, task.timestamp);
    }

    /**
     * @dev Get all tasks for a user
     */
    function getUserTasks(address _user) public view returns (uint256) {
        return userTaskCount[_user];
    }

    /**
     * @dev Update owner (only contract owner)
     */
    function updateOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyStop() public onlyOwner {
        emit AgentAction("EmergencyStop", msg.sender, block.timestamp);
    }
}
