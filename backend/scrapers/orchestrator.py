from __future__ import annotations
from datetime import datetime, timedelta
import structlog
from .indigo_scraper import IndiGoScraper
from .airindia_scraper import AirIndiaScraper
from .airindiaexpress_scraper import AirIndiaExpressScraper
from .spicejet_scraper import SpiceJetScraper
from .akasa_scraper import AkasaScraper
from .mmt_scraper import MMTScraper
from .yatra_scraper import YatraScraper
from .easemytrip_scraper import EaseMyTripScraper
from .cleartrip_scraper import CleartripScraper
from .ixigo_scraper import IxigoScraper
from .goibibo_scraper import GoibiboScraper

logger = structlog.get_logger()

class UnifiedAirfareScraper:
    def __init__(self):
        self.scrapers = [
            IndiGoScraper(), AirIndiaScraper(), AirIndiaExpressScraper(),
            SpiceJetScraper(), AkasaScraper(), MMTScraper(),
            YatraScraper(), EaseMyTripScraper(), CleartripScraper(),
            IxigoScraper(), GoibiboScraper()
        ]
        
    def scrape_all(self, routes: list[dict], airlines: list[str], advance_windows: list[int]) -> list[dict]:
        logger.info("Starting unified scraping...", total_routes=len(routes))
        all_quotes = []
        errors = []
        
        today = datetime.now()
        
        for scraper in self.scrapers:
            logger.info(f"Running scraper: {scraper.source_name}")
            for route in routes:
                for adv in advance_windows:
                    target_date = (today + timedelta(days=adv)).strftime("%Y-%m-%d")
                    try:
                        quotes = scraper.scrape_route(route['origin'], route['destination'], target_date)
                        all_quotes.extend(quotes)
                    except Exception as e:
                        logger.error(f"Error scraping {route} on {target_date} via {scraper.source_name}: {e}")
                        errors.append(str(e))
                        
        logger.info(f"Scraping completed. Collected {len(all_quotes)} quotes with {len(errors)} errors.")
        return all_quotes
