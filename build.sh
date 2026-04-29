#!/usr/bin/env bash
set -o errexit

python -m pip install --upgrade pip
pip install -r requirements.txt

npm --prefix frontend ci --include=dev
npm --prefix frontend run build

if [ ! -f frontend/dist/index.html ]; then
  echo "React build failed: frontend/dist/index.html was not created." >&2
  exit 1
fi

python backend/manage.py collectstatic --noinput
python backend/manage.py migrate
