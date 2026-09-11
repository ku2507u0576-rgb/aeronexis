from __future__ import annotations
import time
import random
from abc import ABC, abstractmethod
from fake_useragent import UserAgent
import structlog

logger = structlog.get_logger()

class BaseScraper(ABC):
    def __init__(self):
        self.ua = UserAgent()
        
    def rate_limit(self):
        # 1 request per 10 seconds
        time.sleep(10 + random.uniform(0, 2))
        
    def rotate_proxy(self):
        # In production, integrate with a proxy pool
        pass
        
    def check_robots_txt(self, url):
        # In production, verify robots.txt
        pass
        
    def get_headers(self):
        return {
            "User-Agent": self.ua.random,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        
    @abstractmethod
    def scrape_route(self, origin: str, dest: str, date: str) -> list[dict]:
        pass
        
    @abstractmethod
    def parse_response(self, response) -> list[dict]:
        pass
