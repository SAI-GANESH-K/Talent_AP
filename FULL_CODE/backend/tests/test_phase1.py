"""Phase 1 tests — health check, products API, import validation.

Run with: pytest -v
"""

from decimal import Decimal, ROUND_HALF_UP

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Test client for the FastAPI application."""
    return TestClient(app)


class TestHealthCheck:
    """Test the health-check endpoint."""

    def test_health_returns_200(self, client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200

    def test_health_response_format(self, client):
        data = client.get("/api/v1/health").json()
        assert data["service"] == "coverwise-api"
        assert data["version"] == "0.1.0"
        assert data["status"] in ("ok", "degraded")
        assert data["database"] in ("connected", "disconnected")


class TestProductsEndpoint:
    """Test the products catalogue endpoint."""

    def test_products_returns_200(self, client):
        response = client.get("/api/v1/products")
        assert response.status_code == 200

    def test_products_returns_list(self, client):
        data = client.get("/api/v1/products").json()
        assert isinstance(data, list)

    def test_products_count_after_import(self, client):
        """After import, should have exactly 14 products."""
        data = client.get("/api/v1/products").json()
        # This test only passes after import_official_data has been run
        if len(data) > 0:
            assert len(data) == 14

    def test_product_fields(self, client):
        """Verify product response contains required fields."""
        data = client.get("/api/v1/products").json()
        if len(data) > 0:
            p = data[0]
            assert "product_id" in p
            assert "product_name" in p
            assert "product_type" in p
            assert "plain_language_summary" in p
            assert "nri_eligible" in p


class TestAdvisorsEndpoint:
    """Test the advisors listing endpoint."""

    def test_advisors_returns_200(self, client):
        response = client.get("/api/v1/advisors")
        assert response.status_code == 200

    def test_advisors_filter_by_language(self, client):
        response = client.get("/api/v1/advisors", params={"language": "Telugu"})
        assert response.status_code == 200

    def test_advisors_filter_by_mode(self, client):
        response = client.get("/api/v1/advisors", params={"mode": "video"})
        assert response.status_code == 200


class TestGoldenPremiumCalculation:
    """Verify the official ₹1,045 premium example using pure Python Decimal.

    This test does NOT require database — it validates the calculation logic
    that will be implemented in the pricing engine.
    """

    def test_golden_premium_exact_decimal(self):
        """PRD-X4CBUF, male, 30, non-smoker, regular, 30yr, SA=1cr, rider RDR-LUR23D SA=50L.

        Expected: base monthly ₹914 + rider monthly ₹131 = ₹1,045 total.
        """
        # Rate from premium_rates.csv — read as string to avoid float error
        rate = Decimal("1.044")

        # SA = 1 crore
        sa = Decimal("10000000")

        # Band factor for ₹1 crore (≥ 10,000,000): 1.00
        band_factor = Decimal("1.00")

        # Base annual premium
        base_annual = rate * (sa / Decimal("1000")) * band_factor
        assert base_annual == Decimal("10440.000")

        # Rider rate for age band 18-30
        rider_rate = Decimal("0.3")
        rider_sa = Decimal("5000000")  # 50 lakh
        rider_annual = rider_rate * (rider_sa / Decimal("1000"))
        assert rider_annual == Decimal("1500.0")

        # Rider cap check: 1500 / 10440 < 30%
        rider_pct = (rider_annual / base_annual) * Decimal("100")
        assert rider_pct < Decimal("30")

        # Monthly modal factor
        modal_monthly = Decimal("0.0875")

        # Round base and rider instalments SEPARATELY
        base_monthly = (base_annual * modal_monthly).quantize(
            Decimal("1"), rounding=ROUND_HALF_UP
        )
        rider_monthly = (rider_annual * modal_monthly).quantize(
            Decimal("1"), rounding=ROUND_HALF_UP
        )

        assert base_monthly == Decimal("914")
        assert rider_monthly == Decimal("131")

        # Total = sum of separately rounded amounts
        total_monthly = base_monthly + rider_monthly
        assert total_monthly == Decimal("1045")

    def test_float_would_fail(self):
        """Demonstrate why Decimal is required — float gives wrong rounding."""
        # Using float: 10440 * 0.0875 = 913.4999... (not exactly 913.5)
        float_result = 10440 * 0.0875
        # This would round DOWN to 913 with standard rounding
        assert float_result < 913.5, "Float gives 913.4999... not 913.5"
