# GigFlow Backend — Smart Leads API

Node.js + Express + TypeScript + MongoDB REST API for the GigFlow leads dashboard.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript (strict)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access + refresh tokens)
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit, bcryptjs
- **Logging**: winston + morgan

## Project Structure

```
src/
├── config/          # env config, DB connection
├── controllers/     # route handlers (auth, leads)
├── middleware/      # auth, error handler, validator
├── models/          # Mongoose models (User, Lead)
├── routes/          # Express routers
├── types/           # TypeScript interfaces & types
├── utils/           # jwt helpers, response helpers, logger
└── validators/      # express-validator chains
```

## Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Dev server (hot reload)
npm run dev

# Production build
npm run build
npm start
```

## Environment Variables

| Variable              | Description                       | Default      |
|-----------------------|-----------------------------------|--------------|
| `PORT`                | Server port                       | `5000`       |
| `NODE_ENV`            | Environment                       | `development`|
| `MONGODB_URI`         | MongoDB connection string         | required     |
| `JWT_SECRET`          | Access token secret (≥32 chars)   | required     |
| `JWT_REFRESH_SECRET`  | Refresh token secret (≥32 chars)  | required     |
| `JWT_EXPIRES_IN`      | Access token TTL                  | `15m`        |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL              | `7d`         |
| `CORS_ORIGIN`         | Allowed frontend origin           | `http://localhost:3000` |
| `BCRYPT_SALT_ROUNDS`  | Bcrypt cost factor                | `12`         |

## API Endpoints

### Auth — `/api/auth`
| Method | Path             | Auth | Description        |
|--------|------------------|------|--------------------|
| POST   | `/register`      | ✗    | Register user      |
| POST   | `/login`         | ✗    | Login              |
| POST   | `/refresh-token` | ✗    | Refresh tokens     |
| GET    | `/me`            | ✓    | Get current user   |

### Leads — `/api/leads`
| Method | Path          | Auth | Role       | Description          |
|--------|---------------|------|------------|----------------------|
| GET    | `/`           | ✓    | any        | List leads (filtered, paginated) |
| GET    | `/:id`        | ✓    | any        | Get single lead      |
| POST   | `/`           | ✓    | any        | Create lead          |
| PATCH  | `/:id`        | ✓    | any        | Update lead          |
| DELETE | `/:id`        | ✓    | any        | Delete lead          |
| GET    | `/stats`      | ✓    | any        | Pipeline stats       |
| GET    | `/export`     | ✓    | any        | Export CSV           |

### Query Parameters (GET `/api/leads`)

| Param    | Type                              | Description          |
|----------|-----------------------------------|----------------------|
| `status` | `New\|Contacted\|Qualified\|Lost` | Filter by status     |
| `source` | `Website\|Instagram\|Referral`    | Filter by source     |
| `search` | string                            | Name or email search |
| `sort`   | `latest\|oldest`                  | Sort order           |
| `page`   | number (≥1)                       | Page number          |
| `limit`  | number (1–100)                    | Records per page     |

### Response Format

```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [...],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Docker

```bash
# Build image
docker build -t gigflow-backend .

# Run container
docker run -p 5000:5000 --env-file .env gigflow-backend
```

## Deployment (Render)

1. Create a **Web Service** on Render pointing to this repo
2. Set **Build Command**: `npm install && npm run build`
3. Set **Start Command**: `npm start`
4. Add all environment variables from `.env.example` in the Render dashboard
5. Add a **MongoDB** instance (MongoDB Atlas free tier recommended)
