# HealthStack - Healthcare Management System

HealthStack is a comprehensive medical directory and healthcare management application built with Next.js 16 and Prisma. It provides dedicated role-based dashboards to manage end-to-end healthcare workflows including appointment scheduling, patient records, prescription generation, and administrative reporting.

## 🚀 Features

### Role-Based Access
- **Admin Dashboard**: System overview, revenue metrics, appointment statistics, and dynamic reporting.
- **Doctor Dashboard**: Manage patient directories, view schedules, conduct virtual/in-person consultations, and utilize an AI-Powered Prescription Generator.
- **Patient Dashboard**: Book appointments, view medical records, track lab results, and manage prescriptions securely.

### Core Modules
- **Appointments System**: Real-time booking and status tracking (Scheduled, Completed, Cancelled).
- **AI Prescriber**: AI-assisted prescription generation with built-in warnings and allergy checks.
- **Medical Records**: Securely store and retrieve lab tests, imaging, and consultation notes.
- **Data Persistence**: Backed by a Prisma ORM with SQLite for out-of-the-box development and scalability.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Language**: TypeScript

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database Setup:**
   The project uses SQLite by default for easy setup. Initialize the database and apply the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Data Seeding (Optional but recommended):**
   To populate the database with the included doctors and neurologists dataset from the `data/` directory:
   ```bash
   npx tsx scripts/seed-doctors.ts
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🗄 Database Management

You can easily inspect and manage your local database records using Prisma Studio:
```bash
npx prisma studio
```
This will open a visual database editor at `http://localhost:5555`.
