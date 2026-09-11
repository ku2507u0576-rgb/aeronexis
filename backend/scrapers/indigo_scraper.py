from __future__ import annotations
from .base_scraper import BaseScraper, logger

class IndiGoScraper(BaseScraper):
    source_name = "IndiGo"
    base_url = "https://www.goindigo.in/"
    airline_code = "6E"
    
    def scrape_route(self, origin: str, dest: str, date: str) -> list[dict]:
        logger.info(f"Production scraper not implemented for {self.source_name}, use synthetic data")
        # CSS Selectors that WOULD be used:
        # Flight row: .flight-row
        # Base fare: .base-fare-amount
        # Taxes: .tax-breakdown-total
        return []
        
    def parse_response(self, response) -> list[dict]:
        return []
