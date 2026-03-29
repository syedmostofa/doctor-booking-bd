# Doctor Booking BD

A Doctor Appointment Booking System for Bangladeshi patients.

---

## Backend Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Environment Configuration

1. Copy the example env file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:

   | Variable        | Description                                                  | Example                                              |
   |-----------------|--------------------------------------------------------------|------------------------------------------------------|
   | `DATABASE_URL`  | PostgreSQL connection string                                 | `postgresql://postgres:pass@localhost:5432/doctor_bd`|
   | `JWT_SECRET`    | Secret used to sign JWTs — use a long random string         | `openssl rand -hex 64`                               |
   | `PORT`          | Port the API server listens on                              | `5000`                                               |
   | `NODE_ENV`      | `development`, `production`, or `test`                      | `development`                                        |
   | `CLIENT_ORIGIN` | (Optional) Frontend URL allowed by CORS                     | `http://localhost:3000`                              |

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### API Base URL

All endpoints are mounted under `/api/v1`.

| Prefix                   | Description             |
|--------------------------|-------------------------|
| `/api/v1/auth`           | Registration & login    |
| `/api/v1/doctors`        | Doctor profiles         |
| `/api/v1/slots`          | Doctor time slots       |
| `/api/v1/appointments`   | Appointment booking     |

### Health Check

```
GET /health
```
