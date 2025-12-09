import os
from .settings import *
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# import dj_database_url
# DATABASES = {
#     'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
# }

ALLOWED_HOSTS = [os.environ.get('WEBSITE_HOSTNAME'),'*', 'djangopracadyplomowa-awa4hhecg8g5f0fq.westeurope-01.azurewebsites.net']
# ALLOWED_HOSTS = [os.environ['WEBSITE_HOSTNAME']] #our own domain name
CSRF_TRUSTED_ORIGINS = [
    "https://mango-bay-00e260d03.3.azurestaticapps.net",
    "https://djangopracadyplomowa-awa4hhecg8g5f0fq.westeurope-01.azurewebsites.net/",
]

DEBUG=False

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'axes.middleware.AxesMiddleware',

]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_URL = '/static/'
STATIC_ROOT=os.path.join(BASE_DIR,'staticfiles')

#CONNECTION STRING ENV FROM AZURE FOR DATABASE
# connection_string=os.environ['AZURE_POSTGRESQL_CONNECTION_STRING']
# parameters = dict(pair.split('=') for pair in connection_string.split(';'))
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': os.environ.get('PGDATABASE'),
#         'USER': os.environ.get('PGUSER'),
#         'HOST': os.environ.get('PGHOST'),
#         'PASSWORD': os.environ.get('PGPASSWORD'),
#         'PORT': 5432,
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
SECRET_KEY = os.environ.get('SECRET_KEY','super-secret-key')

CORS_ALLOWED_ORIGINS = [
    "https://mango-bay-00e260d03.3.azurestaticapps.net",  # Twój frontend na SWA
    "https://djangopracadyplomowa-awa4hhecg8g5f0fq.westeurope-01.azurewebsites.net",  # Backend też może być origin
]
CORS_ALLOW_CREDENTIALS = True
