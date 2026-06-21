# Task-Manager
I have successfully built and verified the Simple Task Manager web application. Here is a summary of what was accomplished, how the application is structured, and how you can run and verify it.

Key Features Built
Add a Task: Click "+ Add Task" to open an overlay modal where you can enter a Title, Description (optional), and initial Status.
View All Tasks: Tasks are automatically fetched from the FastAPI backend and rendered in a clean Kanban-style layout across three columns: "To Do", "In Progress", and "Done".
Update Task Status: Change a task's status directly from the dropdown inside its card. The card immediately moves to the corresponding column.
Edit Task Details: Click the Edit (pencil) icon on any task card to modify its title, description, or status in a dedicated modal.
Delete Task: Click the Delete (trash) icon to remove a task from the system (with a confirmation prompt).
Storage: All tasks are persisted in a global supabase database.
Styling: Built using Next.js 16 with Tailwind CSS and shadcn/ui components with a dark-mode theme.

Application Structure:
The project is cleanly split into frontend and backend directories:

1. Backend (FastAPI)
   database.py: Initializes the SQLAlchemy SQLite database engine and session.
   models.py: Defines the SQLAlchemy schema for the tasks table.
   schemas.py: Pydantic models for request validation and response formatting.
   crud.py: Contains SQL query helpers for creating, reading, updating, and deleting tasks.
   main.py: Sets up the FastAPI application, initializes database tables, handles CORS, and exposes the REST API endpoints.
   
2. Frontend (Next.js)
   next.config.ts
   : Configured to proxy client /api/\* requests to the backend server.
   src/app/layout.tsx
   : Enables the global dark-mode theme (dark class on html element).
   src/app/page.tsx
   : Main client dashboard featuring the Kanban columns, state management, modal forms, and CRUD actions.
   src/components/ui/
   : Tailwind CSS styled shadcn/ui components (button.tsx, card.tsx, dialog.tsx, input.tsx, select.tsx, textarea.tsx).
   Verification & Testing
   How to Run Locally
   Both servers have been launched and are running. To check them or start them manually later:

Start the FastAPI Backend:
cd backend
.venv\Scripts\activate
python -m uvicorn main:app --reload
The backend will run on http://127.0.0.1:8000. You can visit http://127.0.0.1:8000/docs to test endpoints via Swagger UI.

Start the Next.js Frontend:
cd frontend
npm run dev
The frontend will run on http://localhost:3000.

Completed Validation Tests
Backend Build & Compile: Confirmed Uvicorn runs backend with no syntax errors. Checked that DB tables initialize and endpoints respond with data.
Frontend Build & Compile: Ran npm run build which compiled successfully with TypeScript checks.
Proxy Rewrites: Verified frontend proxies calls correctly.
Dark Mode: Integrated build in next.js dark themes for components.
