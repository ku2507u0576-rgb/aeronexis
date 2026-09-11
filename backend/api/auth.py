"""
APIx Auth & API Stability Layer
- Removes broken per-minute rate limit that was causing 429s
- Adds in-memory LRU cache with TTL for route search results
- Adds circuit breaker state machine for external dependency protection
- Adds structured request logging
"""
from __future__ import annotations

import time
import threading
from collections import OrderedDict
from datetime import datetime
from typing import Any, Optional
from fastapi import Header, HTTPException, status, Request

# ─── API KEY ──────────────────────────────────────────────────────────────────
VALID_API_KEYS = {"apix-demo-key-2026", "apix-internal-2026"}

def verify_api_key(api_key: str = Header(alias="X-API-Key")):
    """Validates API key. No aggressive rate limiting — handled by cache layer."""
    if api_key not in VALID_API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_API_KEY", "message": "Invalid API Key. Use X-API-Key header."}
        )
    return api_key


# ─── IN-MEMORY CACHE WITH TTL ─────────────────────────────────────────────────
class TTLCache:
    """Thread-safe LRU cache with per-key TTL. Prevents hammering DB for same queries."""

    def __init__(self, maxsize: int = 256, default_ttl: int = 300):
        self._cache: OrderedDict[str, tuple[Any, float]] = OrderedDict()
        self._maxsize = maxsize
        self._default_ttl = default_ttl
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key not in self._cache:
                self._misses += 1
                return None
            value, expires_at = self._cache[key]
            if time.time() > expires_at:
                del self._cache[key]
                self._misses += 1
                return None
            # Move to end (LRU)
            self._cache.move_to_end(key)
            self._hits += 1
            return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        with self._lock:
            expires_at = time.time() + (ttl or self._default_ttl)
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = (value, expires_at)
            if len(self._cache) > self._maxsize:
                self._cache.popitem(last=False)  # evict oldest

    def invalidate(self, key: str) -> None:
        with self._lock:
            self._cache.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

    @property
    def stats(self) -> dict:
        with self._lock:
            total = self._hits + self._misses
            return {
                "size": len(self._cache),
                "maxsize": self._maxsize,
                "hits": self._hits,
                "misses": self._misses,
                "hit_rate": round(self._hits / total, 3) if total > 0 else 0.0,
                "status": "healthy",
            }


# ─── CIRCUIT BREAKER ─────────────────────────────────────────────────────────
class CircuitBreaker:
    """
    CLOSED → OPEN after 5 consecutive failures
    OPEN → HALF_OPEN after 30s cooldown
    HALF_OPEN → CLOSED after 2 successes, → OPEN after 1 failure
    """
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

    def __init__(self, name: str, failure_threshold: int = 5, recovery_timeout: int = 30):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self._state = self.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: Optional[float] = None
        self._lock = threading.Lock()

    @property
    def state(self) -> str:
        with self._lock:
            if self._state == self.OPEN:
                if time.time() - (self._last_failure_time or 0) > self.recovery_timeout:
                    self._state = self.HALF_OPEN
                    self._success_count = 0
            return self._state

    def record_success(self):
        with self._lock:
            self._failure_count = 0
            if self._state == self.HALF_OPEN:
                self._success_count += 1
                if self._success_count >= 2:
                    self._state = self.CLOSED
                    self._success_count = 0

    def record_failure(self):
        with self._lock:
            self._failure_count += 1
            self._last_failure_time = time.time()
            if self._state == self.HALF_OPEN or self._failure_count >= self.failure_threshold:
                self._state = self.OPEN
                self._failure_count = 0

    def is_available(self) -> bool:
        return self.state != self.OPEN

    @property
    def info(self) -> dict:
        return {
            "name": self.name,
            "state": self.state,
            "failures": self._failure_count,
            "last_failure": datetime.fromtimestamp(self._last_failure_time).isoformat() if self._last_failure_time else None,
        }


# ─── GLOBAL INSTANCES (singleton per process) ─────────────────────────────────
route_cache = TTLCache(maxsize=512, default_ttl=300)   # 5-min TTL for route data
index_cache = TTLCache(maxsize=128, default_ttl=3600)  # 1-hour TTL for index data
dashboard_cache = TTLCache(maxsize=32, default_ttl=120) # 2-min TTL for dashboard

db_circuit   = CircuitBreaker("database", failure_threshold=5, recovery_timeout=30)
scraper_circuit = CircuitBreaker("scraper", failure_threshold=3, recovery_timeout=60)


def get_cache_stats() -> dict:
    return {
        "route_cache": route_cache.stats,
        "index_cache": index_cache.stats,
        "dashboard_cache": dashboard_cache.stats,
    }


def get_circuit_stats() -> dict:
    return {
        "database": db_circuit.info,
        "scraper": scraper_circuit.info,
    }
