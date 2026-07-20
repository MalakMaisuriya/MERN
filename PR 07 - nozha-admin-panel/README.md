# Nozha Admin Panel

Node.js admin panel using the **Nozha RTL Dashboard** UI, with the same stack your friend used:
Express, MongoDB (Mongoose), EJS, cookie-based sessions with Passport (local strategy), bcrypt
password hashing, and Multer for image uploads. Includes full blog CRUD with protected routes.

## Stack
- Express.js — server & routing
- MongoDB + Mongoose — database
- EJS — views (Nozha HTML converted to templates)
- express-session + cookie-parser — cookie-based auth session
- passport + passport-local — login strategy
- bcrypt — password hashing
- multer — image uploads (blog cover images)
- method-override — lets HTML forms send PUT/DELETE

## Folder structure
```
config/       - db.js (Mongo connection), passport.js (auth strategy)
controllers/  - authController.js, blogController.js
middleware/   - auth.js (protected routes), upload.js (multer config)
models/       - User.js, Blog.js
routes/       - authRoutes.js, blogRoutes.js
views/        - EJS pages (login, register, dashboard, blogs/*) built from the Nozha UI
public/       - Nozha's css/js/img/svg/font assets + public/uploads (uploaded images)
index.js      - app entry point
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure MongoDB is running locally (or use MongoDB Atlas).

3. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```
   ```
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/nozha_admin
   SESSION_SECRET=some_long_random_string
   ```

4. Run in development (auto-restart):
   ```
   npm run dev
   ```
   or in production:
   ```
   npm start
   ```

5. Open http://localhost:3000 — you'll be redirected to `/login`.
   Click **Register karo** to create the first account, then log in.

## Features
- **Register / Login / Logout** — passwords hashed with bcrypt, session stored via cookie.
- **Protected routes** — `/`, `/blogs`, `/blogs/new`, edit/delete all require login
  (`middleware/auth.js` → `ensureAuthenticated`).
- **Blog CRUD** — create, list, edit, delete blog posts, each with an optional cover image
  uploaded via Multer (stored in `public/uploads/`, old image deleted automatically on
  replace/delete).
- **Dashboard** — shows total blog count, your blog count, and the 5 most recent posts.

## Notes
- The old image is deleted from disk whenever a blog is updated with a new image or deleted.
- File uploads are limited to 5MB and restricted to jpeg/jpg/png/gif/webp.
- All the Nozha component demo pages (buttons, cards, modals, etc.) are still in the original
  zip if you want to borrow more UI pieces — they weren't wired into routes since they're just
  style references, not admin panel screens.
