import uuid
import time
import json
import hashlib
from pathlib import Path
from typing import Optional
from app.config import Config

class AuthService:
    SESSION_DURATION = 24 * 60 * 60
    
    _active_sessions: dict = {}
    _storage_path: Path = None
    
    @classmethod
    def _get_storage_path(cls) -> Path:
        if cls._storage_path is None:
            cls._storage_path = Path(__file__).parent.parent.parent.parent / "config" / Config.SESSION_STORAGE_FILE
        return cls._storage_path
    
    @classmethod
    def _load_sessions(cls):
        path = cls._get_storage_path()
        if path.exists():
            try:
                with open(path, 'r') as f:
                    data = json.load(f)
                    cls._active_sessions = data.get('sessions', {})
                    cls._cleanup_expired()
            except (json.JSONDecodeError, IOError):
                cls._active_sessions = {}
    
    @classmethod
    def _save_sessions(cls):
        path = cls._get_storage_path()
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, 'w') as f:
                json.dump({'sessions': cls._active_sessions}, f)
        except IOError:
            pass
    
    @classmethod
    def _cleanup_expired(cls):
        current_time = time.time()
        expired = [k for k, v in cls._active_sessions.items() if current_time > v.get('expires_at', 0)]
        for k in expired:
            del cls._active_sessions[k]
        if expired:
            cls._save_sessions()
    
    @classmethod
    def authenticate_token(cls, access_token: str) -> Optional[dict]:
        if not access_token:
            return None
        if access_token == Config.ADMIN_ACCESS_TOKEN and Config.ADMIN_ACCESS_TOKEN:
            cls._load_sessions()
            session_token = cls.generate_session_token('admin')
            return {
                'success': True,
                'session_token': session_token,
                'user': {
                    'email': 'admin',
                    'role': 'admin'
                }
            }
        return None
    
    @classmethod
    def generate_session_token(cls, user_email: str) -> str:
        token_id = str(uuid.uuid4())
        created_at = int(time.time())
        expires_at = created_at + cls.SESSION_DURATION
        raw_token = f"{user_email}:{token_id}:{created_at}"
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        session_token = f"{token_hash}:{token_id}"
        cls._active_sessions[session_token] = {
            'email': user_email,
            'created_at': created_at,
            'expires_at': expires_at,
            'token_id': token_id
        }
        cls._save_sessions()
        return session_token
    
    @classmethod
    def validate_session(cls, session_token: str) -> Optional[dict]:
        if not session_token:
            return None
        cls._load_sessions()
        session = cls._active_sessions.get(session_token)
        if not session:
            return None
        if time.time() > session['expires_at']:
            del cls._active_sessions[session_token]
            cls._save_sessions()
            return None
        return {
            'valid': True,
            'user': {
                'email': session['email']
            }
        }
    
    @classmethod
    def invalidate_session(cls, session_token: str) -> bool:
        cls._load_sessions()
        if session_token in cls._active_sessions:
            del cls._active_sessions[session_token]
            cls._save_sessions()
            return True
        return False
    
    @classmethod
    def clear_all_sessions(cls):
        cls._active_sessions.clear()
        cls._save_sessions()
