from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Optional

@dataclass
class SuppressedEmail:
    email: str
    bounce_type: str
    reason: str
    suppressed_at: str

    def to_dict(self):
        return asdict(self)

@dataclass
class ReputationStatus:
    total_sent: int
    total_bounced: int
    hard_bounces: int
    soft_bounces: int
    bounce_rate: float
    suppressed_count: int
    reputation_score: str
    is_paused: bool

    def to_dict(self):
        return asdict(self)

class ReputationManager:
    def __init__(self, bounce_threshold: float = 0.05):
        self.bounce_threshold = bounce_threshold
        self.total_sent = 0
        self.hard_bounces = 0
        self.soft_bounces = 0
        self.suppression_list: dict[str, SuppressedEmail] = {}

    def record_sent(self, email: str) -> None:
        self.total_sent += 1

    def record_bounce(self, email: str, bounce_type: str, reason: str) -> None:
        if bounce_type == "hard":
            self.hard_bounces += 1
            self.add_to_suppression_list(email, reason)
        elif bounce_type == "soft":
            self.soft_bounces += 1

    def get_bounce_rate(self) -> float:
        if self.total_sent == 0:
            return 0.0
        total_bounced = self.hard_bounces + self.soft_bounces
        return total_bounced / self.total_sent

    def should_pause_sending(self) -> bool:
        return self.get_bounce_rate() > self.bounce_threshold

    def is_suppressed(self, email: str) -> bool:
        return email.lower() in self.suppression_list

    def add_to_suppression_list(self, email: str, reason: str) -> None:
        email_lower = email.lower()
        if email_lower not in self.suppression_list:
            self.suppression_list[email_lower] = SuppressedEmail(
                email=email,
                bounce_type="hard",
                reason=reason,
                suppressed_at=datetime.now(timezone.utc).isoformat()
            )

    def get_suppression_list(self) -> list[SuppressedEmail]:
        return list(self.suppression_list.values())

    def get_reputation_status(self) -> ReputationStatus:
        bounce_rate = self.get_bounce_rate()
        
        if bounce_rate <= 0.02:
            reputation_score = "good"
        elif bounce_rate <= 0.05:
            reputation_score = "warning"
        else:
            reputation_score = "critical"

        return ReputationStatus(
            total_sent=self.total_sent,
            total_bounced=self.hard_bounces + self.soft_bounces,
            hard_bounces=self.hard_bounces,
            soft_bounces=self.soft_bounces,
            bounce_rate=bounce_rate,
            suppressed_count=len(self.suppression_list),
            reputation_score=reputation_score,
            is_paused=self.should_pause_sending()
        )

reputation_manager = ReputationManager()

def get_reputation_manager() -> ReputationManager:
    return reputation_manager

def reset_reputation_manager(bounce_threshold: float = 0.05) -> ReputationManager:
    global reputation_manager
    reputation_manager = ReputationManager(bounce_threshold)
    return reputation_manager
