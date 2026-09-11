"""
Aero | Real-Time Airfare Price Index (APIx) — Unified Platform Server
Merges Frontend Web App, REST API, API Documentation (Swagger/ReDoc), and Health Check under a single unified URL.
"""
from __future__ import annotations

import os
import traceback
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from backend.api.routes import router
from backend.database import engine, Base

FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "build")


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Aero | Real-Time Airfare Price Index (APIx) API",
    description="Government-grade airfare price monitoring platform for India. "
                "Tracks fares from 5 airlines + 6 OTAs across 10 Tier-1 routes. "
                "All values in ₹ (INR).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Global Exception Handlers (prevent crashes) ============

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch ALL unhandled exceptions so the server never crashes."""
    error_detail = str(exc)
    tb = traceback.format_exc()
    print(f"\n❌ UNHANDLED ERROR on {request.method} {request.url.path}:")
    print(tb)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": error_detail,
            "path": str(request.url.path),
            "timestamp": datetime.now().isoformat(),
        },
    )


# ============ Startup ============

@app.on_event("startup")
def on_startup():
    """Initialize database tables on server start."""
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"⚠️ Database init warning (may already exist): {e}")


# ============ Health Endpoints ============

@app.get("/health")
@app.get("/v1/health")
def health_check():
    """Enhanced health check — database, cache, and circuit breaker status."""
    from sqlalchemy import text
    from backend.database import SessionLocal
    from backend.api.auth import get_cache_stats, get_circuit_stats

    db_status = "healthy"
    db_latency_ms = 0
    try:
        import time
        db = SessionLocal()
        t0 = time.time()
        db.execute(text("SELECT 1"))
        db.close()
        db_latency_ms = round((time.time() - t0) * 1000, 1)
    except Exception:
        db_status = "degraded"

    cache_stats = get_cache_stats()
    circuit_stats = get_circuit_stats()
    overall = "healthy" if db_status == "healthy" and circuit_stats["database"]["state"] == "CLOSED" else "degraded"

    return {
        "status": overall,
        "version": "1.0.0",
        "service": "Aero Unified Platform",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "database": {"status": db_status, "latency_ms": db_latency_ms},
            "api": {"status": "healthy"},
            "frontend": {"status": "mounted" if os.path.exists(FRONTEND_BUILD_DIR) else "not_built"},
        },
        "cache": cache_stats,
        "circuit_breakers": circuit_stats,
    }


@app.post("/admin/cache/clear")
def clear_cache():
    """Clear all in-memory caches."""
    from backend.api.auth import route_cache, index_cache, dashboard_cache
    route_cache.clear()
    index_cache.clear()
    dashboard_cache.clear()
    return {"status": "success", "message": "All caches cleared", "timestamp": datetime.now().isoformat()}


# ============ Include API Router (/v1/...) ============

app.include_router(router, prefix="/v1")


# ============ Mount Frontend Static Files & SPA Routing ============

if os.path.exists(FRONTEND_BUILD_DIR):
    static_dir = os.path.join(FRONTEND_BUILD_DIR, "static")
    if os.path.exists(static_dir):
        app.mount("/static", StaticFiles(directory=static_dir), name="static")

    images_dir = os.path.join(FRONTEND_BUILD_DIR, "images")
    if os.path.exists(images_dir):
        app.mount("/images", StaticFiles(directory=images_dir), name="images")

    videos_dir = os.path.join(FRONTEND_BUILD_DIR, "videos")
    if os.path.exists(videos_dir):
        app.mount("/videos", StaticFiles(directory=videos_dir), name="videos")


@app.get("/{full_path:path}")
async def serve_spa_or_file(full_path: str):
    """Serve React frontend single-page application and static root files."""
    # Never intercept backend routes or docs
    if full_path.startswith("v1") or full_path in ("docs", "redoc", "openapi.json", "health", "v1/health"):
        return JSONResponse(status_code=404, content={"status": "error", "message": f"Endpoint '{full_path}' not found"})

    if os.path.exists(FRONTEND_BUILD_DIR):
        # 1. Direct file match in build directory (e.g. favicon.ico, asset-manifest.json, 200.html)
        if full_path:
            specific_file = os.path.join(FRONTEND_BUILD_DIR, full_path)
            if os.path.isfile(specific_file):
                return FileResponse(specific_file)

        # 2. SPA index.html fallback for all client-side routes (/route-search, /dashboard, etc.)
        index_file = os.path.join(FRONTEND_BUILD_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

    return {
        "message": "Welcome to Aero — Real-Time Airfare Price Index Platform",
        "version": "1.0.0",
        "api": "/v1",
        "docs": "/docs",
        "health": "/v1/health",
    }

