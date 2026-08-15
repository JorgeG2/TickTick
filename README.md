# Apex — Personal Productivity Dashboard

A full-stack monolithic productivity dashboard with task management, multi-calendar views, rich notes, canvas drawing, habit/health tracking, AI study planning, ambient audio, and e-ink display integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | .NET 8 Web API (Controllers, DI, EF Core) |
| Database | SQL Server (LocalDB) |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + Shadcn UI primitives |
| Rich Text | @blocknote/react |
| Canvas | @excalidraw/excalidraw |
| Background Jobs | IHostedService (CronWorkerService) |

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- SQL Server LocalDB (included with Visual Studio / SQL Express)

## Getting Started

### 1. Backend

```bash
cd backend
dotnet tool install --global dotnet-ef --version 8.0.11
dotnet ef database update
dotnet run
```

API runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` (proxies `/api` to backend).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (optional `?categoryId=`) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}/toggle` | Toggle completion |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/calendar/{date}` | Get calendar entry |
| PUT | `/api/calendar/{date}` | Save notes/canvas |
| POST | `/api/ai/generate-plan` | AI study plan generation |
| POST | `/api/health/webhook` | Upsert health data |
| GET | `/api/e-ink/today` | E-ink HTML display |
| GET | `/api/categories` | List categories |
| GET | `/api/shopping` | Shopping list |
| GET | `/api/user` | User account + streak |

## Configuration

Edit `backend/appsettings.json`:

- **ConnectionStrings:DefaultConnection** — SQL Server connection
- **OpenAI:ApiKey** — For AI study planner (falls back to rule-based plan)
- **Email / SendGrid** — For due-task notification emails

## E-Ink Display

Open `http://localhost:5000/api/e-ink/today` on any e-ink device. Pure HTML, no JS dependencies, auto-refreshes every 15 minutes.

## Project Structure

```
├── backend/
│   ├── Controllers/     # REST API controllers
│   ├── Data/            # DbContext, seeder, migrations
│   ├── Models/          # EF Core entities
│   ├── Services/        # Business logic + background worker
│   └── DTOs/            # Request/response records
├── frontend/
│   └── src/
│       ├── components/  # UI components by feature
│       ├── pages/       # Route pages
│       └── lib/         # API client + utilities
└── Apex.sln
```
