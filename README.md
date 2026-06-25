# TaskHub

A full-stack task management application built with .NET 10 Web API and Angular 21.

## Tech Stack

**Backend**
- .NET 10 Web API
- Entity Framework Core 10 (Code First)
- MSSQL / SQL Server Express
- Basic Authentication with BCrypt password hashing
- Serilog for structured logging
- Clean Architecture (Domain, Application, Infrastructure, API layers)

**Frontend**
- Angular 21 (Standalone Components)
- Angular Signals for state management
- Reactive Forms
- TailwindCSS

## Features

- User registration and login
- Create, edit, delete, and complete tasks
- Filter tasks by category and completion status
- Sort tasks by title or date
- Pagination
- Side-by-side task list and detail/form view
- Soft delete (tasks are archived, not permanently removed)

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 18+
- SQL Server or SQL Server Express

### Backend
1. Update the connection string in `TaskHub_BE/TaskHub.Api/appsettings.json`
2. Run the API:
```bash
   cd TaskHub_BE
   dotnet run --project TaskHub.Api --launch-profile https
```
3. The database is created automatically on first run
4. Swagger UI available at `https://localhost:7182/swagger`

### Frontend
1. Install dependencies and start the dev server:
```bash
   cd TaskHub_FE
   npm install
   ng serve
```
2. Open `http://localhost:4200`
3. Ensure the backend is running on `https://localhost:7182`
   - If the port differs, update `TaskHub_FE/src/environments/environment.ts`

## Default Credentials
| Username | Password |
|---|---|
| admin | admin123 |

## Database
Schema reference is provided in `Database-Script.sql`.
The application creates and migrates the database automatically on first run.
