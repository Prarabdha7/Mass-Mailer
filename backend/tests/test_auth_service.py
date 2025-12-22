import pytest
from hypothesis import given, strategies as st, settings, assume
from app.services.auth_service import AuthService


@given(
    email=st.text(min_size=1, max_size=100),
    password=st.text(min_size=1, max_size=100)
)
@settings(max_examples=100, deadline=None)
def test_invalid_credentials_rejection(email, password):
    """
    Property 2: Invalid Credentials Rejection
    Validates: Requirements 1.2, 2.3
    
    For any login attempt with credentials not matching the master admin or any 
    authorized user, the Auth_System shall reject the attempt and return None.
    """
    AuthService.clear_all_sessions()
    authorized_users = AuthService.get_authorized_users()
    is_valid = any(
        u.get('email') == email and u.get('password') == password 
        for u in authorized_users
    )
    assume(not is_valid)
    result = AuthService.authenticate_credentials(email, password)
    assert result is None


@given(
    access_token=st.text(min_size=1, max_size=100)
)
@settings(max_examples=100, deadline=None)
def test_invalid_access_token_rejection(access_token):
    """
    Property 5: Invalid Access Token Rejection
    Validates: Requirements 5.3
    
    For any access token that does not match the configured ADMIN_ACCESS_TOKEN,
    the Auth_System shall reject the authentication attempt and return None.
    """
    from app.config import Config
    valid_token = "test-valid-admin-token-12345"
    original_token = Config.ADMIN_ACCESS_TOKEN
    Config.ADMIN_ACCESS_TOKEN = valid_token
    try:
        AuthService.clear_all_sessions()
        assume(access_token != valid_token)
        result = AuthService.authenticate_token(access_token)
        assert result is None
    finally:
        Config.ADMIN_ACCESS_TOKEN = original_token


@given(
    email=st.emails()
)
@settings(max_examples=100, deadline=None)
def test_session_validation(email):
    """
    Property 6: Session Validation
    Validates: Requirements 3.2, 6.2
    
    For any valid session token generated for a user, validate_session shall 
    return valid=True and the correct user email.
    """
    AuthService.clear_all_sessions()
    session_token = AuthService.generate_session_token(email)
    result = AuthService.validate_session(session_token)
    assert result is not None
    assert result['valid'] == True
    assert result['user']['email'] == email
