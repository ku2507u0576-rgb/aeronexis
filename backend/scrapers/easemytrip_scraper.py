from __future__ import annotations
from .base_scraper import BaseScraper, logger

class EaseMyTripScraper(BaseScraper):
    source_name = "EaseMyTrip"
    base_url = "https://www.easemytrip.com/"
    airline_code = "ALL"
    
    def scrape_route(self, origin: str, dest: str, date: str) -> list[dict]:
        logger.info(f"Production scraper not implemented for {self.source_name}, use synthetic data")
        return []
        
    def parse_response(self, response) -> list[dict]:
        return []
