from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time

_PBKDF2_ALGORITHM = "sha256"
_PBKDF2_ITERATIONS = 200_000
_PBKDF2_SALT_BYTES = 16
_TOKEN_TTL_SECONDS = 60 * 60 * 24  # 24 hours


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    padded = value + "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(padded.encode("ascii"))


def hash_password(password: str) -> str:
    """
    Hash plaintext password using PBKDF2-HMAC.

    Stored format:
    pbkdf2_sha256$<iterations>$<salt_b64url>$<digest_b64url>
    """
    if not password:
        raise ValueError("Password cannot be empty")

    salt = secrets.token_bytes(_PBKDF2_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        _PBKDF2_ALGORITHM,
        password.encode("utf-8"),
        salt,
        _PBKDF2_ITERATIONS,
    )
    return (
        f"pbkdf2_{_PBKDF2_ALGORITHM}"
        f"${_PBKDF2_ITERATIONS}"
        f"${_b64url_encode(salt)}"
        f"${_b64url_encode(digest)}"
    )


def verify_password(password: str, password_hash: str) -> bool:
    """Verify plaintext password against stored PBKDF2-HMAC hash."""
    try:
        method, iterations, salt_b64, digest_b64 = password_hash.split("$", maxsplit=3)
        if method != f"pbkdf2_{_PBKDF2_ALGORITHM}":
            return False
        salt = _b64url_decode(salt_b64)
        expected_digest = _b64url_decode(digest_b64)
        computed_digest = hashlib.pbkdf2_hmac(
            _PBKDF2_ALGORITHM,
            password.encode("utf-8"),
            salt,
            int(iterations),
        )
    except (ValueError, TypeError):
        return False

    return hmac.compare_digest(computed_digest, expected_digest)


def generate_token(user_id: int, role: str) -> str:
    """
    Generate signed bearer token in JWT format (HS256).

    Secret is read from AUTH_SECRET env variable.
    For local development fallback, 'dev-secret-change-me' is used.
    """
    secret = os.getenv("AUTH_SECRET", "dev-secret-change-me").encode("utf-8")

    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + _TOKEN_TTL_SECONDS,
    }

    header_part = _b64url_encode(
        json.dumps(header, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    payload_part = _b64url_encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    )
    signing_input = f"{header_part}.{payload_part}".encode("ascii")
    signature = hmac.new(secret, signing_input, hashlib.sha256).digest()
    signature_part = _b64url_encode(signature)

    return f"{header_part}.{payload_part}.{signature_part}"
