# ERP-HR System

Production-ready HR management system with Django REST Framework backend and React frontend.

## Quick Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd erp_hr

# Backend setup
py -m venv .venv
py .\.venv\Scripts\activate.ps1
pip install -r requirements.txt

# Configure environment
cd backend
cp .env.sample .env
# Edit .env with your database credentials

# Initialize database
py manage.py makemigrations
py manage.py migrate
py manage.py init_data

# Start backend (localhost:8000)
py manage.py runserver
```

```bash
# Frontend setup (new terminal)
cd frontend
npm install
npm run dev  # localhost:5173
```

## 🔧 Environment Configuration

Create `backend/.env`:
```bash
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=erp_hr
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=localhost
```

## Features

- **Employee Management**: CRUD operations, role-based access, bulk actions
<img width="1919" height="915" alt="image" src="https://github.com/user-attachments/assets/bf9a58d2-4ca3-4876-bf1f-817fb4b1ae67" />

- **Attendance System**: Real-time check-in/out, overtime tracking, GMT+7 timezone
<img width="1917" height="916" alt="image" src="https://github.com/user-attachments/assets/33c31b59-2843-4a7a-8940-7f94876fea89" />

- **Leave Management**: Request workflow, automatic attendance integration

- **Payroll Integration**: Attendance-based salary calculations with penalties/bonuses
- **Performance Reviews**: Manager-only reviews with complex validation
- **Security**: JWT authentication, role permissions, data integrity

## Tech Stack

- **Backend**: Django 5.2.6 + DRF + MySQL + JWT
- **Frontend**: React 19 + Vite + TailwindCSS
- **Authentication**: JWT with 12h access + 7d refresh tokens

- **Timezone**: GMT+7 (Asia/Ho_Chi_Minh) consistency

