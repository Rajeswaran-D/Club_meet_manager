# ClubMeet - Meeting Management System

ClubMeet is a robust, production-ready application engineered for managing organization meetings, automating RSVP tracking, generating minutes, and handling bulk attendance.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, React Query
- **Backend**: Node.js, Express, Prisma ORM, JWT Authentication
- **Database**: PostgreSQL (via Supabase or local Docker)
- **Storage**: Supabase Storage
- **Integrations**: Nodemailer (SMTP), Google Gemini API (Automated Drafting)

## System Architecture

The application is structured into a decoupled Client (SPA) and Server (RESTful API), designed for horizontal scalability and containerized environments.
- **Client**: Hosted on Vercel or any static file server (Nginx config provided).
- **Server**: Hosted on Railway or Render, utilizing Helmet, Morgan logging, and robust Rate Limiting for security.
- **Data Persistence**: Prisma ORM ensures strongly typed schema definitions and safe migrations against PostgreSQL.

## Environment Configuration

A complete `.env.example` is provided in both the `/client` and `/server` directories.
To run the platform, you must configure:
- `DATABASE_URL`: Connection string for PostgreSQL.
- `JWT_SECRET`: Secure signing key for session tokens.
- `SUPABASE_URL` / `SUPABASE_KEY`: Credentials for file uploads.
- `GEMINI_API_KEY`: Required for automated report drafting.
- `EMAIL_USER` / `EMAIL_PASS`: SMTP credentials for dispatching invites.

## Local Development (Docker)

The fastest way to run ClubMeet locally is via Docker Compose, which builds the API, the Client, and spins up a local PostgreSQL instance.

```bash
git clone https://github.com/organization/clubmeet.git
cd clubmeet

# Configure environment variables in /server/.env
cp server/.env.example server/.env

# Spin up the containers
docker-compose up -d --build
```
- **Web UI**: `http://localhost:80`
- **API Base**: `http://localhost:5000/api`
- **Swagger Docs**: `http://localhost:5000/api-docs`

## Local Development (Native)

If you prefer to run the components natively for faster hot-reloading:

### 1. Database
Start a local PostgreSQL instance or connect to Supabase.
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

## Security & Reliability
- **HTTP Security**: Protected by `helmet`.
- **CORS Policies**: Strict cross-origin settings.
- **Rate Limiting**: Protects against brute force attacks.
- **Data Integrity**: Prisma transactions protect against partial data writes during member import.
- **Global Error Handling**: Prevents stack traces from leaking to the client.

## License
MIT License
