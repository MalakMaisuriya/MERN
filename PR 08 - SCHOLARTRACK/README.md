# ScholarTrack

ScholarTrack is a production-style Node.js, Express.js, MongoDB and EJS application for managing academic submissions. It includes secure authentication, a personal dashboard, backend filtering, pagination, and complete CRUD operations for assignments, practicals, reports, presentations and mini projects.

## Features

- Register, login and logout with session-based authentication
- Password hashing using bcrypt
- Protected dashboard and submission routes
- User-owned submission records
- Create, view, update and delete submissions
- Backend search, status/type/priority filters, sorting and pagination
- Dashboard statistics for total, active, overdue and reviewed work
- Recent activity and status/priority breakdowns
- Server-side validation with friendly error messages
- Flash messages for success and error feedback
- 404 and 500 error pages
- Responsive EJS interface with Bootstrap 5 and custom CSS

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS
- Bootstrap 5
- Express-session
- bcryptjs
- express-validator
- connect-flash
- method-override
- dotenv

## Project Structure

```text
.
|-- config/
|   `-- database.js
|-- controllers/
|   |-- authController.js
|   |-- dashboardController.js
|   `-- submissionController.js
|-- middleware/
|   |-- auth.js
|   |-- errorHandler.js
|   `-- locals.js
|-- models/
|   |-- Submission.js
|   `-- User.js
|-- public/
|   |-- css/styles.css
|   `-- js/app.js
|-- routes/
|   |-- authRoutes.js
|   |-- dashboardRoutes.js
|   `-- submissionRoutes.js
|-- utils/
|   `-- validation.js
|-- views/
|   |-- auth/
|   |-- dashboard/
|   |-- errors/
|   |-- layouts/
|   |-- partials/
|   `-- submissions/
|-- .env.example
|-- .gitignore
|-- app.js
|-- package.json
`-- README.md
```

## Installation

```bash
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Environment Variables

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/scholartrack_db
SESSION_SECRET=replace_this_with_a_long_random_secret
NODE_ENV=development
```

## MongoDB Setup

1. Install MongoDB Community Server or run MongoDB with Docker.
2. Start the MongoDB service.
3. Keep `MONGO_URI` as `mongodb://127.0.0.1:27017/scholartrack_db` for a local setup, or replace it with your MongoDB Atlas connection string.

## Run Commands

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Main Routes

- `GET /` - Login landing
- `GET /auth/register` - Register page
- `POST /auth/register` - Create account
- `GET /auth/login` - Login page
- `POST /auth/login` - Start session
- `POST /auth/logout` - End session
- `GET /dashboard` - Protected dashboard
- `GET /submissions` - List, search, filter, sort and paginate submissions
- `GET /submissions/new` - New submission form
- `POST /submissions` - Create submission
- `GET /submissions/:id` - Submission details
- `GET /submissions/:id/edit` - Edit form
- `PUT /submissions/:id` - Update submission
- `DELETE /submissions/:id` - Delete submission

## Screenshots

Add screenshots here after running the project locally:

- Login page
- Dashboard
- Submissions list
- Create/edit form
- Details page

## Test Checklist

- Register with valid details
- Try duplicate email or username
- Login with valid and invalid credentials
- Logout and confirm protected routes redirect
- Create a submission
- Validate required fields and marks range
- Search submissions by title, subject or notes
- Filter by status, type and priority
- Sort by newest, due date, title and priority
- View submission details
- Update a submission
- Delete a submission after confirmation
- Visit invalid URLs and invalid record IDs
- Check empty database state
- Check dashboard statistics after adding records

## Future Improvements

- Add file attachments for submitted documents
- Add due date email reminders
- Add CSV export
- Add dark mode preference
- Add teacher review notes
