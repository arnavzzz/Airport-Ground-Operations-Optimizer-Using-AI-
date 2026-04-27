# Airport Ground Operations Optimizer Using AI

An AI-powered airport operations dashboard for improving ground resource coordination, predicting delays, optimizing schedules, and monitoring airport performance in real time.

The project focuses on the main pain points of airport ground operations:

- Poor coordination between teams, equipment, and airport infrastructure
- Unpredictable delays caused by weather, aircraft issues, equipment breakdowns, and late updates
- Inefficient scheduling of gates, staff, equipment, runway usage, and turnaround tasks

## Overview

Airport ground operations are time-sensitive and highly connected. A delay in one area can quickly affect gates, crew assignments, baggage handling, fueling, aircraft turnaround, and passenger experience.

This system combines a React command-center interface, a Django REST backend, and AI model notebooks to simulate and support smarter airport operations. It is designed to help airport teams track live resources, predict bottlenecks, recommend operational actions, and improve on-time performance.

## Key Features

- Command Center dashboard for high-level airport monitoring
- Flight operations board with gates, runways, bays, turnaround status, and delay risk
- Human resources logic for staff demand, fatigue, role capacity, and assignment planning
- Equipment tracking for GPUs, tugs, fuel trucks, loaders, stairs, and service vehicles
- Infrastructure planning for gates, parking bays, baggage belts, GPUs, and runway capacity
- AI Engine notebook for delay prediction, optimization scoring, conflict detection, and recommendations
- Analytics notebook for delay trends, cost savings, fuel savings, turnaround history, and model performance
- Weather intelligence for visibility, wind, crosswind, runway suitability, and weather impact forecasting
- Notification logic for live alerts, severity scoring, deduplication, routing, and SLA escalation
- Backend-ready payload generation from notebooks for future API integration

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS modules and custom styles

### Backend

- Django
- Django REST Framework
- django-cors-headers
- SQLite

### AI and Analytics

- Jupyter notebooks
- Python
- pandas
- NumPy
- matplotlib
- scikit-learn in AI Engine logic

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
|   |   +-- urls.py
|   |   +-- views.py
|   +-- backend/
|   |   +-- settings.py
|   |   +-- urls.py
|   +-- db.sqlite3
|   +-- manage.py
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- styles/
|   |   +-- api.js
|   |   +-- App.jsx
|   +-- package.json
+-- ui-ux_design/
+-- project airport documentation.txt
+-- README.md
```

## Application Modules

| Module | Purpose |
| --- | --- |
| Command Center | Overall airport operations monitoring and decision support |
| Flight Operation | Live flights, gates, runways, bays, turnaround, and delay risk |
| Human Resources | Staff capacity, role demand, assignment planning, and fatigue checks |
| Equipments | Equipment availability, utilization, maintenance risk, and allocation |
| Infrastructure | Gate, bay, belt, GPU, and runway capacity planning |
| AI Engine | Prediction, optimization, conflict detection, and recommendation logic |
| Analytics | Historical trends, delay causes, savings, utilization, and performance dashboards |
| Weather | Weather risk, visibility, crosswind, runway suitability, and capacity impact |
| Notification | Live alerts, severity filters, deduplication, escalation, and routing |

## Backend API

Current Django API endpoints:

```text
GET  /api/test/      Check backend connection
GET  /api/flights/   Return sample live flight data
POST /api/predict/   Return sample prediction response
```

The frontend uses `frontend/src/api.js` to call these endpoints.

## Setup Instructions

### 1. Clone or open the project

```bash
cd "D:\b tech\4 sem\Project Airport\Project"
```

### 2. Run the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py runserver
```

Backend will run at:

```text
http://127.0.0.1:8000
```

### 3. Run the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

### 4. Optional frontend API configuration

If the frontend is not served through the same origin as the backend, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Then restart the Vite dev server.

## Running AI Notebooks

Open the notebooks from:

```text
ai_models/notebooks/
```

Recommended order:

1. `01_Command_Center.ipynb`
2. `02_Flight_Operation.ipynb`
3. `03_Human_Resources.ipynb`
4. `04_Equipments.ipynb`
5. `05_Infrastructure.ipynb`
6. `06_AI_Engine.ipynb`
7. `07_Analytics.ipynb`
8. `08_Weather.ipynb`
9. `09_Notification.ipynb`

Install common notebook dependencies if needed:

```bash
pip install notebook pandas numpy matplotlib scikit-learn
jupyter notebook
```

## Expected Outcomes

- Reduced aircraft turnaround time
- Better usage of gates, staff, equipment, and runway capacity
- Faster response to operational disruptions
- Improved delay prediction and bottleneck prevention
- Better communication between airport teams
- Lower operational cost and improved passenger experience

## Development Notes

- The backend currently uses sample in-memory flight data and SQLite.
- The notebooks generate synthetic but realistic operational data for AI logic and dashboard payloads.
- Weather page supports demo data and can be configured with OpenWeatherMap API credentials from the UI.
- Existing AI notebook outputs can be connected to Django endpoints in a future integration step.

## Future Scope

- Persist live flight, equipment, staff, and alert data in database models
- Connect notebook logic to backend APIs
- Add authentication and role-based dashboards
- Integrate real airline, weather, and ground handling data feeds
- Add automated optimization jobs for gate, crew, and equipment assignment
- Export reports for airport operations managers
