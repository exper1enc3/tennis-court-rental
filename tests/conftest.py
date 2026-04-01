import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.infrastructure.sqlite import get_db


class DummyDB:
    pass


def override_get_db():
    yield DummyDB()


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()