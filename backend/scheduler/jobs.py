from apscheduler.schedulers.background import BackgroundScheduler
import structlog
from datetime import datetime

logger = structlog.get_logger()

def daily_scrape_job():
    logger.info("Running daily_scrape_job")
    # In production: Initialize DB, orchestrate scrapers, save to raw_fares
    pass

def daily_clean_job():
    logger.info("Running daily_clean_job")
    # In production: Pull from raw_fares, run pipeline, save to cleaned_fares
    pass

def daily_index_job():
    logger.info("Running daily_index_job")
    # In production: Calculate daily index from today's cleaned fares
    pass

def weekly_index_job():
    logger.info("Running weekly_index_job")
    # In production: Calculate weekly index
    pass

def monthly_index_job():
    logger.info("Running monthly_index_job")
    # In production: Calculate monthly index
    pass

def start_scheduler():
    scheduler = BackgroundScheduler()
    
    scheduler.add_job(daily_scrape_job, 'cron', hour=0, minute=0)
    scheduler.add_job(daily_clean_job, 'cron', hour=6, minute=15)
    scheduler.add_job(daily_index_job, 'cron', hour=7, minute=0)
    scheduler.add_job(weekly_index_job, 'cron', day_of_week='sun', hour=7, minute=30)
    scheduler.add_job(monthly_index_job, 'cron', day=1, hour=8, minute=0)
    
    scheduler.start()
    logger.info("Scheduler started.")
