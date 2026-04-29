# Airport Ground Operations Optimizer Using AI

Airport Ground Operations Optimizer is a notebook-driven airport operations dashboard built with React, Django, and Python analytics tooling. It covers nine operational modules and now serves all of them through Django APIs that the React frontend consumes directly.

## Current Status

- React is connected to all 9 Django module APIs.
- Django exposes notebook-backed JSON payloads for each airport module.
- The frontend renders backend data for command center, flight operations, HR, equipment, infrastructure, AI engine, analytics, weather, and notifications.
- Notebook execution is cached on the backend and can be refreshed on demand.

## Architecture

The project has three layers:

1. Notebook logic:
   `ai_models/notebooks/*.ipynb` contains the operational and AI logic. Each notebook defines a `payload`.
2. Django API layer:
   `backend/api/notebook_runtime.py` executes notebook code, converts the result into JSON-safe data, and caches it.
3. React dashboard:
   `frontend/src/api.js` and `frontend/src/hooks/useModuleData.js` fetch module payloads from Django and render them in the UI.

High-level flow:

```text
Jupyter notebook payload
        ->
backend/api/notebook_services/
        ->
backend/api/views.py
        ->
/api/<module>/
        ->
frontend/src/api.js
        ->
frontend/src/pages/*
```

## Integrated Modules

| Module | Notebook | Django endpoint | Frontend page |
| --- | --- | --- | --- |
| Command Center | `01_Command_Center.ipynb` | `/api/command-center/` | `CommandCenter.jsx` |
| Flight Operations | `02_Flight_Operation.ipynb` | `/api/flight-operations/` | `FlightOperation.jsx` |
| Human Resources | `03_Human_Resources.ipynb` | `/api/human-resources/` | `HumanResources.jsx` |
| Equipments | `04_Equipments.ipynb` | `/api/equipments/` | `Equipment.jsx` |
| Infrastructure | `05_Infrastructure.ipynb` | `/api/infrastructure/` | `Infrastructure.jsx` |
| AI Engine | `06_AI_Engine.ipynb` | `/api/ai-engine/` | `AiEngine.jsx` |
| Analytics | `07_Analytics.ipynb` | `/api/analytics/` | `Analytics.jsx` |
| Weather | `08_Weather.ipynb` | `/api/weather/` | `Weather.jsx` |
| Notifications | `09_Notification.ipynb` | `/api/notifications/` | `Notifications.jsx` |

## Backend API

Main endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/` | API index with available module routes |
| `GET` | `/api/test/` | Backend connectivity check |
| `GET` | `/api/command-center/` | Command center payload |
| `GET` | `/api/flight-operations/` | Flight operations payload |
| `GET` | `/api/human-resources/` | Human resources payload |
| `GET` | `/api/equipments/` | Equipment payload |
| `GET` | `/api/infrastructure/` | Infrastructure payload |
| `GET`, `POST` | `/api/ai-engine/` | AI engine payload |
| `GET` | `/api/analytics/` | Analytics payload |
| `GET` | `/api/weather/` | Weather payload |
| `GET` | `/api/notifications/` | Notifications payload |

Compatibility endpoints:

| Method | Endpoint | Notes |
| --- | --- | --- |
| `GET` | `/api/flights/` | Alias for flight operations payload |
| `POST` | `/api/predict/` | Alias for AI engine payload |

Cache refresh:

- Add `?refresh=1` to a module endpoint to clear the notebook cache before returning data.
- Example: `/api/command-center/?refresh=1`

Typical response shape:

```json
{
  "status": "ok",
  "module": "command-center",
  "data": {
    "generated_at": "2026-04-27T09:30:00",
    "kpis": {},
    "top_risks": []
  }
}
```

## Frontend Data Wiring

The React side now uses shared module fetch helpers instead of local mock feeds for the nine notebook-backed pages.

Important files:

- `frontend/src/api.js`
- `frontend/src/hooks/useModuleData.js`
- `frontend/src/components/ModuleData.jsx`
- `frontend/src/pages/CommandCenter.jsx`
- `frontend/src/pages/FlightOperation.jsx`
- `frontend/src/pages/HumanResources.jsx`
- `frontend/src/pages/Equipment.jsx`
- `frontend/src/pages/Infrastructure.jsx`
- `frontend/src/pages/AiEngine.jsx`
- `frontend/src/pages/Analytics.jsx`
- `frontend/src/pages/Weather.jsx`
- `frontend/src/pages/Notifications.jsx`

## Tech Stack

### Frontend

- React 19
- Vite
- JavaScript
- Custom CSS

### Backend

- Django 6
- Django REST Framework
- django-cors-headers
- SQLite

### Data and AI

- Jupyter notebooks
- Python
- pandas
- NumPy
- matplotlib
- scikit-learn

## Project Structure

```text
Project/
+-- ai_models/
|   +-- notebooks/
|       +-- 01_Command_Center.ipynb
|       +-- 02_Flight_Operation.ipynb
|       +-- 03_Human_Resources.ipynb
|       +-- 04_Equipments.ipynb
|       +-- 05_Infrastructure.ipynb
|       +-- 06_AI_Engine.ipynb
|       +-- 07_Analytics.ipynb
|       +-- 08_Weather.ipynb
|       +-- 09_Notification.ipynb
+-- backend/
|   +-- api/
|   |   +-- notebook_runtime.py
|   |   +-- notebook_services/
|   |   +-- urls.py
|   |   +-- views.py
|   +-- backend/
|   |   +-- settings.py
|   |   +-- urls.py
|   +-- manage.py
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- pages/
|   |   +-- styles/
|   |   +-- api.js
|   |   +-- App.jsx
|   +-- package.json
+-- requirements.txt
+-- README.md
```

## Local Setup

From the project root:

```bash
cd "D:\b tech\4 sem\Project Airport\Project"
```

### 1. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r ..\requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

### 2. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

### 3. Frontend-to-backend connection

The React app calls Django with relative `/api/...` URLs. In local development, Vite proxies those requests to:

```text
http://127.0.0.1:8000
```

So local development works without extra CORS setup if both servers are running in dev mode.

To start both servers from the frontend folder:

```bash
npm run dev:full
```

The built frontend can also be served directly by Django:

```bash
cd frontend
npm run build
cd ..\backend
python manage.py runserver 127.0.0.1:8000
```

Then open:

```text
http://127.0.0.1:8000/
```

This keeps the project connected to Django even when the Vite dev server is closed.

Optional override:

Create `frontend/.env` only if you want the frontend to call a different backend base URL.

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Notebook Runtime Notes

- The backend executes notebook code and expects each notebook to define a `payload` variable.
- Notebook magics such as `%...` and shell lines such as `!...` are skipped by the runtime.
- pandas, NumPy, timestamps, and DataFrames are converted to JSON-safe values before the API responds.
- Payloads are cached with `lru_cache` for faster repeated requests.

## Verification

Useful manual checks:

1. Open `http://127.0.0.1:8000/api/test/`
2. Open `http://127.0.0.1:8000/api/`
3. Open one module endpoint such as `http://127.0.0.1:8000/api/command-center/`
4. Run the frontend and confirm the nine pages load backend data
5. Build the frontend:

```bash
cd frontend
npm run build
```

## Expected Outcomes

- Better visibility into airport ground operations
- Faster identification of conflicts, shortages, and delay drivers
- Stronger coordination between gates, crews, equipment, and infrastructure
- More realistic operational dashboards backed by the notebook logic
- Clearer separation between AI/data generation and frontend presentation

## Future Scope

- Persist flights, staff, equipment, and alerts in database models
- Add authentication and role-based access
- Support scheduled notebook refresh jobs
- Connect to live airport, airline, and weather feeds
- Add write-back workflows for acknowledgements, assignments, and dispatch actions
- Export reports and operational summaries
