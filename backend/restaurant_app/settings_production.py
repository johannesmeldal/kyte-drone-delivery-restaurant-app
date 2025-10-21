"""
Production settings for Restaurant App
"""
from .settings import *
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# ALLOWED_HOSTS for production
ALLOWED_HOSTS = [
    'johannes-case.sandbox.aviant.no',
    '16.171.195.58',
    'localhost',
    '127.0.0.1',
]

# Security settings
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False  # ALB handles SSL termination
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [
    'https://johannes-case.sandbox.aviant.no',
]

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://johannes-case.sandbox.aviant.no",
]

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Database - using SQLite for simplicity, can switch to PostgreSQL later
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/restaurant-app/django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Use environment variable for SECRET_KEY in production
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', SECRET_KEY)

# Kyte backend URL
KYTE_BACKEND_URL = os.environ.get('KYTE_BACKEND_URL', 'http://localhost:8001')

