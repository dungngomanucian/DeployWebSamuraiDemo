# install python > 3.10

# install dependencies. follow these command below, remember use them in correct path (/backend):
cd backend
py -3.11 -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
venv\Scripts\activate
pip install -r requirements.txt

# create a secret key, copy command below and run them in powershell
python manage.py shell
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
# copy new secret key and paste it into .env.example 

# edit .env.example 
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=
DB_HOST=
DB_PORT=5432

DJANGO_SECRET_KEY=

SUPABASE_URL= 
SUPABASE_PUBLISHABLE_KEY= 
SUPABASE_SECRET_KEY= 

# create .env file
cp .env.example .env

