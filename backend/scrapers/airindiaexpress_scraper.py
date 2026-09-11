from __future__ import annotations
from .base_scraper import BaseScraper, logger

class AirIndiaExpressScraper(BaseScraper):
    source_name = "AirIndiaExpress"
    base_url = "https://www.airindiaexpress.in/"
    airline_code = "IX"
    
    def scrape_route(self, origin: str, dest: str, date: str) -> list[dict]:
        logger.info(f"Production scraper not implemented for {self.source_name}, use synthetic data")
        return []
        
    def parse_response(self, response) -> list[dict]:
        return []
