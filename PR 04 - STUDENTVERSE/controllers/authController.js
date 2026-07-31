const { validationResult } = require("express-validator");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

function mapFormErrors(req) {
  return validationResult(req)
    .array()
    .reduce((errors, error) => {
      errors[error.path] = error.msg;
      return errors;
    }, {});
}

exports.showLogin = (req, res) => {
  res.render("auth/login", {
    title: "Sign in",
    form: {},
    errors: {},
  });
};

exports.showRegister = (req, res) => {
  res.render("auth/register", {
    title: "Create account",
    form: {},
    errors: {},
  });
};

exports.register = asyncHandler(async (req, res) => {
  const errors = mapFormErrors(req);

  if (Object.keys(errors).length) {
    return res.status(422).render("auth/register", {
      title: "Create account",
      form: req.body,
      errors,
    });
  }

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(409).render("auth/register", {
      title: "Create account",
      form: req.body,
      errors: { email: "This email address is already registered." },
    });
  }

  await User.create(req.body);
  req.flash("success", "Registration successful! Please sign in with your email and password.");
  res.redirect("/login");
});

exports.login = asyncHandler(async (req, res) => {
  const errors = mapFormErrors(req);

  if (Object.keys(errors).length) {
    return res.status(422).render("auth/login", {
      title: "Sign in",
      form: req.body,
      errors,
    });
  }

  const user = await User.findOne({ email: req.body.email }).select("+password");
  const isValid = user && (await user.verifyPassword(req.body.password));

  if (!isValid) {
    return res.status(401).render("auth/login", {
      title: "Sign in",
      form: req.body,
      errors: { email: "Invalid email or password." },
    });
  }

  req.session.regenerate((error) => {
    if (error) {
      return res.status(500).render("errors/500", {
        title: "Application error",
        message: "Unable to create a secure session. Please try again.",
      });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email };
    req.flash("success", "Signed in successfully.");
    res.redirect("/dashboard");
  });
});

exports.logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("studentverse.sid");
    res.redirect("/login");
  });
};
