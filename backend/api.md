# ERP-HR Backend API Summary

This document summarizes all API endpoints, request types, payloads, permissions, and responses for the ERP-HR backend (Django REST Framework).

---

## Authentication
- All endpoints require authentication (`IsAuthenticated`).
- Role-based permissions:
  - `IsManagerOrReadOnly`: Only managers can create/update/delete; others can read.
  - `IsEmployee`: Only employees can perform certain actions (e.g., request leave).

---

## Endpoints & ViewSets

### Employees
- **Endpoint:** `/employees/`
- **ViewSet:** `EmployeeViewSet`
- **Methods:**
  - `GET /employees/` — List all employees (Manager or ReadOnly)
  - `POST /employees/` — Create employee (Manager only)
  - `GET /employees/{id}/` — Retrieve employee
  - `PUT/PATCH /employees/{id}/` — Update employee (Manager only)
  - `DELETE /employees/{id}/` — Delete employee (Manager only)
  - `GET /employees/me/` — Get current user's employee profile
  - `GET /employees/dashboard_stats/` — Get dashboard stats (active employees, departments, recent hires, pending leaves)
- **Payload:**
  - Nested `user` object for creation/update
  - Partial updates allowed; only include fields to update
- **Permissions:** `IsAuthenticated`, `IsManagerOrReadOnly`
- **Response:** Employee data (with nested user info)

### Departments
- **Endpoint:** `/departments/`
- **ViewSet:** `DepartmentViewSet`
- **Methods:** CRUD
- **Permissions:** `IsAuthenticated`, `IsManagerOrReadOnly`
- **Response:** Department data

### Positions
- **Endpoint:** `/positions/`
- **ViewSet:** `PositionViewSet`
- **Methods:** CRUD
- **Permissions:** `IsAuthenticated`, `IsManagerOrReadOnly`
- **Response:** Position data (includes department name)

### Attendance
- **Endpoint:** `/attendance/`
- **ViewSet:** `AttendanceViewSet`
- **Methods:** CRUD
- **Extra:** `GET /attendance/today/` — Get today's attendance records
- **Permissions:** Default (no custom permission)
- **Response:** Attendance data (includes employee name)

### Leave Types
- **Endpoint:** `/leave-types/`
- **ViewSet:** `LeaveTypeViewSet`
- **Methods:** CRUD
- **Permissions:** `IsAuthenticated`, `IsManagerOrReadOnly`
- **Response:** Leave type data

### Leave Requests
- **Endpoint:** `/leave-requests/`
- **ViewSet:** `LeaveRequestViewSet`
- **Methods:** CRUD
- **Custom Actions:**
  - `POST /leave-requests/{id}/approve/` — Approve leave (Manager only)
  - `POST /leave-requests/{id}/reject/` — Reject leave (Manager only)
- **Permissions:**
  - `create`: `IsAuthenticated`, `IsEmployee` (employees request leave)
  - `approve/reject`: `IsAuthenticated`, `IsManagerOrReadOnly` (managers approve/reject)
  - `list/retrieve`: `IsAuthenticated`
- **Payload:**
  - Employee, leave type, dates, status
  - Validation: `end_date` must be after `start_date`
- **Response:** Leave request data (includes employee, leave type, approved by names)

### Performance
- **Endpoint:** `/performances/`
- **ViewSet:** `PerformanceViewSet`
- **Methods:** CRUD
- **Permissions:** Default (no custom permission)
- **Response:** Performance data (includes employee and reviewer names)

---

## Permissions Summary
- **IsManagerOrReadOnly:**
  - Managers: Can create, update, delete
  - Others: Read-only
- **IsEmployee:**
  - Employees: Can perform employee-specific actions (e.g., request leave)

---

## Payload Examples

### Employee Creation
```json
{
  "user": {
    "username": "jdoe",
    "password": "secret",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "department": 1,
  "position": 2,
  "manager": 3,
  "salary": 50000,
  "status": "active"
}
```

### Employee Update (Partial)
```json
{
  "salary": 55000,
  "status": "active"
}
```

### Leave Request
```json
{
  "employee": 1,
  "leave_type": 2,
  "start_date": "2025-09-25",
  "end_date": "2025-09-30",
  "reason": "Vacation"
}
```

---

## API Responses
- **Success:** Returns serialized object data
- **Error:** Returns validation errors (e.g., missing required fields, invalid dates)

---

## Router Summary
- All endpoints are registered via DRF router in `hrms/urls.py`.
- Base path: `/`
- Endpoints: `/employees/`, `/departments/`, `/positions/`, `/attendance/`, `/leave-requests/`, `/leave-types/`, `/performances/`

---

## Notes
- All endpoints require JWT authentication.
- Role-based access enforced via custom permissions.
- Nested serializers for related objects (e.g., employee includes user info).
- Partial updates supported for employee/user objects.
