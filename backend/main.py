"""
Real-Time Airfare Price Index (APIx) — FastAPI Backend
Government-grade airfare monitoring platform for India.
Crash-resilient with global exception handling and health checks.
"""
from __future__ import annotations

import traceback
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.api.routes import router
from backend.database import engine, Base


def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Real-Time Airfare Price Index (APIx) API",
    description="Government-grade airfare price monitoring platform for India. "
                "Tracks fares from 5 airlines + 6 OTAs across 10 Tier-1 routes. "
                "All values in ₹ (INR).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend on any port
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


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "status": "error",
            "message": f"Endpoint '{request.url.path}' not found",
            "docs": "/docs",
        },
    )


@app.exception_handler(422)
async def validation_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": "Invalid request parameters",
            "detail": str(exc),
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


# ============ Root & Health Endpoints ============

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Real-Time Airfare Price Index (APIx) API",
        "version": "1.0.0",
        "currency": "INR (₹)",
        "country": "India",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
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
        "timestamp": datetime.now().isoformat(),
        "components": {
            "database": {"status": db_status, "latency_ms": db_latency_ms},
            "api": {"status": "healthy"},
        },
        "cache": cache_stats,
        "circuit_breakers": circuit_stats,
    }


@app.post("/admin/cache/clear")
def clear_cache():
    """Clear all in-memory caches. Use when data changes are not reflecting."""
    from backend.api.auth import route_cache, index_cache, dashboard_cache
    route_cache.clear()
    index_cache.clear()
    dashboard_cache.clear()
    return {"status": "success", "message": "All caches cleared", "timestamp": datetime.now().isoformat()}


# ============ Include API Router ============

app.include_router(router, prefix="/v1")
