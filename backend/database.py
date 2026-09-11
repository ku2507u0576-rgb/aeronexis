import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

db_url = settings.DATABASE_URL

# Handle Vercel / serverless environment
if os.environ.get("VERCEL") or not os.access(".", os.W_OK):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    orig_db = os.path.join(base_dir, "airfare_index.db")
    tmp_db = "/tmp/airfare_index.db"
    
    if os.path.exists(orig_db) and not os.path.exists(tmp_db):
        try:
            shutil.copyfile(orig_db, tmp_db)
        except Exception as e:
            print(f"Error copying DB to /tmp: {e}")
            
    if os.path.exists(tmp_db):
        db_url = f"sqlite:///{tmp_db}"
    elif os.path.exists(orig_db):
        db_url = f"sqlite:///{orig_db}"

engine = create_engine(
    db_url, connect_args={"check_same_thread": False} if db_url.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"init_db warning: {e}")

