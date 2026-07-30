# CineLedger - Movie Rental Management System

A full-stack enterprise Movie Rental Management System built using **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, **EJS**, **Bootstrap 5**, and **Vanilla JavaScript**.

---

## 📌 Features & Core Modules

1. **Authentication & Authorization**
   - JWT-based authentication stored in HTTP-only cookies and Bearer headers.
   - Password security via `bcryptjs` (salt factor 12).
   - Role-Based Access Control (**Admin** vs **Staff**).

2. **Executive Dashboard**
   - Live metrics: Total Movies, Active Customers, Available Inventory Copies, Total Revenue, Active Rentals, Returned Rentals, Actors Count, Categories Count.
   - Interactive monthly revenue trend chart powered by **Chart.js**.
   - Aggregated highlights: Popular Movies, Recent Rentals, and Recent Transactions via MongoDB Aggregation Pipelines.

3. **Movie Management**
   - Full CRUD operations with movie details, release year, language, rating, rental duration, rental rate, and replacement cost.
   - Multer file upload integration for custom poster artwork.
   - Search, filter by category/language/year, multi-sort, and pagination.

4. **Actor Management**
   - Full CRUD operations and detailed filmography views showing all associated movies per actor.

5. **Category & Language Catalog**
   - Category management displaying active movie counts per category.
   - Language management supporting multi-lingual catalog tagging.

6. **Customer Management**
   - Customer profile tracking with personal details, phone, email, and location address.
   - Detailed profile page displaying lifetime rental order history, total spending, and payment records.

7. **Inventory Management**
   - Connects Movies and Store Branches.
   - Automated SKU code generation.
   - Real-time stock status tracking (`Available`, `Rented`, `Maintenance`, `Lost`).

8. **Rental Workflow Management**
   - Integrated checkout: Select Customer → Select Available Copy → Set Payment Method → Auto-generates Payment & locks Inventory to `Rented`.
   - Integrated Return workflow: One-click return sets return date, updates status to `Returned`, and unlocks Inventory copy to `Available`.

9. **Payment & Financial Management**
   - Financial ledger tracking Cash, Card, and UPI payments.
   - Search & date-range filtering (From/To dates).

10. **Store Branch & Location Management**
    - Multi-store branch management with assigned staff managers.
    - Relational hierarchy mapping: **Country → City → Address**.

11. **RESTful API**
    - Public/Protected JSON API endpoints for external integrations (`/api/movies`, `/api/customers`, `/api/rentals`, `/api/payments`).

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `cookie-parser`, `express-validator`
- **File Uploads**: `multer`
- **Frontend Views**: EJS (Embedded JavaScript Templates), Bootstrap 5.3, Bootstrap Icons, Vanilla JavaScript, Custom CSS
- **Visualization**: Chart.js

---

## 📁 Directory Structure

```
PR 09/
├── config/
│   └── db.js                 # MongoDB connection setup
├── controllers/
│   ├── actorController.js    # Actor management logic
│   ├── apiController.js      # REST API endpoints controller
│   ├── authController.js     # Login & Authentication logic
│   ├── categoryController.js # Category management logic
│   ├── customerController.js # Customer profile & history logic
│   ├── dashboardController.js# Aggregated analytics & stats
│   ├── inventoryController.js# Inventory copy management
│   ├── locationController.js # Location hierarchy (Country, City, Address)
│   ├── movieController.js    # Movie CRUD & poster upload
│   ├── paymentController.js  # Payment tracking & filters
│   ├── rentalController.js   # Rental checkout & return workflow
│   ├── staffController.js    # Staff account management
│   └── storeController.js    # Store branch management
├── middleware/
│   ├── authMiddleware.js     # JWT verification middleware
│   ├── errorMiddleware.js    # Centralized 404 & error handlers
│   ├── roleMiddleware.js     # Admin / Staff authorization guard
│   └── uploadMiddleware.js   # Multer file upload handler
├── models/
│   ├── Actor.js              # Actor schema
│   ├── Address.js            # Address schema
│   ├── Category.js           # Category schema
│   ├── City.js               # City schema
│   ├── Country.js            # Country schema
│   ├── Customer.js           # Customer schema
│   ├── Inventory.js          # Inventory copy schema
│   ├── Language.js           # Language schema
│   ├── Movie.js              # Movie catalog schema
│   ├── Payment.js            # Financial transaction schema
│   ├── Rental.js             # Movie rental order schema
│   ├── Store.js              # Store branch schema
│   └── User.js               # User / Staff account schema
├── public/
│   ├── css/
│   │   └── app.css           # Custom UI design system & responsive CSS
│   ├── js/
│   │   └── app.js            # Chart.js initialization & UI script
│   └── uploads/              # Uploaded movie poster images
├── routes/
│   ├── actorRoutes.js
│   ├── apiRoutes.js
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── customerRoutes.js
│   ├── dashboardRoutes.js
│   ├── inventoryRoutes.js
│   ├── locationRoutes.js
│   ├── movieRoutes.js
│   ├── paymentRoutes.js
│   ├── rentalRoutes.js
│   ├── staffRoutes.js
│   └── storeRoutes.js
├── seed/
│   └── seed.js               # Realistic sample database seeder
├── utils/
│   ├── helpers.js            # Async handler & pagination helpers
│   └── validators.js         # Express-validator form rules
├── views/
│   ├── actors/
│   ├── auth/
│   ├── categories/
│   ├── customers/
│   ├── dashboard/
│   ├── errors/
│   ├── inventory/
│   ├── locations/
│   ├── movies/
│   ├── partials/
│   ├── payments/
│   ├── rentals/
│   ├── staff/
│   └── stores/
├── .env.example
├── app.js
├── package.json
└── README.md
```

---

## ⚡ Quick Setup & Installation

### 1. Prerequisites
Ensure you have installed:
- **Node.js** (v18.x or higher)
- **MongoDB** (running locally on port `27017` or a MongoDB Atlas URI)

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/movie_rental_system
JWT_SECRET=super_secret_jwt_key_cineledger
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed the Database
Populate the database with sample movies, actors, categories, languages, stores, inventory copies, rentals, payments, locations, and staff users:
```bash
npm run seed
```

### 5. Start Application Server
```bash
npm start
```
Or for development mode with automatic reload:
```bash
npm run dev
```

Visit the application at: **`http://localhost:3000`**

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@movierental.com` | `Admin@123` | Full access (CRUD on all modules, stores, staff, locations) |
| **Staff** | `staff@movierental.com` | `Staff@123` | Operations access (View movies/inventory, manage customer rentals & payments) |

---

## 🌐 API Endpoints Overview

All API endpoints are protected by JWT authentication (passed via Cookie or `Authorization: Bearer <token>` header).

- `GET /api/movies` - Fetch all active movies
- `GET /api/movies/:id` - Fetch single movie details
- `POST /api/movies` - Create a new movie
- `PUT /api/movies/:id` - Update movie
- `DELETE /api/movies/:id` - Deactivate movie
- `GET /api/customers` - List all customers
- `GET /api/rentals` - List all rentals
- `POST /api/rentals` - Create a new rental & payment
- `PUT /api/rentals/:id/return` - Process movie return
- `GET /api/payments` - List payment transactions
