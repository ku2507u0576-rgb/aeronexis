import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app

pytestmark = pytest.mark.asyncio

async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

async def test_api_auth_required():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/airfare-index")
    assert response.status_code == 401

async def test_api_auth_success():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/airfare-index", headers=headers)
    assert response.status_code == 200

async def test_get_airfare_index():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/airfare-index", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"

async def test_get_routes():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/routes", headers=headers)
    assert response.status_code == 200

async def test_get_fares():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/fares?route=DEL-BOM", headers=headers)
    assert response.status_code == 200

async def test_get_airlines():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/airlines", headers=headers)
    assert response.status_code == 200

async def test_get_trends():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/trends", headers=headers)
    assert response.status_code == 200

async def test_get_advance_booking():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/advance-booking?route=DEL-BOM", headers=headers)
    assert response.status_code == 200

async def test_get_data_quality():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/data-quality", headers=headers)
    assert response.status_code == 200

async def test_get_dashboard_summary():
    headers = {"X-API-Key": "apix-demo-key-2026"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/v1/dashboard-summary", headers=headers)
    assert response.status_code == 200
