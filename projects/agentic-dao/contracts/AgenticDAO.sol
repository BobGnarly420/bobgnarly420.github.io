// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgenticDAO
/// @notice Governance contract designed for agent-driven proposal execution with
///         explicit simulation, risk, quorum, and timelock checkpoints.
contract AgenticDAO {
    enum ProposalStatus {
        Pending,
        Approved,
        Queued,
        Executed,
        Rejected,
        Cancelled
    }

    struct Proposal {
        bytes32 id;
        address proposer;
        address target;
        uint256 value;
        bytes data;
        uint256 createdAt;
        uint256 queuedAt;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 quorumAtCreation;
        uint256 riskScoreBps; // 0-10_000, lower is safer
        bool simulationPassed;
        bool adversarialReviewPassed;
        bool executed;
        ProposalStatus status;
        string metadataURI;
    }

    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event ProposalCreated(bytes32 indexed proposalId, address indexed proposer, address indexed target, uint256 value);
    event VoteCast(bytes32 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalApproved(bytes32 indexed proposalId);
    event ProposalQueued(bytes32 indexed proposalId, uint256 executeAfter);
    event ProposalExecuted(bytes32 indexed proposalId, bytes callResult);
    event ProposalRejected(bytes32 indexed proposalId, string reason);
    event ProposalCancelled(bytes32 indexed proposalId);

    error NotMember();
    error NotGuardian();
    error InvalidProposal();
    error AlreadyFinalized();
    error SimulationRequired();
    error AdversarialReviewRequired();
    error RiskTooHigh();
    error QuorumNotMet();
    error VotingStillOpen();
    error VotingClosed();
    error TimelockNotElapsed();
    error CallFailed();

    uint256 public constant MAX_BPS = 10_000;

    uint256 public votingDuration;
    uint256 public executionTimelock;
    uint256 public maxRiskScoreBps;

    address public guardian;

    mapping(address => bool) public isMember;
    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;

    address[] private _members;

    modifier onlyMember() {
        if (!isMember[msg.sender]) revert NotMember();
        _;
    }

    modifier onlyGuardian() {
        if (msg.sender != guardian) revert NotGuardian();
        _;
    }

    constructor(
        address[] memory initialMembers,
        uint256 _votingDuration,
        uint256 _executionTimelock,
        uint256 _maxRiskScoreBps
    ) {
        require(initialMembers.length >= 3, "need>=3 members");
        require(_votingDuration > 0, "votingDuration=0");
        require(_executionTimelock > 0, "executionTimelock=0");
        require(_maxRiskScoreBps <= MAX_BPS, "risk bps invalid");

        guardian = msg.sender;
        votingDuration = _votingDuration;
        executionTimelock = _executionTimelock;
        maxRiskScoreBps = _maxRiskScoreBps;

        for (uint256 i = 0; i < initialMembers.length; i++) {
            _addMember(initialMembers[i]);
        }
    }

    receive() external payable {}

    function memberCount() external view returns (uint256) {
        return _members.length;
    }

    function quorumThreshold() public view returns (uint256) {
        // 60% quorum with floor of 2
        uint256 q = (_members.length * 60 + 99) / 100;
        return q < 2 ? 2 : q;
    }

    function createProposal(
        address target,
        uint256 value,
        bytes calldata data,
        string calldata metadataURI
    ) external onlyMember returns (bytes32 proposalId) {
        require(target != address(0), "target=0");

        proposalId = keccak256(
            abi.encode(msg.sender, target, value, data, metadataURI, block.timestamp, block.chainid)
        );
        Proposal storage p = proposals[proposalId];
        if (p.createdAt != 0) revert InvalidProposal();

        p.id = proposalId;
        p.proposer = msg.sender;
        p.target = target;
        p.value = value;
        p.data = data;
        p.createdAt = block.timestamp;
        p.quorumAtCreation = quorumThreshold();
        p.status = ProposalStatus.Pending;
        p.metadataURI = metadataURI;

        emit ProposalCreated(proposalId, msg.sender, target, value);
    }

    function submitAgentReview(
        bytes32 proposalId,
        bool simulationPassed,
        bool adversarialReviewPassed,
        uint256 riskScoreBps
    ) external onlyMember {
        Proposal storage p = proposals[proposalId];
        if (p.createdAt == 0) revert InvalidProposal();
        if (p.status != ProposalStatus.Pending) revert AlreadyFinalized();
        if (riskScoreBps > MAX_BPS) revert RiskTooHigh();

        p.simulationPassed = simulationPassed;
        p.adversarialReviewPassed = adversarialReviewPassed;
        p.riskScoreBps = riskScoreBps;

        if (riskScoreBps > maxRiskScoreBps) {
            p.status = ProposalStatus.Rejected;
            emit ProposalRejected(proposalId, "risk score above policy max");
        }
    }

    function vote(bytes32 proposalId, bool support) external onlyMember {
        Proposal storage p = proposals[proposalId];
        if (p.createdAt == 0) revert InvalidProposal();
        if (p.status != ProposalStatus.Pending) revert AlreadyFinalized();
        if (block.timestamp > p.createdAt + votingDuration) revert VotingClosed();
        if (hasVoted[proposalId][msg.sender]) revert InvalidProposal();

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            p.yesVotes += 1;
        } else {
            p.noVotes += 1;
        }

        emit VoteCast(proposalId, msg.sender, support, 1);
    }

    function finalizeVote(bytes32 proposalId) external {
        Proposal storage p = proposals[proposalId];
        if (p.createdAt == 0) revert InvalidProposal();
        if (p.status != ProposalStatus.Pending) revert AlreadyFinalized();
        if (block.timestamp <= p.createdAt + votingDuration) revert VotingStillOpen();

        if (!p.simulationPassed) revert SimulationRequired();
        if (!p.adversarialReviewPassed) revert AdversarialReviewRequired();
        if (p.riskScoreBps > maxRiskScoreBps) revert RiskTooHigh();

        if (p.yesVotes < p.quorumAtCreation) {
            p.status = ProposalStatus.Rejected;
            emit ProposalRejected(proposalId, "quorum not met");
            return;
        }

        if (p.yesVotes <= p.noVotes) {
            p.status = ProposalStatus.Rejected;
            emit ProposalRejected(proposalId, "insufficient majority");
            return;
        }

        p.status = ProposalStatus.Approved;
        emit ProposalApproved(proposalId);
    }

    function queueProposal(bytes32 proposalId) external {
        Proposal storage p = proposals[proposalId];
        if (p.createdAt == 0) revert InvalidProposal();
        if (p.status != ProposalStatus.Approved) revert InvalidProposal();

        p.status = ProposalStatus.Queued;
        p.queuedAt = block.timestamp;

        emit ProposalQueued(proposalId, block.timestamp + executionTimelock);
    }

    function executeProposal(bytes32 proposalId) external returns (bytes memory) {
        Proposal storage p = proposals[proposalId];
        if (p.createdAt == 0) revert InvalidProposal();
        if (p.status != ProposalStatus.Queued) revert InvalidProposal();
        if (block.timestamp < p.queuedAt + executionTimelock) revert TimelockNotElapsed();
        if (p.executed) revert AlreadyFinalized();

        p.executed = true;
        p.status = ProposalStatus.Executed;

        (bool success, bytes memory result) = p.target.call{value: p.value}(p.data);
        if (!success) {
            p.status = ProposalStatus.Cancelled;
            revert CallFailed();
        }

        emit ProposalExecuted(proposalId, result);
        return result;
    }

    function cancelProposal(bytes32 proposalId) external onlyGuardian {
        Proposal storage p = proposals[proposalId];
        if (p.createdAt == 0) revert InvalidProposal();
        if (p.status == ProposalStatus.Executed || p.status == ProposalStatus.Cancelled || p.status == ProposalStatus.Rejected) {
            revert AlreadyFinalized();
        }

        p.status = ProposalStatus.Cancelled;
        emit ProposalCancelled(proposalId);
    }

    function addMember(address account) external onlyGuardian {
        _addMember(account);
    }

    function removeMember(address account) external onlyGuardian {
        if (!isMember[account]) revert NotMember();
        if (_members.length <= 3) revert QuorumNotMet(); // don't allow governance collapse

        isMember[account] = false;

        for (uint256 i = 0; i < _members.length; i++) {
            if (_members[i] == account) {
                _members[i] = _members[_members.length - 1];
                _members.pop();
                break;
            }
        }

        emit MemberRemoved(account);
    }

    function _addMember(address account) internal {
        require(account != address(0), "member=0");
        require(!isMember[account], "already member");

        isMember[account] = true;
        _members.push(account);

        emit MemberAdded(account);
    }
}
