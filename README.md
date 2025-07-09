# Assets Wallet

Assets Wallet is a compact **mono-repo** application that helps you track the value and performance of your private assets – stock shares, bank accounts, real estate, bonds, and more – through a clean, user-friendly interface.

## Features

1. **User-Friendly Dashboard**: The dashboard provides a clear overview of your assets, making it easy to track their
   performance.
2. **Advanced Analysis**: Calculate the profits and losses of your investments plus generate charts to visualize your
   financial data.
3. **User Updates**: Asset values and profits are updated by the user, ensuring full control over the data.
4. **Asset Groups**: Organize your assets into groups for better organization and analysis.
5. **Automation with GitHub Actions**: Utilize GitHub Actions for automating tasks like testing and deployment.
6. **Responsive Design**: The application is built with a responsive design to ensure a seamless experience on various
   devices.


---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Repository Layout](#repository-layout)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Available Scripts](#available-scripts)
7. [Database & Migrations](#database--migrations)
8. [Testing](#testing)
9. [Continuous Integration](#continuous-integration)
10. [License](#license)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | [Next.js](https://nextjs.org/) 14 (React 18) |
| **Backend / API** | [NestJS](https://nestjs.com/) 10 |
| **Database** | PostgreSQL (+ TypeORM) |
| **Languages** | TypeScript everywhere |
| **UI** | MUI 5 + React-ChartJS-2 |
| **Testing** | Playwright (E2E) • Jest (unit / integration) |
| **Deployment** | Vercel (CI + hosting) |

---

## Repository Layout

```
assets-wallet/
├── app/         # Next.js  frontend
│   ├── src/pages/
│   ├── src/components/
│   └── ...
├── api/         # NestJS backend
│   ├── src/auth/
│   ├── src/portfolio/
│   ├── src/migration/
│   └── ...
├── package.json # Yarn workspaces root
└── README.md
```

> The project is managed with **Yarn workspaces** – run all workspace commands from the repository root.

---

## Prerequisites

* **Node.js 18+** (or 20)
* **Yarn Classic**
* **PostgreSQL 14+** running locally or remotely

## Getting Started

```bash
# 1. Clone the repo
$ git clone git@github.com:bewon/nest-assets-wallet.git
$ cd nest-assets-wallet

# 2. Install all dependencies (root workspace)
$ yarn install

# 3. Create an .env file for the API (see values below)

# 3.1. Create an .env file for the Frontend (see values below)
$ echo "API_URL=http://localhost:3100" > app/.env # or create manually

# 4. Run DB migrations (creates the schema)
$ yarn workspace @assets-wallet/api typeorm migration:run

# 5. Start both servers in two terminals (or with tmux / pm2-monorepo)
# Frontend ➜ http://localhost:3000
$ yarn workspace @assets-wallet/app dev
# Backend  ➜ http://localhost:3100
$ yarn workspace @assets-wallet/api dev
```

---

## Environment Variables

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `API_URL` | `http://localhost:3100` | ✅ (Frontend) | Base URL for the NestJS API |
| `POSTGRES_HOST` | `localhost` | ✅ (Backend) | Database host |
| `POSTGRES_PORT` | `5432` | ❌ (defaults 5432) | Database port |
| `POSTGRES_USER` | `postgres` | ✅ (Backend) | DB user |
| `POSTGRES_PASSWORD` | `secret` | ✅ (Backend) | DB password |
| `POSTGRES_DATABASE` | `assets_wallet` | ✅ (Backend) | DB name |
| `JWT_SECRET` | `super_secret_key` | ✅ (Backend) | Secret used to sign JWT tokens |

Create this file at `api/.env` and `app/.env`.

---

## Available Scripts

Run any script with `yarn workspace <package> <script>`.

### Root
| Script | Purpose |
|--------|---------|
| `yarn install` | Install all dependencies via workspaces |

### Frontend (`app`)
| Script | Purpose |
|--------|---------|
| `dev` | Start Next.js in dev-mode (port 3000) |
| `build` | Build production bundle |
| `start` | Start the built app |
| `lint` | Run ESLint |
| `test` | Run Playwright end-to-end tests |

### Backend (`api`)
| Script | Purpose |
|--------|---------|
| `dev` | Start NestJS in watch-mode (port 3100) |
| `start` | Start compiled app (dist) |
| `build` | Compile TypeScript using Nest CLI |
| `lint` | Run ESLint (auto-fix) |
| `test` / `test:watch` / `test:cov` | Jest unit / watch / coverage |
| `typeorm` | Run arbitrary TypeORM CLI commands |
| `vercel-build` | Build + run migrations (used by Vercel) |

---

## Database & Migrations

TypeORM migrations live in `api/src/migration/`.

Common commands:

```bash
# Generate a new migration (example)
yarn workspace @assets-wallet/api typeorm migration:generate -n "AddUserTable"

# Run all pending migrations
yarn workspace @assets-wallet/api typeorm migration:run

# Revert the last migration
yarn workspace @assets-wallet/api typeorm migration:revert
```

> In production Vercel runs `yarn vercel-build` which builds the API and automatically executes pending migrations.

---

## Testing

### Frontend (Playwright)
```bash
# App must be running
yarn workspace @assets-wallet/app test
```

### Backend (Jest)
```bash
yarn workspace @assets-wallet/api test
```

---

## Continuous Integration

GitHub Actions run **linting**, **unit tests**, and **end-to-end tests** on every push & pull request to `main`. Successful checks trigger an automatic deployment to **Vercel**.

---

## License

Assets Wallet is released under the **GNU GPLv3** license. See the [LICENSE](LICENSE) file for full text.
