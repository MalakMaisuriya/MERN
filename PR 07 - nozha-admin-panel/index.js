require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const methodOverride = require("method-override");
const passport = require("passport");

const connectDB = require("./config/db");
require("./config/passport")(passport);

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const uiRoutes = require("./routes/uiRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// DB
connectDB();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method")); // lets forms send PUT/DELETE

// Static files (css/js/img/svg/font/uploads from the Nozha UI)
app.use(express.static(path.join(__dirname, "public")));

// Session (cookie-based)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "nozha_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Passport (cookie-based auth via session)
app.use(passport.initialize());
app.use(passport.session());

// Make logged-in user available to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/", blogRoutes);
app.use("/", uiRoutes);
app.use("/", profileRoutes);

// 404
app.use((req, res) => {
  res.status(404).send("Page not found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
});
