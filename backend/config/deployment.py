import os
from .settings import *

ALLOWED_HOSTS = [os.environ['WEBSITE_HOSTNAME']] #our own domain name
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
STATIC_ROOT=os.path.join(BASE_DIR,'staticfiles')

#CONNECTION STRING ENV FROM AZURE FOR DATABASE
connection_string=os.environ['AZURE_POSTGRESQL_CONNECTION_STRING']
parameters = dict(pair.split('=') for pair in connection_string.split(';'))
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': parameters['Database'],
        'HOST': parameters['Host'],
        'USER': parameters['User Id'],
        'PASSWORD': parameters['Password'],
    }
}
