"""Typed schemas used by LangChain structured outputs."""

from dataclasses import dataclass


@dataclass
class GovernanceProposal:
    title: str
    objective: str
    target: str
    value_wei: int
    calldata_hex: str
    metadata_uri: str
    revert_plan: str
    expected_proposal_id: str


@dataclass
class SimulationReview:
    passed: bool
    confidence: float
    risk_score_bps: int
    summary: str


@dataclass
class AdversarialReview:
    passed: bool
    severity: str
    summary: str
