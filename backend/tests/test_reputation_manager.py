import pytest
from hypothesis import given, strategies as st, settings
from app.services.reputation_manager import ReputationManager, reset_reputation_manager

@given(
    sent_count=st.integers(min_value=1, max_value=1000),
    hard_bounce_count=st.integers(min_value=0, max_value=500),
    soft_bounce_count=st.integers(min_value=0, max_value=500)
)
@settings(max_examples=100, deadline=None)
def test_bounce_rate_calculation_accuracy(sent_count, hard_bounce_count, soft_bounce_count):
    """
    Property 13: Bounce rate calculation accuracy
    Validates: Requirements 7.1, 7.2
    
    For any sequence of recorded sends and bounces, the bounce rate SHALL equal 
    total_bounced / total_sent, and hard_bounces + soft_bounces SHALL equal total_bounced.
    """
    manager = ReputationManager()
    
    for i in range(sent_count):
        manager.record_sent(f"user{i}@example.com")
    
    for i in range(hard_bounce_count):
        manager.record_bounce(f"hard{i}@example.com", "hard", "mailbox not found")
    
    for i in range(soft_bounce_count):
        manager.record_bounce(f"soft{i}@example.com", "soft", "mailbox full")
    
    total_bounced = hard_bounce_count + soft_bounce_count
    expected_rate = total_bounced / sent_count if sent_count > 0 else 0.0
    
    assert manager.get_bounce_rate() == pytest.approx(expected_rate, rel=1e-9)
    
    status = manager.get_reputation_status()
    assert status.hard_bounces + status.soft_bounces == status.total_bounced
    assert status.total_bounced == total_bounced


@given(
    sent_count=st.integers(min_value=1, max_value=1000),
    bounce_count=st.integers(min_value=0, max_value=1000),
    threshold=st.floats(min_value=0.01, max_value=0.5)
)
@settings(max_examples=100, deadline=None)
def test_pause_threshold_enforcement(sent_count, bounce_count, threshold):
    """
    Property 14: Pause threshold enforcement
    Validates: Requirements 7.3
    
    For any reputation state where bounce_rate exceeds the configured threshold, 
    should_pause_sending() SHALL return true; otherwise it SHALL return false.
    """
    manager = ReputationManager(bounce_threshold=threshold)
    
    for i in range(sent_count):
        manager.record_sent(f"user{i}@example.com")
    
    for i in range(bounce_count):
        manager.record_bounce(f"bounce{i}@example.com", "hard", "invalid")
    
    bounce_rate = bounce_count / sent_count if sent_count > 0 else 0.0
    expected_pause = bounce_rate > threshold
    
    assert manager.should_pause_sending() == expected_pause


@given(
    emails_to_suppress=st.lists(st.emails(), min_size=0, max_size=50, unique=True),
    emails_to_check=st.lists(st.emails(), min_size=0, max_size=50)
)
@settings(max_examples=100, deadline=None)
def test_suppression_list_membership(emails_to_suppress, emails_to_check):
    """
    Property 15: Suppression list membership
    Validates: Requirements 7.4
    
    For any email address that has been added to the suppression list, 
    is_suppressed() SHALL return true; for any email not in the list, it SHALL return false.
    """
    manager = ReputationManager()
    
    suppressed_set = set(email.lower() for email in emails_to_suppress)
    
    for email in emails_to_suppress:
        manager.add_to_suppression_list(email, "hard bounce")
    
    for email in emails_to_check:
        expected = email.lower() in suppressed_set
        assert manager.is_suppressed(email) == expected
    
    for email in emails_to_suppress:
        assert manager.is_suppressed(email) == True
