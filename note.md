# ERP-HR Codebase Overview

## What Has Been Done

- **Backend (Django + DRF):**
  - HRMS app with models for Employee, Department, Position, Attendance, LeaveRequest, LeaveType, Performance.
  - API endpoints for CRUD operations on all models.
  - JWT authentication (SimpleJWT) with extended token lifetime.
  - CORS configured for local frontend development.
  - Employee creation supports nested user creation (username, password, email, first/last name).
  - Leave requests are created by employees and can be approved/rejected by managers.
  - Dashboard stats endpoint for HR overview.
  - **Role-based access:**
    - `role` field added to Employee model (manager/employee).
    - Custom DRF permissions (`IsManager`, `IsEmployee`) restrict API access.
    - `/api/employees/me/` endpoint returns current user's employee profile and role.

  - **Frontend (React + Vite):**
    - Sidebar navigation uses React Router links for each main section (Dashboard, Employees, Attendance, Leave, Performance).
    - Nested routing: All main content pages are routed via ERPHRSystem, allowing deep linking and browser navigation.
    - Employee detail page accessible via `/employees/:id`, only editable by managers.
    - JWT login flow with protected routes and redirect after login.
    - Employee creation modal with all required fields, including user info, department/position selection, and validation.
    - Fetches department and position lists from backend for dropdowns.
    - All main features are manager/admin-oriented (CRUD, approval, stats).
    - **Role-based access:**
      - AuthContext fetches current user and role after login.
      - PrivateRoute component restricts access to routes based on role.

## Login Flow

1. User enters username and password in the frontend login form.
2. Frontend sends POST request to `/api/token/` (JWT endpoint).
3. Backend returns JWT access token.
4. Frontend stores the token and uses it for authenticated requests.
5. Frontend calls `/api/employees/me/` to fetch current user's employee profile and role.
6. Role is used to control access to features and routes in the frontend.






  - **Role-Based UI:**
    - Add employee self-service features (view own info, request leave, view attendance).
    - Further restrict/enable features in frontend based on role.

  - **Leave Request Improvements:**
    - Allow employees to create leave requests from frontend.
    - Add manager selection for approval workflow.

  - **UI/UX Enhancements:**
    - Improve error handling and validation in forms.
    - Add notifications for actions (success, error, approval).
    - Enhance dashboard with more analytics and charts.
    - Improve navigation and route protection for all pages.

  - **Testing & Security:**
    - Add unit and integration tests for backend and frontend.
    - Harden authentication and permissions (e.g., password rules, API rate limiting).

  - **Deployment:**
    - Prepare for production deployment (env config, static files, HTTPS, etc.).

---

This note summarizes the current state, login flow, and next steps for the ERP-HR system. For details or implementation help, see the code or ask for specific guidance.
