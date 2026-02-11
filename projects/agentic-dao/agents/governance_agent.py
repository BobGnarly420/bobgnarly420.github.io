"""LangChain orchestration for AgenticDAO governance lifecycle.

This module wires a language model to:
1) Draft proposals in a strict schema.
2) Simulate expected outcomes and assign a risk score.
3) Generate adversarial review findings.
4) Submit proposal + reviews to the Solidity contract.

The code is intentionally explicit and plain-text first so operators can audit all steps.
"""

from __future__ import annotations

import json
import os
from dataclasses import asdict
from typing import Any

from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from web3 import Web3

from schemas import AdversarialReview, GovernanceProposal, SimulationReview

load_dotenv()


class AgenticDAOClient:
    """Thin web3 adapter used by LangChain orchestration layer."""

    def __init__(self, rpc_url: str, contract_address: str, abi_path: str, private_key: str) -> None:
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not self.w3.is_connected():
            raise RuntimeError("Could not connect to RPC provider")

        with open(abi_path, "r", encoding="utf-8") as f:
            abi = json.load(f)

        self.account = self.w3.eth.account.from_key(private_key)
        self.contract = self.w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=abi)

    def _send_tx(self, tx: dict[str, Any]) -> str:
        tx.update(
            {
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gasPrice": self.w3.eth.gas_price,
                "chainId": self.w3.eth.chain_id,
            }
        )

        if "gas" not in tx:
            tx["gas"] = self.w3.eth.estimate_gas(tx)

        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        return receipt.transactionHash.hex()

    def create_proposal(self, proposal: GovernanceProposal) -> str:
        tx = self.contract.functions.createProposal(
            Web3.to_checksum_address(proposal.target),
            int(proposal.value_wei),
            bytes.fromhex(proposal.calldata_hex.replace("0x", "")),
            proposal.metadata_uri,
        ).build_transaction({})
        return self._send_tx(tx)

    def submit_review(self, proposal_id_hex: str, simulation: SimulationReview, adversarial: AdversarialReview) -> str:
        tx = self.contract.functions.submitAgentReview(
            bytes.fromhex(proposal_id_hex.replace("0x", "")),
            simulation.passed,
            adversarial.passed,
            simulation.risk_score_bps,
        ).build_transaction({})
        return self._send_tx(tx)


class GovernanceOrchestrator:
    """LangChain-driven flow for drafting and validating DAO proposals."""

    def __init__(self, model: str = "gpt-4o-mini") -> None:
        self.llm = ChatOpenAI(model=model, temperature=0)

        self.proposal_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a DAO proposal compiler. Return JSON only and follow schema exactly.",
                ),
                (
                    "human",
                    "Mission:\n{mission}\n\nConstraints:\n{constraints}\n\n"
                    "Return a deterministic proposal with executable fields for target, value_wei, and calldata_hex.",
                ),
            ]
        )

        self.simulation_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a risk simulation engine. Return JSON only with pass/fail, confidence, and risk bps.",
                ),
                (
                    "human",
                    "Proposal:\n{proposal_json}\n\n"
                    "Generate simulation output across market, smart contract, and governance attack scenarios.",
                ),
            ]
        )

        self.adversary_prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are an adversarial reviewer. Return JSON only with exploit summary, severity, and pass/fail.",
                ),
                (
                    "human",
                    "Proposal:\n{proposal_json}\nSimulation:\n{simulation_json}\n\n"
                    "Try to break this proposal and identify privilege-escalation or value-drain paths.",
                ),
            ]
        )

    def draft_proposal(self, mission: str, constraints: str) -> GovernanceProposal:
        chain = self.proposal_prompt | self.llm.with_structured_output(GovernanceProposal)
        return chain.invoke({"mission": mission, "constraints": constraints})

    def run_simulation(self, proposal: GovernanceProposal) -> SimulationReview:
        chain = self.simulation_prompt | self.llm.with_structured_output(SimulationReview)
        return chain.invoke({"proposal_json": json.dumps(asdict(proposal), indent=2)})

    def run_adversarial_review(self, proposal: GovernanceProposal, simulation: SimulationReview) -> AdversarialReview:
        chain = self.adversary_prompt | self.llm.with_structured_output(AdversarialReview)
        return chain.invoke(
            {
                "proposal_json": json.dumps(asdict(proposal), indent=2),
                "simulation_json": json.dumps(asdict(simulation), indent=2),
            }
        )


def run_end_to_end(mission: str, constraints: str) -> None:
    """Draft -> simulate -> adversarial review -> submit to contract."""
    orchestrator = GovernanceOrchestrator(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"))

    proposal = orchestrator.draft_proposal(mission, constraints)
    simulation = orchestrator.run_simulation(proposal)
    adversarial = orchestrator.run_adversarial_review(proposal, simulation)

    if not simulation.passed:
        raise RuntimeError(f"Simulation failed: {simulation.summary}")
    if not adversarial.passed:
        raise RuntimeError(f"Adversarial review failed: {adversarial.summary}")

    client = AgenticDAOClient(
        rpc_url=os.environ["RPC_URL"],
        contract_address=os.environ["DAO_CONTRACT_ADDRESS"],
        abi_path=os.environ.get("DAO_ABI_PATH", "./artifacts/AgenticDAO.abi.json"),
        private_key=os.environ["DAO_AGENT_PRIVATE_KEY"],
    )

    proposal_tx = client.create_proposal(proposal)
    print(f"proposal_tx={proposal_tx}")

    # In production, proposalId should be recovered from contract event logs.
    proposal_id_hex = proposal.expected_proposal_id
    review_tx = client.submit_review(proposal_id_hex, simulation, adversarial)
    print(f"review_tx={review_tx}")


if __name__ == "__main__":
    run_end_to_end(
        mission="Allocate 10 ETH from treasury to security audit vendor based on approved service agreement",
        constraints=(
            "Risk score <= 2500 bps; no self-transfer; must include revert path; "
            "target contract must be allowlisted in metadata."
        ),
    )
