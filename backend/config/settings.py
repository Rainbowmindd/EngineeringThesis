import os
import sys
from pathlib import Path
from datetime import timedelta
from decouple import config
import dj_database_url
# DATABASES = {
#     'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
# }

BASE_DIR = Path(__file__).resolve().parent.parent

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')  # <--- TO JEST KLUCZOWE

SECRET_KEY = 'django-insecure-dev-key-change-this'
DEBUG = True

# ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0', '[::1']
ALLOWED_HOSTS = ['*']

APPS_DIR = os.path.join(BASE_DIR, 'apps')
if APPS_DIR not in sys.path:
    sys.path.insert(0, APPS_DIR) # <-- MUSI BYĆ!

INSTALLED_APPS = [
    # Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'corsheaders',
    'axes',

    #celery
    'django_celery_beat',
    'django_celery_results',

    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',

    #social login
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.microsoft',

    #myapps
    'users.apps.UsersConfig',           # Użyj tej konwencji, jeśli masz tak zdefiniowaną klasę
    'schedules.apps.SchedulesConfig',
    'reservations.apps.ReservationsConfig',
    'notifications.apps.NotificationsConfig',
]


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'axes.middleware.AxesMiddleware',

]
#Brute force protection settings
AXES_FAILURE_LIMIT=3
AXES_COOLOFF_TIME=0.1
AXES_ONLY_USER_FAILURES=True
AXES_LOCKOUT_TEMPLATE=None

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  #later -> Azure SQL
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pl-pl'
TIME_ZONE = 'Europe/Warsaw'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

SITE_ID = 1

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        'dj_rest_auth.jwt_auth.JWTCookieAuthentication',
    ]
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

#for now for development purposes
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
#POTEM zamienic na smtp zamiast console backend
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_CONFIRM_EMAIL_ON_GET=True

ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True

REST_USE_JWT = True
JWT_AUTH_COOKIE = 'jwt-auth'
JWT_AUTH_REFRESH_COOKIE = 'jwt-refresh-token'


# INSTALLED_APPS += ['corsheaders']

# MIDDLEWARE.insert(1, 'corsheaders.middleware.CorsMiddleware')

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
"http://localhost:5173",  # adres Twojego Reacta w Vite
    "http://127.0.0.1:5173",
]

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
#
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:5173",  # adres Twojego Reacta w Vite
#     "http://127.0.0.1:5173",
# ]

CORS_ALLOW_CREDENTIALS = True

AUTH_USER_MODEL = 'users.User'

REST_AUTH_REGISTER_SERIALIZERS = {
    'REGISTER_SERIALIZER': 'apps.users.serializers.RegisterSerializer',}

FRONTEND_URL='http://localhost:5173'
PASSWORD_RESET_CONFIRM_URL = f"{FRONTEND_URL}/reset-password/{{uid}}/{{token}}/"

DEFAULT_FROM_EMAIL="noreply@agh.pl"

#save celery task results in Django's database
CELERY_RESULT_BACKEND='redis://127.0.0.1:6379/0'

#URL DLA backendu wynikow gdzie celery przechowuje wyniki zadan
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/0'
#THIS configures Redis as the datastore between Django and Celery
# CELERY_BROKER_URL=config('CELERY_BROKER_REDIS_URL',default='redis://localhost:6379')

#Zawartosc ktora celery bedzie akceptowac
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER='json'
CELERY_RESULT_SERIALIZER='json'
CELERY_TIMEZONE = 'Europe/Warsaw'

#UNBLOCK
CELERY_TASK_ALWAYS_EAGER=False
CELERY_TASK_EAGER_PROPAGATION=False

CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers.DatabaseScheduler'

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
            "secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
            "key": ""
        },
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
    }
}
# GOOGLE_CLIENT_ID = config("GOOGLE_CLIENT_ID", default="dummy-client-id")
# GOOGLE_CLIENT_SECRET = config("GOOGLE_CLIENT_SECRET", default="dummy-client-secret")