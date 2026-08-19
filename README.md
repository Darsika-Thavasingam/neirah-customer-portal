# Neirah Construction OS — Customer Portal

A customer-facing portal for **Neirah Construction OS** that allows customers to securely view their projects, progress, milestones, documents, quotations, contracts, invoices, payments, notifications, and profile information.

The application is built with a **Next.js frontend**, **NestJS backend**, **PostgreSQL**, and **Prisma ORM**, with customer ownership and tenant isolation enforced on the backend.

---

## 1. Project Overview

The Customer Portal provides a self-service interface for construction customers to access information related to their projects and financial records.

### Main Capabilities

* Customer Portal Dashboard
* Customer Profile
* My Projects
* Project Details
* Project Progress
* Milestones
* Project Updates
* Project Photos
* Customer Documents
* Quotations
* Contracts
* Invoices
* Payment History
* Outstanding Payments
* Notifications
* Customer ownership security
* Tenant isolation
* Swagger API documentation
* Automated backend tests
* Demo-ready customer data

---

## 2. Technology Stack

### Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* Responsive UI
* Client-side navigation
* Responsive mobile navigation
* Brand-based design system

### Backend

* NestJS 11
* TypeScript
* Prisma ORM
* PostgreSQL
* REST API
* Swagger / OpenAPI
* Jest

### Database

* PostgreSQL
* Prisma schema and migrations
* Tenant-aware customer data model

---

## 3. Project Structure

```text
neirah-customer-portal/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── customer-portal/
│   │   ├── prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── invoices/
│   │   ├── login/
│   │   ├── notifications/
│   │   ├── payments/
│   │   ├── profile/
│   │   ├── projects/
│   │   ├── quotations/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── public/
│   │   └── neirah-logo.png
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## 4. Prerequisites

Install the following before running the project:

* Node.js
* npm
* PostgreSQL
* Git

A PostgreSQL database must be available for the backend.

---

## 5. Clone the Repository

```bash
git clone https://github.com/Darsika-Thavasingam/neirah-customer-portal.git
cd neirah-customer-portal
```

---

## 6. Backend Setup

Open a terminal in the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

Configure the PostgreSQL connection using the project's `DATABASE_URL` environment variable.

Example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
PORT=3001
```

Use your local PostgreSQL credentials and database name.

---

## 7. Database Setup

The project uses Prisma for database access and migrations.

From the `backend` directory:

```bash
npx prisma migrate dev
```

Generate the Prisma client if required:

```bash
npx prisma generate
```

Seed the demo data:

```bash
npx prisma db seed
```

The project includes customer portal demo data for demonstrating customer-facing features and customer ownership isolation.

---

## 8. Start the Backend

Start the backend in development mode:

```bash
npm run start:dev
```

The backend runs on:

```text
http://localhost:3001
```

---

## 9. Swagger API Documentation

Swagger documentation is available after starting the backend:

```text
http://localhost:3001/api/docs
```

The API documentation includes the Customer Portal REST API and supports the configured `x-user-id` API key header.

---

## 10. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create/configure the frontend environment variables required by the application.

Then start the development server:

```bash
npm run dev
```

The frontend is available at:

```text
http://localhost:3000
```

---

## 11. Customer Access

The portal includes a customer access page:

```text
http://localhost:3000/login
```

The access flow uses the existing Customer Portal access architecture.

The customer access key / user ID is verified against the backend before access is granted.

The login page also provides convenient demo customer selection for evaluation.

---

## 12. Customer Portal Routes

| Feature                 | Route                       |
| ----------------------- | --------------------------- |
| Dashboard               | `/`                         |
| Login / Customer Access | `/login`                    |
| Contracts               | `/contracts`                |
| Contract Details        | `/contracts/[id]`           |
| Invoices                | `/invoices`                 |
| Invoice Details         | `/invoices/[id]`            |
| Payments                | `/payments`                 |
| Outstanding Payments    | `/payments/outstanding`     |
| Notifications           | `/notifications`            |
| Profile                 | `/profile`                  |
| Project Details         | `/projects/[id]`            |
| Project Documents       | `/projects/[id]/documents`  |
| Project Milestones      | `/projects/[id]/milestones` |
| Project Photos          | `/projects/[id]/photos`     |
| Project Progress        | `/projects/[id]/progress`   |
| Project Updates         | `/projects/[id]/updates`    |
| Quotations              | `/quotations`               |
| Quotation Details       | `/quotations/[id]`          |

---

## 13. Security and Tenant Isolation

Customer ownership and tenant isolation are enforced by the backend.

The frontend does not determine whether a customer is authorized to access a resource.

For each protected request, the backend resolves the customer's portal access record and determines the associated:

* `userId`
* `customerId`
* `tenantId`

Database queries are scoped to the authenticated customer's ownership and tenant.

For example, project access is restricted using customer and tenant ownership rather than relying only on the project ID supplied by the client.

This prevents a customer from accessing another customer's:

* Projects
* Invoices
* Payments
* Documents
* Quotations
* Contracts
* Other protected portal data

by changing a URL or resource identifier.

Inactive or invalid customer portal access is rejected by the backend.

---

## 14. Authentication / Access Flow

The portal uses the existing Customer Portal access architecture rather than introducing a separate authentication system.

The basic flow is:

```text
Customer
   │
   ▼
/login
   │
   ▼
Customer Access Key / User ID
   │
   ▼
GET /api/v1/customer-portal/access/me
   │
   ▼
Backend verifies CustomerPortalAccess
   │
   ├── Invalid / inactive → Unauthorized
   │
   └── Valid → Customer Portal
```

The verified customer access key is retained client-side for convenience, while authorization remains enforced by the backend.

---

## 15. UI and Design System

The frontend follows the Neirah Construction OS visual system.

### Primary Colors

```text
Primary Blue:       #2563EB
Deep Navy:          #0B1220
Muted Slate:        #667085
Soft Blue Surface:  #EAF2FF
Application BG:     #F7F9FC
Success Green:      #067647
Danger Red:         #B42318
```

### UI Standards

* Consistent typography hierarchy
* Responsive layouts
* Mobile navigation
* Keyboard focus states
* Consistent status badges
* Standardized cards and elevation
* Responsive data tables
* Brand logo integration
* Customer-friendly empty and error states

---

## 16. Reusable Components

The frontend includes reusable components for consistent UI behavior.

### Header

The responsive header provides:

* Active navigation state
* Desktop navigation
* Mobile navigation drawer
* Keyboard accessibility
* Brand logo

### StatusBadge

The reusable `StatusBadge` component provides consistent visual treatment for statuses such as:

* Completed
* Paid
* In Progress
* Sent
* Pending
* Partial
* Overdue
* Rejected

---

## 17. Testing

Backend tests are implemented using Jest.

From the `backend` directory:

```bash
npm test
```

Latest verification:

```text
Test Suites: 8 passed, 8 total
Tests:       12 passed, 12 total
Snapshots:   0 total
```

All backend test suites passed successfully.

---

## 18. Production Build Verification

### Frontend

From the `frontend` directory:

```bash
npm run build
```

The production build was successfully verified with all required portal routes compiling without TypeScript or build errors.

Verified routes include:

* `/`
* `/contracts`
* `/contracts/[id]`
* `/invoices`
* `/invoices/[id]`
* `/login`
* `/notifications`
* `/payments`
* `/payments/outstanding`
* `/profile`
* `/projects/[id]`
* `/projects/[id]/documents`
* `/projects/[id]/milestones`
* `/projects/[id]/photos`
* `/projects/[id]/progress`
* `/projects/[id]/updates`
* `/quotations`
* `/quotations/[id]`

### Backend

Build the backend with:

```bash
cd backend
npm run build
```

---

## 19. Demo and Evaluation

The portal includes demo-ready customer data for evaluating:

1. Customer Dashboard
2. Customer Profile
3. Project Information
4. Project Progress
5. Milestones
6. Project Updates
7. Project Photos
8. Customer Documents
9. Quotations
10. Contracts
11. Invoices
12. Payment History
13. Outstanding Payments
14. Notifications
15. Customer Ownership Isolation
16. Tenant Isolation

The login page provides a convenient way to select available demo customer profiles during evaluation.

---

## 20. Customer Ownership Verification

The application supports testing the following security scenario:

```text
Customer A
   │
   ├── Can access Customer A data
   │
   └── Cannot access Customer B data

Customer B
   │
   ├── Can access Customer B data
   │
   └── Cannot access Customer A data
```

Attempting to access another customer's protected resource through a modified resource ID is rejected by the backend because the resource query is scoped to the authenticated customer's ownership and tenant.

---

## 21. API Architecture

The backend exposes Customer Portal REST APIs under the Customer Portal module.

The API handles customer-facing resources including:

* Access
* Dashboard
* Projects
* Documents
* Project Updates
* Project Photos
* Invoices
* Payments
* Quotations
* Contracts
* Notifications
* Profile

Swagger provides an interactive API reference for development and evaluation.

---

## 22. Environment and Security Notes

Do not commit sensitive environment variables or production credentials to Git.

The following should remain environment-specific:

* PostgreSQL credentials
* Database connection strings
* Production secrets
* Deployment-specific configuration

Use `.env` files locally and configure production secrets through the deployment environment.

---

## 23. Final Verification Checklist

* [x] Frontend builds successfully
* [x] Backend tests pass
* [x] Customer Portal routes are available
* [x] Customer ownership security is implemented
* [x] Tenant isolation is implemented
* [x] Swagger documentation is available
* [x] Demo customer data is available
* [x] Responsive UI is implemented
* [x] Customer-facing modules are implemented
* [x] Git working tree is clean
* [x] Source code is committed to the repository

---

## 24. Submission

### GitHub Repository

https://github.com/Darsika-Thavasingam/neirah-customer-portal

### Main Technologies

```text
Next.js
React
TypeScript
NestJS
Prisma
PostgreSQL
Jest
Swagger / OpenAPI
Tailwind CSS
```

---

## Project Status

**Submission Ready**

The Neirah Construction OS Customer Portal implements the required customer-facing modules, backend authorization and tenant isolation, responsive frontend experience, Swagger documentation, automated tests, database integration, and demo-ready customer data.
