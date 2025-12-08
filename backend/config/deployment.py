import os
from .settings import *
#
# import dj_database_url
# DATABASES = {
#     'default': dj_database_url.config(default=os.environ.get('postgresql://postgres:kqkKqqdsGaucSvQDnTCBAwgISsapEuWV@postgres.railway.internal:5432/railway'))
# }

ALLOWED_HOSTS = ['*']
# ALLOWED_HOSTS = [os.environ['WEBSITE_HOSTNAME']] #our own domain name
CSRF_TRUSTED_ORIGINS = ['https://'+os.environ['WEBSITE_HOSTNAME']]
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
connection_string=os.environ['AZURE_POSTGRESQL_CONNECTION_STRING']
parameters = dict(pair.split('=') for pair in connection_string.split(';'))
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get['PGDATABASE'],
        'USER': os.environ.get['PGUSER'],
        'host': os.environ.get['PGHOST'],
        'PASSWORD': os.environ.get['PGPASSWORD'],
        'PORT': 5432,
    }
}

