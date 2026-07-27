# StudentVerse

StudentVerse is a premium student management dashboard built with Node.js, Express, EJS, MongoDB and Mongoose. It improves a basic student CRUD app with MVC structure, authentication, validation, search, filters, sorting, pagination, dashboard analytics, dark/light mode and polished responsive UI.

## Folder Structure

```text
.
├── app.js
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── dashboardController.js
│   └── studentController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── viewLocals.js
├── models/
│   ├── Student.js
│   └── User.js
├── public/
│   ├── css/app.css
│   └── js/app.js
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   └── studentRoutes.js
├── src/
│   ├── seed.js
│   └── server.js
├── validators/
│   ├── authValidator.js
│   └── studentValidator.js
├── utils/
│   ├── asyncHandler.js
│   └── queryBuilder.js
└── views/
    ├── auth/
    ├── errors/
    ├── pages/
    ├── partials/
    └── students/
```

## Features

- Secure admin register, login and logout with bcrypt password hashing
- Session authentication with protected dashboard and student routes
- Complete student CRUD operations
- Server-side validation with friendly inline errors
- Duplicate email and enrollment number protection
- Search by name, email and enrollment number
- Filter by course and status
- Sort by newest, oldest, name and semester
- Server-side pagination
- Dashboard metrics and course distribution chart
- Responsive premium UI with dark/light theme
- Toast notifications, empty states, loading states and error pages
- Environment variable support

## Database Schema

### User

| Field | Type | Rules |
| --- | --- | --- |
| name | String | required, 2-80 chars |
| email | String | required, unique, lowercase |
| password | String | required, hashed, min 8 chars |

### Student

| Field | Type | Rules |
| --- | --- | --- |
| name | String | required, 2-80 chars |
| email | String | required, unique, valid email |
| phone | String | required, 10 digits |
| course | String | required, enum |
| enrollmentNumber | String | required, unique |
| semester | Number | required, 1-8 |
| status | String | active, inactive, placed, alumni |
| grade | String | A+, A, B+, B, C, D |
| city | String | optional |
| notes | String | optional, max 500 chars |

## API / Web Endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | Redirects to login or dashboard |
| GET | `/register` | Register page |
| POST | `/register` | Create admin account |
| GET | `/login` | Login page |
| POST | `/login` | Authenticate admin |
| POST | `/logout` | End session |
| GET | `/dashboard` | Dashboard metrics |
| GET | `/students` | List, search, filter, sort, paginate students |
| GET | `/students/new` | Add student form |
| POST | `/students` | Create student |
| GET | `/students/:id` | Student detail page |
| GET | `/students/:id/edit` | Edit student form |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

3. Start MongoDB locally or set `MONGODB_URI` to your Atlas connection string.

4. Seed demo data:

```bash
npm run seed
```

Demo login:

```text
admin@studentverse.test
Admin@12345
```

5. Run the project:

```bash
npm run dev
```

Open:

```text
http://localhost:9094
```

## Tech Stack

- HTML5, CSS3, JavaScript ES6+
- Node.js, Express.js, EJS
- MongoDB, Mongoose
- express-validator
- express-session, bcryptjs
- dotenv, helmet, compression, morgan

## Notes

File upload and email are not included because this student CRUD use case does not require uploaded files or email delivery. The structure is ready to add Multer or Nodemailer cleanly if those features are needed later.
