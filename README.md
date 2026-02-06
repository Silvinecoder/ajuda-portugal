# Help Portugal

Web app to connect people in need with volunteers in Portugal. Uses React + TypeScript in the frontend, Node.js + Express + TypeScript in the backend, PostgreSQL in Docker, and OpenStreetMap for the map.

## Requirements

- Node.js 18+
- Docker and Docker Compose

## Setup
### 1. Database via docker

```bash
docker compose up -d
```

### 2. Backend via prisma

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend react

```bash
cd frontend
npm install
npm run dev
```

### 4. Access locally

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Scripts

```bash
npm run docker:up    # start the db
npm run dev         # start the frontend and backend in parallel
```

## Functionalities
### Person in need
- Sees the map with coloured pins to signify the urgency.
- Asks for help: Shows a form with urgency, category, description, location and WhatsApp contact
- After publishing: A generated unique link appears to modify the request
- Request expires in 14 days

### Volunteer
- Sees map with urgency filters
- Clicks on the pin: card show details of help required
- Offer help: opens WhatsApp with pre-filled message of how the user can help
- Report weird help requests
