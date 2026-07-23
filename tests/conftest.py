import copy
import pytest
from fastapi.testclient import TestClient
from src.app import app, activities as activities_ref


@pytest.fixture
def client():
    """Provide a TestClient and restore in-memory `activities` after each test."""
    original = copy.deepcopy(activities_ref)
    with TestClient(app) as c:
        yield c

    # Restore original state so tests are isolated
    activities_ref.clear()
    activities_ref.update(original)
