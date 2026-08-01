# AI Club Meeting Management System

An AI-powered, production-grade application for managing college club meetings, automating RSVP tracking, generating minutes via Google Gemini, and handling attendance.

## Tech Stack
* **Frontend**: React, Vite, Tailwind CSS, React Query
* **Backend**: Node.js, Express, Prisma ORM, JWT
* **Database**: Supabase PostgreSQL (or any Dockerized Postgres)
* **Cloud Storage**: Supabase Storage (for documents, images, and reports)
* **AI Engine**: Google Gemini Flash/Pro

## Deployment Architecture

The application is containerized and ready for scalable production deployment.
- `docker-compose.yml` provides a unified local deployment stack (Postgres + Node Server + Nginx Frontend).
- Designed for serverless platforms like Vercel (Client) and Railway/Render (Server).

## Quick Start (Docker)
1. Provide a `.env` in the `server` directory (see `.env.example`).
2. Generate a Google App Password for your Gmail account and set `EMAIL_USER` and `EMAIL_PASS` in your `.env`.
3. Run `docker-compose up -d --build`.
4. Open `http://localhost:80` for the UI.
5. API is running on `http://localhost:5000/api`.
6. Swagger API Docs available at `http://localhost:5000/api-docs`.

## Manual Setup

### 1. Database (PostgreSQL)
Start your Postgres instance and ensure `DATABASE_URL` is set in `server/.env`.
```bash
cd server
npx prisma generate
npx prisma db push
```

### 2. Backend
```bash
cd server
npm install
npm run dev
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
```

## Production Security Measures
- Winston & Morgan request logging
- Helmet HTTP headers protection
- Global API Rate Limiter
- Standardized `{ success, data, error }` API response interceptors
- Strict Joi environment variable schema validation
