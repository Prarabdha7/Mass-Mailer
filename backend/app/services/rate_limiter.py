import time
from collections import defaultdict
from functools import wraps
from flask import request, jsonify
from app.config import Config

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
        self.rate_limit = Config.RATE_LIMIT_PER_MINUTE
        self.burst_limit = Config.RATE_LIMIT_BURST
        self.window = 60
    
    def _get_client_id(self) -> str:
        return request.headers.get('X-Forwarded-For', request.remote_addr) or 'unknown'
    
    def _cleanup_old_requests(self, client_id: str):
        current_time = time.time()
        cutoff = current_time - self.window
        self.requests[client_id] = [t for t in self.requests[client_id] if t > cutoff]
    
    def is_allowed(self) -> tuple[bool, dict]:
        client_id = self._get_client_id()
        current_time = time.time()
        self._cleanup_old_requests(client_id)
        
        request_count = len(self.requests[client_id])
        
        recent_requests = [t for t in self.requests[client_id] if t > current_time - 1]
        if len(recent_requests) >= self.burst_limit:
            return False, {
                'error': 'Rate limit exceeded (burst)',
                'retry_after': 1,
                'limit': self.burst_limit,
                'window': '1 second'
            }
        
        if request_count >= self.rate_limit:
            oldest = min(self.requests[client_id]) if self.requests[client_id] else current_time
            retry_after = int(oldest + self.window - current_time) + 1
            return False, {
                'error': 'Rate limit exceeded',
                'retry_after': retry_after,
                'limit': self.rate_limit,
                'window': f'{self.window} seconds'
            }
        
        self.requests[client_id].append(current_time)
        return True, {}
    
    def get_remaining(self) -> int:
        client_id = self._get_client_id()
        self._cleanup_old_requests(client_id)
        return max(0, self.rate_limit - len(self.requests[client_id]))

rate_limiter = RateLimiter()

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        allowed, error_info = rate_limiter.is_allowed()
        if not allowed:
            response = jsonify(error_info)
            response.status_code = 429
            response.headers['Retry-After'] = str(error_info.get('retry_after', 60))
            response.headers['X-RateLimit-Limit'] = str(rate_limiter.rate_limit)
            response.headers['X-RateLimit-Remaining'] = '0'
            return response
        
        response = f(*args, **kwargs)
        return response
    return decorated_function
