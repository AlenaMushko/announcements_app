# Announcements API

JSON REST API for an announcements board: JWT auth, announcement CRUD with optional photo upload (Cloudinary), ownership checks, security middleware, structured logging, and Vitest tests.

## Features

- **Auth:** register, login, refresh (token rotation), logout, me
- **Announcements:** list with pagination / search / sorting, get by id, create / update / delete
- **Photo upload:** `multipart/form-data` via Multer → temporary `uploads/` → Cloudinary; only `imageUrl` is stored in DB (optional)
- **Security:** Helmet, CORS (`ALLOWED_ORIGINS`), rate limiting on auth routes (10 req / 15 min per IP)
- **Logging:** Pino + `pino-http` for requests; domain events in controllers
- Public GET endpoints; create / update / delete require authentication
- Access token: 15 minutes; refresh token: 7 days (stored in DB)
- Tokens returned in JSON and optionally set as HttpOnly cookies
- Interactive docs: Swagger UI at `/api-docs`

## Tech stack

| Layer | Stack |
|-------|-------|
| Runtime | Node.js (≥20), TypeScript (ESM), `tsx` |
| HTTP | Express 5 |
| Database | PostgreSQL + Prisma 7 |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken`), bcrypt, cookie-parser |
| Security | Helmet, CORS, `express-rate-limit` |
| Logging | Pino, `pino-http`, `pino-pretty` |
| Uploads | Multer, Cloudinary |
| Docs | `@asteasolutions/zod-to-openapi`, swagger-ui-express |
| Tests | Vitest, Supertest, `@vitest/coverage-v8` |
| Infra | Docker, Docker Compose |

## Prerequisites

- Node.js **≥ 20**
- npm
- Docker & Docker Compose (for Postgres / full stack)
- A [Cloudinary](https://cloudinary.com/) account (for image uploads)

## Environment

Copy the example file and fill in real values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres URL for local API |
| `DATABASE_URL_DOCKER` | Postgres URL used by the app container |
| `TEST_DATABASE_URL` | Separate DB for tests |
| `JWT_SECRET` | At least 32 characters, not a placeholder |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Do **not** commit `.env`. Keep secrets only in local / CI secrets.

### Cloudinary setup

1. Sign up at [cloudinary.com](https://cloudinary.com/) and open the dashboard.
2. Copy **Cloud name**, **API Key**, and **API Secret**.
3. Put them into `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Images are uploaded to the `announcements` folder. The API stores only the returned `secure_url` in `Announcement.imageUrl`.

## Quick start (local API + Docker Postgres)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Set DB password, `JWT_SECRET`, Cloudinary credentials, and `ALLOWED_ORIGINS`.

### 3. Start Postgres

```bash
npm run docker:up
```

This starts only the `postgres` service from `docker-compose.yml`.

### 4. Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

(If migrations are already applied, Prisma reports that the schema is in sync.)

### 5. Run the API

```bash
npm run dev
```

| URL | Description |
|-----|-------------|
| [http://localhost:3000](http://localhost:3000) | API |
| [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | Swagger UI |

## Docker Compose (full stack)

Run API + Postgres in containers:

```bash
cp .env.example .env   # if not done yet
npm run docker:up:app
```

Useful Compose commands:

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Postgres only |
| `npm run docker:up:app` | Build & run app + Postgres |
| `npm run docker:down` | Stop and remove containers |
| `npm run docker:logs` | Follow container logs |

The app container uses `DATABASE_URL_DOCKER` to reach the `postgres` service on the Compose network. Temporary uploads are mounted at `./uploads`.

## Testing

Tests use Vitest + Supertest against a **separate** database (`TEST_DATABASE_URL`).

### 1. Prepare the test database

With Postgres running (`npm run docker:up`), create the test DB once (name must match `TEST_DATABASE_URL`, e.g. `mydb_test`):

```bash
docker compose exec postgres \
  psql -U johndoe -d mydb -c "CREATE DATABASE mydb_test;"
```

Apply migrations to the test DB:

```bash
npm run db:migrate:test
```

### 2. Run tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

### 3. Coverage

```bash
npm run test:coverage
```

HTML report: `coverage/index.html`.

## Useful commands

| Command | Description |
|---------|-------------|
| `npm run dev` | API with hot-reload |
| `npm start` | API without watch |
| `npm test` | Run tests once |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Tests + coverage report |
| `npm run db:migrate:test` | Migrate `TEST_DATABASE_URL` |
| `npm run docker:up` | Postgres only |
| `npm run docker:up:app` | App + Postgres in Docker |
| `npm run docker:down` | Stop Compose |
| `npm run docker:logs` | Container logs |
| `npm run prisma:migrate` | Dev migrations |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Project structure

```
announcements_app/
├── app.ts
├── db.ts
├── index.ts
├── vitest.config.ts
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── uploads/                    # temp Multer files (.gitkeep; contents ignored)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── migrate-test.ts
├── tests/
│   ├── setup.ts
│   ├── helpers/
│   ├── routes/
│   └── validators/
└── src/
    ├── config/                 # env + Cloudinary
    ├── constants/
    ├── controllers/
    ├── docs/                   # OpenAPI + Swagger
    ├── logger.ts               # shared Pino logger
    ├── middlewares/            # auth, validate, upload, rate limit, errors
    ├── repositories/
    ├── routes/
    ├── services/               # auth, announcements, tokens, Cloudinary
    ├── utils/
    └── validations/
```

## Main endpoints

### Auth

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/auth/register` | no | Rate limited |
| POST | `/auth/login` | no | Rate limited |
| POST | `/auth/refresh` | no | Refresh token in body or cookie |
| POST | `/auth/logout` | Bearer | |
| GET | `/auth/me` | Bearer | |

Auth routes: max **10 requests / 15 minutes** per IP → `429` with `Too many requests, please try again later`.

### Announcements

| Method | Path | Auth | Body |
|--------|------|------|------|
| GET | `/announcements` | no | Query: `page`, `search`, `sort` |
| GET | `/announcements/:id` | no | |
| POST | `/announcements` | Bearer | `multipart/form-data` (optional `image`) |
| PATCH | `/announcements/:id` | Bearer + ownership | `multipart/form-data` (optional `image`) |
| DELETE | `/announcements/:id` | Bearer + ownership | |

Protected requests:

```http
Authorization: Bearer <accessToken>
```

Create / update with a photo (field name: `image`):

```bash
curl -X POST http://localhost:3000/announcements \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=Продам велосипед" \
  -F "description=Trek у відмінному стані" \
  -F "price=8500" \
  -F "category=sale" \
  -F "image=@./bike.jpg"
```

Without a file, `imageUrl` is stored as `null`.

## Notes

- Passwords are stored only as bcrypt hashes; `password` is never returned in responses.
- Updating / deleting someone else's announcement returns `403` (`Access denied`).
- List pagination is fixed at **10** items per page.
- `imageUrl` is set only from Cloudinary after file upload — not from a client-provided URL in the body.
- Local Multer files under `uploads/` are deleted after Cloudinary upload (or on request errors).
- CORS allows only origins listed in `ALLOWED_ORIGINS`.
