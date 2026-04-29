#!/usr/bin/env bash
set -o errexit

python -m pip install --upgrade pip
pip install -r requirements.txt

npm --prefix frontend ci
npm --prefix frontend run build

python backend/manage.py collectstatic --noinput
python backend/manage.py migrate
