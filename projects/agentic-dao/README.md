# AGENT_DAO (LangChain + Solidity)

A real implementation scaffold for the **Agentic Autonomous DAO** concept:

- **On-chain policy + execution rail:** `contracts/AgenticDAO.sol`
- **Off-chain agent orchestrator:** `agents/governance_agent.py`
- **Typed output schema:** `agents/schemas.py`

## What this implements

### Solidity governance core
`AgenticDAO.sol` adds explicit controls for agent-driven governance:

- Proposal lifecycle: `Pending -> Approved -> Queued -> Executed`
- Mandatory pre-vote gate fields:
  - simulation result (`simulationPassed`)
  - adversarial review result (`adversarialReviewPassed`)
  - risk score in basis points (`riskScoreBps`)
- Quorum and majority checks
- Timelock queue before execution
- Guardian cancellation kill-switch
- Member management with anti-collapse guard

### LangChain orchestrator
`governance_agent.py` wires three LLM-driven phases:

1. **Proposal compiler agent**
2. **Simulation agent**
3. **Adversarial reviewer agent**

Then submits proposal + review metadata to the Solidity contract through `web3.py`.

## Directory layout

```text
projects/agentic-dao/
├── contracts/
│   └── AgenticDAO.sol
├── agents/
│   ├── governance_agent.py
│   ├── schemas.py
│   └── requirements.txt
├── .env.example
└── README.md
```

## Minimal run flow (off-chain agent)

```bash
cd projects/agentic-dao/agents
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
python governance_agent.py
```

## Contract integration notes

- Compile `contracts/AgenticDAO.sol` with your preferred toolchain (Foundry/Hardhat).
- Export ABI JSON and set `DAO_ABI_PATH`.
- Deploy with a guardian account and at least 3 members.
- Fund DAO contract for payable proposals if treasury actions require value transfer.

## Security notes

This is a practical scaffold, not audited production code. Before mainnet usage:

- add formal tests (unit + invariant + fuzz)
- use role separation for proposer/reviewer/executor keys
- add allowlist controls for proposal target contracts
- add replay protection and stricter calldata policy gates
- perform independent security audit
