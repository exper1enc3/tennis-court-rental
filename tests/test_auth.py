from fastapi import HTTPException


def test_healthcheck(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_signup_success(client, monkeypatch):
    def fake_handle_signup(command, db):
        return {
            "id": 1,
            "first_name": command.first_name,
            "last_name": command.last_name,
            "email": command.email,
            "role": command.role,
            "is_active": True,
            "created_at": "2026-03-31T12:00:00"
        }

    monkeypatch.setattr("app.api.routes.handle_signup", fake_handle_signup)

    payload = {
        "first_name": "Marina",
        "last_name": "Test",
        "email": "marina@example.com",
        "password": "12345678",
        "role": "player"
    }

    response = client.post("/auth/signup", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1
    assert data["first_name"] == "Marina"
    assert data["last_name"] == "Test"
    assert data["email"] == "marina@example.com"
    assert data["role"] == "player"
    assert data["is_active"] is True


def test_signup_missing_required_field(client):
    payload = {
        "first_name": "Marina",
        "email": "marina@example.com",
        "password": "12345678"
    }

    response = client.post("/auth/signup", json=payload)

    assert response.status_code == 422


def test_signup_invalid_email(client):
    payload = {
        "first_name": "Marina",
        "last_name": "Test",
        "email": "wrong-email",
        "password": "12345678",
        "role": "player"
    }

    response = client.post("/auth/signup", json=payload)

    assert response.status_code == 422


def test_signup_default_role_is_player(client, monkeypatch):
    def fake_handle_signup(command, db):
        return {
            "id": 2,
            "first_name": command.first_name,
            "last_name": command.last_name,
            "email": command.email,
            "role": command.role,
            "is_active": True,
            "created_at": "2026-03-31T12:00:00"
        }

    monkeypatch.setattr("app.api.routes.handle_signup", fake_handle_signup)

    payload = {
        "first_name": "Anna",
        "last_name": "Smith",
        "email": "anna@example.com",
        "password": "12345678"
    }

    response = client.post("/auth/signup", json=payload)

    assert response.status_code == 201
    assert response.json()["role"] == "player"


def test_signup_http_exception_from_handler(client, monkeypatch):
    def fake_handle_signup(command, db):
        raise HTTPException(status_code=409, detail="User already exists")

    monkeypatch.setattr("app.api.routes.handle_signup", fake_handle_signup)

    payload = {
        "first_name": "Marina",
        "last_name": "Test",
        "email": "marina@example.com",
        "password": "12345678",
        "role": "player"
    }

    response = client.post("/auth/signup", json=payload)

    assert response.status_code == 409
    assert response.json()["detail"] == "User already exists"


def test_signin_success(client, monkeypatch):
    def fake_handle_signin(command, db):
        return {
            "access_token": "fake-jwt-token",
            "token_type": "bearer",
            "user": {
                "id": 1,
                "first_name": "Marina",
                "last_name": "Test",
                "email": command.email,
                "role": "player",
                "is_active": True,
                "created_at": "2026-03-31T12:00:00"
            }
        }

    monkeypatch.setattr("app.api.routes.handle_signin", fake_handle_signin)

    payload = {
        "email": "marina@example.com",
        "password": "12345678"
    }

    response = client.post("/auth/signin", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "fake-jwt-token"
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "marina@example.com"
    assert data["user"]["role"] == "player"


def test_signin_missing_password(client):
    payload = {
        "email": "marina@example.com"
    }

    response = client.post("/auth/signin", json=payload)

    assert response.status_code == 422


def test_signin_negative_wrong_credentials(client, monkeypatch):
    def fake_handle_signin(command, db):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    monkeypatch.setattr("app.api.routes.handle_signin", fake_handle_signin)

    payload = {
        "email": "marina@example.com",
        "password": "wrongpassword"
    }

    response = client.post("/auth/signin", json=payload)

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"


def test_signin_negative_user_not_found(client, monkeypatch):
    def fake_handle_signin(command, db):
        raise HTTPException(status_code=404, detail="User not found")

    monkeypatch.setattr("app.api.routes.handle_signin", fake_handle_signin)

    payload = {
        "email": "nouser@example.com",
        "password": "12345678"
    }

    response = client.post("/auth/signin", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_signin_http_exception_from_handler(client, monkeypatch):
    def fake_handle_signin(command, db):
        raise HTTPException(status_code=403, detail="User is inactive")

    monkeypatch.setattr("app.api.routes.handle_signin", fake_handle_signin)

    payload = {
        "email": "marina@example.com",
        "password": "12345678"
    }

    response = client.post("/auth/signin", json=payload)

    assert response.status_code == 403
    assert response.json()["detail"] == "User is inactive"