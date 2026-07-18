"""Settings for the automated test suite.

Overrides the production settings so tests run without PostgreSQL or Cloudinary:
an in-memory SQLite database and Django's in-memory file storage.
"""
from .settings import *  # noqa: F401,F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}

# Faster password hashing for tests.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# The base settings now default DEBUG=False, which turns on production security
# (HTTPS redirect, HSTS). The test client speaks plain HTTP, so disable the
# redirect here to avoid every request 301-ing.
SECURE_SSL_REDIRECT = False

# Disable rate limiting during tests (a None rate means "unlimited" in DRF but
# keeps the scope key defined so ScopedRateThrottle does not misconfigure).
REST_FRAMEWORK = {
    **REST_FRAMEWORK,  # noqa: F405
    "DEFAULT_THROTTLE_RATES": {"anon": None, "user": None, "login": None},
}
