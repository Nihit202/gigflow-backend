# GigFlow Backend — Smart Leads Dashboard API

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)

A production-grade REST API for the GigFlow lead management dashboard. Built with Node.js, Express, TypeScript, and MongoDB.

---

## Live Demo

> 🚀 API Base URL: `https://gigflow-api.onrender.com`
> 
> Health Check: `https://gigflow-api.onrender.com/health`

---

## Features

- 🔐 **JWT Authentication** — access + refresh token strategy
- 🔒 **Password Hashing** — bcrypt with configurable salt rounds
- 👥 **Role-Based Access Control** — Admin and Sales roles
- 📋 **Lead CRUD** — full create, read, update, delete
- 🔍 **Advanced Filtering** — filter by status, source, search by name/email
- 📄 **Backend Pagination** — skip/limit with full metadata
- 📊 **Pipeline Stats** — aggregated lead stats by status and source
- 📥 **CSV Export** — download all leads as CSV
- 🛡️ **Security** — helmet, CORS, rate limiting
- 📝 **Request Validation** — express-validator on all routes
- 🐳 **Docker Ready** — Dockerfile included

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js 4.18 |
| Language | TypeScript 5.3 (strict) |
| Database | MongoDB + Mongoose 8 |
| Auth | JSON Web Tokens (JWT) |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |
| Logging | winston + morgan |
| Containerization | Docker |

---

## Project Structure

```
gigflow-backend/
├── src/
│   ├── config/
│   │   ├── index.ts          # Environment config
│   │   └── database.ts       # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── lead.controller.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT authenticate + authorize
│   │   ├── errorHandler.ts   # Global error handler
│   │   └── validate.ts       # Validation error formatter
│   ├── models/
│   │   ├── User.ts           # User model with bcrypt hook
│   │   └── Lead.ts           # Lead model with indexes
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── lead.routes.ts
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces
│   ├── utils/
│   │   ├── jwt.ts            # Token generation/verification
│   │   ├── logger.ts         # Winston logger
│   │   └── response.ts       # Standardized API responses
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   └── lead.validator.ts
│   ├── app.ts                # Express app setup
│   └── index.ts              # Server entry point
├── seed.js                   # Database seeder (22 sample leads)
├── .env.example
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## Setup Instructions

### Prerequisites

- Node.js v20+
- MongoDB (local or Atlas)
- npm v10+

### 1. Clone the repository

```bash
git clone https://github.com/Nihit202/gigflow-backend.git
cd gigflow-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-different-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
BCRYPT_SALT_ROUNDS=12
```

Generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Seed sample data (optional)

```bash
node seed.js
```

This creates **3 users** and **22 leads** across all statuses. Login credentials will be printed in the terminal.

### 5. Start development server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

### 6. Build for production

```bash
npm run build
npm start
```

---

## Docker

```bash
# Build image
docker build -t gigflow-backend .

# Run container
docker run -p 5000:5000 --env-file .env gigflow-backend
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Standard Response Format

All endpoints return this structure:

```json
{
  "success": true,
  "message": "Description of result",
  "data": {},
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

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

### Authentication Routes

#### POST `/api/auth/register`

Register a new user.

**Request Body:**
```json
{
  "name": "Arjun Mehta",
  "email": "arjun@company.com",
  "password": "SecurePass@123",
  "role": "sales"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| name | string | ✅ | 2–50 characters |
| email | string | ✅ | valid email |
| password | string | ✅ | min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| role | string | ❌ | `admin` or `sales` (default: `sales`) |

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Arjun Mehta",
      "email": "arjun@company.com",
      "role": "sales"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST `/api/auth/login`

Login with existing credentials.

**Request Body:**
```json
{
  "email": "arjun@company.com",
  "password": "SecurePass@123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "Arjun Mehta", "email": "...", "role": "sales" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### POST `/api/auth/refresh-token`

Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

#### GET `/api/auth/me`

Get current authenticated user. Requires `Authorization: Bearer <token>` header.

**Response `200`:**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Arjun Mehta",
    "email": "arjun@company.com",
    "role": "sales",
    "isActive": true,
    "createdAt": "2025-04-01T08:00:00.000Z"
  }
}
```

---

### Lead Routes

All lead routes require `Authorization: Bearer <accessToken>` header.

---

#### GET `/api/leads`

Get paginated list of leads with optional filters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|---|---|---|---|
| status | string | Filter by status | `New`, `Contacted`, `Qualified`, `Lost` |
| source | string | Filter by source | `Website`, `Instagram`, `Referral` |
| search | string | Search name or email | `rahul` |
| sort | string | Sort order | `latest` (default) or `oldest` |
| page | number | Page number | `1` |
| limit | number | Records per page (max 100) | `10` |

**Example Request:**
```
GET /api/leads?status=Qualified&source=Website&search=rahul&sort=latest&page=1&limit=10
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Rahul Verma",
      "email": "rahul.verma@fintech.in",
      "status": "Qualified",
      "source": "Website",
      "notes": "Budget confirmed. Proposal sent.",
      "createdBy": { "name": "Arjun Mehta", "email": "arjun@company.com" },
      "createdAt": "2025-04-01T08:30:00.000Z",
      "updatedAt": "2025-04-05T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

> **RBAC Note:** Admin users see all leads. Sales users see only leads they created.

---

#### GET `/api/leads/:id`

Get a single lead by ID.

**Response `200`:**
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Rahul Verma",
    "email": "rahul.verma@fintech.in",
    "status": "Qualified",
    "source": "Website",
    "notes": "Budget confirmed.",
    "createdBy": { "name": "Arjun Mehta", "email": "arjun@company.com" },
    "createdAt": "2025-04-01T08:30:00.000Z"
  }
}
```

**Response `404`:**
```json
{ "success": false, "message": "Lead not found" }
```

---

#### POST `/api/leads`

Create a new lead.

**Request Body:**
```json
{
  "name": "Sneha Kapoor",
  "email": "sneha@designstudio.com",
  "status": "New",
  "source": "Instagram",
  "notes": "Interested in enterprise plan"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| name | string | ✅ | 2–100 characters |
| email | string | ✅ | valid email |
| status | string | ❌ | `New`, `Contacted`, `Qualified`, `Lost` (default: `New`) |
| source | string | ✅ | `Website`, `Instagram`, `Referral` |
| notes | string | ❌ | max 1000 characters |

**Response `201`:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": { "_id": "...", "name": "Sneha Kapoor", ... }
}
```

---

#### PATCH `/api/leads/:id`

Update an existing lead (partial update supported).

**Request Body** (all fields optional):
```json
{
  "status": "Contacted",
  "notes": "Had intro call. Following up next week."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Lead updated",
  "data": { "_id": "...", "status": "Contacted", ... }
}
```

---

#### DELETE `/api/leads/:id`

Delete a lead.

**Response `200`:**
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": null
}
```

---

#### GET `/api/leads/stats`

Get pipeline statistics aggregated by status and source.

**Response `200`:**
```json
{
  "success": true,
  "message": "Stats retrieved",
  "data": {
    "overview": {
      "total": 22,
      "byStatus": {
        "New": 6,
        "Contacted": 6,
        "Qualified": 5,
        "Lost": 5
      }
    },
    "bySource": [
      { "_id": "Website", "count": 8 },
      { "_id": "Instagram", "count": 7 },
      { "_id": "Referral", "count": 7 }
    ]
  }
}
```

---

#### GET `/api/leads/export`

Download all leads as a CSV file.

**Response:** CSV file download with headers:
```
Name, Email, Status, Source, Notes, Created By, Created At
```

---

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role permissions |
| `404` | Not Found |
| `409` | Conflict — duplicate resource |
| `429` | Too Many Requests — rate limit hit |
| `500` | Internal Server Error |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | ❌ | `5000` | Server port |
| `NODE_ENV` | ❌ | `development` | Environment |
| `MONGODB_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Access token secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ | — | Refresh token secret (min 32 chars) |
| `JWT_EXPIRES_IN` | ❌ | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | `7d` | Refresh token TTL |
| `CORS_ORIGIN` | ❌ | `http://localhost:3000` | Allowed frontend origin |
| `BCRYPT_SALT_ROUNDS` | ❌ | `12` | Bcrypt cost factor |

---

## Deployment

This API is deployed on [Render](https://render.com).

**Steps to deploy your own instance:**
1. Push this repo to GitHub
2. Create a Web Service on Render → connect this repo
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add all environment variables from `.env.example`
6. Use [MongoDB Atlas](https://cloud.mongodb.com) for the database

---

## Frontend Repository

👉 [gigflow-frontend](https://github.com/Nihit202/gigflow-frontend)

---

## Author

**Nihit Varshney**  
nihitvarshneyofficial@gmail.com
