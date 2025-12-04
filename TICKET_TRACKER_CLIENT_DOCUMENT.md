# Ticket Tracker – Final Project Document

## 1. Project Overview

**Project Name**: Ticket Tracker – Metlen Puresky  
**Client**: [Your Client Name]  
**Purpose**: A web-based ticket management system to log, track, and resolve issues efficiently across your organization.

The application provides:

- A simple interface for users to create and follow up on tickets
- An admin panel for managing users, tickets, and analytics
- Real-time visibility into open issues and team performance

---

## 2. Single Access URL (Frontend + Backend)

Your entire system is accessible from **one URL**:

- **Main Application URL**:  
  **https://metlenpureskytracker.netlify.app**

From this single link, users and admins can:

- Log in (User or Admin)
- Create, view, and update tickets
- View dashboards, analytics, and reports

**Behind the scenes:**

- The user interface is hosted on **Netlify**
- All data operations are handled by a secure backend API hosted on **Render**:  
  `https://tickertrackermetlenpuresky.onrender.com`
- Netlify automatically forwards all `/api/...` calls from the frontend to this backend, which connects to the Supabase database

---

## 3. Key Features

### User Login

- Secure login for regular users
- Users can:
  - Create new tickets describing customer issues
  - See their own tickets with current status and details
  - Add comments or additional information to existing tickets

### Admin Login

- Separate, secure login for administrators
- Admins can:
  - View and manage all tickets in the system
  - Assign and update ticket status (Open, Pending, Closed, etc.)
  - Manage user accounts and access


  - Access advanced analytics and reports

### Ticket Management

- Structured ticket form (customer, site, category, priority, description, etc.)
- Status tracking from creation to closure
- Commenting system for internal notes and communication

### Dashboards & Analytics

- Overview of total, open, pending, and closed tickets
- Filters by date range, customer, category, and priority
- Team performance views (who is handling which tickets, how quickly)
- Export-friendly data for reporting, if required

### Responsive User Interface

- Clean, modern design
- Easy navigation between login, dashboard, ticket forms, and analytics
- Optimized for desktop browsers

---

## 4. Technical Architecture (High-Level)

### Frontend (UI Layer)

- **Framework**: **React** with TypeScript
- **Routing**: React Router (multi-page flows like Login, Dashboard, Reports, etc.)
- **Hosted on**: **Netlify** (`metlenpureskytracker.netlify.app`)
- **API Integration**:
  - Uses a relative base URL `/api`
  - Netlify redirects `/api/*` to the backend API on Render

### Backend (API & Business Logic)

- **Technology**: **Node.js + Express**
- **Hosted on**: **Render** (`tickertrackermetlenpuresky.onrender.com`)
- **Responsibilities**:
  - Authentication (`/api/auth/admin-login`, `/api/auth/user-login`, `/api/auth/change-password`, etc.)
  - Ticket endpoints (`/api/tickets/*`)
  - Comment endpoints (`/api/comments/*`)
  - Admin operations (`/api/admin/*`)
  - Health and test checks (`/api/health`, `/api/test`)

### Database

- **Platform**: **Supabase** (PostgreSQL)
- **Stores**:
  - Users and roles (admin / user)
  - Tickets and ticket history
  - Comments and related metadata
- **Secure access** via Supabase client with server-side credentials

---

## 5. Security & Data Protection

- **Authentication**
  - JWT-based (JSON Web Tokens) for both user and admin sessions
  - Tokens are issued by the backend and validated on each protected request
  - Tokens are stored on the client side and used in Authorization headers

- **Access Control**
  - Admin routes are restricted to admin accounts
  - Regular users are limited to their own ticket data

- **Secrets & Configuration**
  - Sensitive values (e.g., `JWT_SECRET`, Supabase keys) are stored as environment variables on the server side (Render), not in the frontend code
  - Frontend only uses non-sensitive configuration

- **Deployment Reliability**
  - Frontend and backend each have their own hosting (Netlify + Render), enabling independent scaling and zero-downtime updates
  - Health checks expose a simple status endpoint: `/api/health` ("Server is running!")

---

## 6. Typical User Flow

1. **Open Application**
   - Navigate to `https://metlenpureskytracker.netlify.app`

2. **Login**
   - **User**:
     - Select User Login
     - Enter email and password
     - On success, redirected to user dashboard
   - **Admin**:
     - Select Admin Login
     - Enter admin credentials
     - On success, redirected to admin dashboard

3. **Working with Tickets**
   - Create new tickets with customer and issue details
   - Update existing tickets (status, comments)
   - Use filters (status, date, category) to find relevant tickets

4. **Analytics & Reports**
   - Admins view high-level dashboards
   - Monitor open tickets, closure rates, and performance trends

---

## 7. Collaboration & Maintenance

- **Source Code Repository**
  - Hosted on GitHub: `https://github.com/Sisti-Anjana/TickerTrackerMetlenPuresky`
  - Enables version control, code review, and team collaboration

- **Deployment Process (Summary)**
  - Changes pushed to GitHub
  - Netlify and Render fetch the latest code and redeploy
  - Environment variables and configuration are managed via their respective dashboards

- **Future Enhancements (Optional)**
  - Email notifications when ticket status changes
  - SLA tracking (response and resolution times)
  - More detailed management reports and exports
  - Integration with other internal tools or communication platforms

---

## 8. Final Notes for the Client

- Your users only need to remember **one link**:  
  **https://metlenpureskytracker.netlify.app**
- The system is built on modern, widely-used technologies (React, Node.js, PostgreSQL via Supabase)
- The architecture separates UI, API, and database, which makes the solution:
  - Easier to maintain
  - Easier to scale
  - Safer from a security perspective

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Prepared By**: Development Team


