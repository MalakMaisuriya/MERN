# LumenPortal

Premium campus publication management platform built with Node.js, Express, MongoDB, and EJS. LumenPortal provides a public reading experience and a glassmorphism admin console for managing publications, topics, and media assets.

## Features

- Session-based authentication with role-based access (administrator, editor, viewer)
- Publication CRUD with draft / published / archived workflow
- Topic management with accent colors
- Media vault with secure image uploads (Multer)
- Dashboard analytics with Chart.js visualizations
- Search, filter, sort, and pagination across admin tables
- Flash notifications, empty states, and loading feedback
- Responsive public catalog and SEO-friendly article pages
- Glassmorphism UI inspired by modern product design systems

## Tech Stack

- Node.js + Express.js
- EJS + express-ejs-layouts
- MongoDB + Mongoose
- Bootstrap 5 (grid/utilities only — custom styling)
- Express Session + connect-mongo
- Bcrypt, Multer, Express Validator, Method Override

## Prerequisites

- Node.js 18+
- MongoDB 6+ running locally or a MongoDB Atlas URI

## Installation

```bash
# Clone or extract the project
cd lumenportal

# Install dependencies
npm install

# Configure environment
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

# Seed administrator account and sample topics
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:4000](http://localhost:4000)

### Default Admin Credentials (after seed)

- **Email:** admin@lumenportal.dev
- **Password:** Admin@12345

Change these credentials immediately in production.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 4000) |
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | Long random string for session signing |
| `APP_NAME` | Application display name |
| `APP_URL` | Public base URL |
| `MAX_FILE_SIZE` | Upload limit in bytes (default: 5MB) |

## Project Structure

```
lumenportal/
├── app.js                 # Application entry point
├── config/                # Database, session, multer config
├── src/
│   ├── controllers/       # Route handlers (MVC)
│   ├── middleware/        # Auth, flash, validation, errors
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routers
│   ├── services/          # Business logic (dashboard metrics)
│   ├── utils/             # Helpers and async wrapper
│   └── validators/        # Express-validator rules
├── views/                 # EJS templates
├── public/                # Static assets and uploads
└── scripts/               # Database seed script
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run production server |
| `npm run dev` | Run with nodemon |
| `npm run seed` | Create admin user and sample topics |

## Deployment

### Render / Railway

1. Push the repository to GitHub
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`
6. Provision MongoDB Atlas and set `MONGODB_URI`
7. Set `NODE_ENV=production` and a strong `SESSION_SECRET`

### VPS (Ubuntu)

```bash
git clone <repo-url> /var/www/lumenportal
cd /var/www/lumenportal
npm install --production
cp .env.example .env
# Edit .env with production values
npm run seed
pm2 start app.js --name lumenportal
pm2 save
```

Use Nginx as a reverse proxy and enable HTTPS for secure session cookies.

## Security Notes

- Passwords are hashed with bcrypt (cost factor 12)
- Sessions stored in MongoDB via connect-mongo
- File uploads restricted by MIME type and size
- Role-based route protection for destructive actions
- Input validation on all form submissions

## License

MIT
