const session = require('express-session');
const MongoStore = require('connect-mongo');

const buildSessionMiddleware = () => {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET is not defined in environment variables');
  }

  return session({
    secret,
    name: 'lumen.sid',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24 * 14,
      touchAfter: 24 * 3600
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  });
};

module.exports = buildSessionMiddleware;
