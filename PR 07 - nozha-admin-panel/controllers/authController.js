const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const nodemailer = require("nodemailer");

exports.getRegister = (req, res) => {
  res.render("register", {
    title: "Register",
    errorMessage: req.session.errorMessage || null,
  });
  req.session.errorMessage = null;
};

exports.postRegister = async (req, res) => {
  const { name, email, password, password2 } = req.body;
  const errors = [];

  if (!name || !email || !password || !password2) {
    errors.push("All fields are required.");
  }
  if (password && password2 && password !== password2) {
    errors.push("Passwords do not match.");
  }
  if (password && password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (errors.length > 0) {
    return res.render("register", {
      title: "Register",
      errorMessage: errors.join(" "),
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.render("register", {
        title: "Register",
        errorMessage: "An account with this email already exists.",
      });
    }

    await User.create({
      name,
      email: email.toLowerCase().trim(),
      password, // hashed automatically by the User model's pre-save hook
    });

    req.session.successMessage = "Account created successfully. Please login.";
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("register", {
      title: "Register",
      errorMessage: "Something went wrong, please try again.",
    });
  }
};

exports.getLogin = (req, res) => {
  res.render("login", {
    title: "Login",
    errorMessage: req.session.errorMessage || null,
    successMessage: req.session.successMessage || null,
  });
  req.session.errorMessage = null;
  req.session.successMessage = null;
};

// Login via Passport local strategy: it looks up the user in MongoDB and
// compares the submitted password against the bcrypt hash stored there.
// If they match -> logged in. If not -> "wrong password" style message.
exports.postLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.session.errorMessage = info && info.message ? info.message : "Incorrect email or password.";
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
};

// ---------- FORGOT PASSWORD (no email — direct reset by matching account email) ----------

exports.getForgotPassword = (req, res) => {
  res.render("forgot-password", {
    title: "Forgot Password",
    errorMessage: req.session.errorMessage || null,
    successMessage: req.session.successMessage || null,
  });
  req.session.errorMessage = null;
  req.session.successMessage = null;
};

exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    req.session.errorMessage = "Email is required.";
    return res.redirect("/forgot-password");
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      req.session.errorMessage = "No account found with this email.";
      return res.redirect("/forgot-password");
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n=========================================\nOTP for password reset for ${email} is: ${otp}\n=========================================\n`);

    req.session.resetEmail = email.toLowerCase().trim();
    req.session.resetOtp = otp;

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Nozha Admin" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}.`,
        html: `<p>Your OTP for password reset is: <b>${otp}</b>.</p>`,
      });
      req.session.successMessage = "OTP has been sent to your email address.";
    } catch (mailError) {
      console.error("Error sending email:", mailError);
      req.session.successMessage = "OTP generated but email failed to send (check terminal for OTP).";
    }

    res.redirect("/verify-otp");
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Something went wrong, please try again.";
    res.redirect("/forgot-password");
  }
};

exports.getVerifyOtp = (req, res) => {
  if (!req.session.resetEmail) {
    return res.redirect("/forgot-password");
  }
  res.render("verify-otp", {
    title: "Verify OTP",
    errorMessage: req.session.errorMessage || null,
    successMessage: req.session.successMessage || null,
  });
  req.session.errorMessage = null;
  req.session.successMessage = null;
};

exports.postVerifyOtp = async (req, res) => {
  const { otp, newPassword, confirmPassword } = req.body;

  if (!req.session.resetEmail || !req.session.resetOtp) {
    req.session.errorMessage = "Session expired. Please request a new OTP.";
    return res.redirect("/forgot-password");
  }

  if (!otp || !newPassword || !confirmPassword) {
    req.session.errorMessage = "All fields are required.";
    return res.redirect("/verify-otp");
  }

  if (otp !== req.session.resetOtp) {
    req.session.errorMessage = "Invalid OTP.";
    return res.redirect("/verify-otp");
  }

  if (newPassword !== confirmPassword) {
    req.session.errorMessage = "New passwords do not match.";
    return res.redirect("/verify-otp");
  }

  if (newPassword.length < 6) {
    req.session.errorMessage = "New password must be at least 6 characters long.";
    return res.redirect("/verify-otp");
  }

  try {
    const user = await User.findOne({ email: req.session.resetEmail });

    if (!user) {
      req.session.errorMessage = "User not found.";
      return res.redirect("/forgot-password");
    }

    user.password = newPassword; // re-hashed automatically by the pre-save hook
    await user.save();

    // Clear session
    delete req.session.resetEmail;
    delete req.session.resetOtp;

    req.session.successMessage = "Password reset successfully. Please login with your new password.";
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Something went wrong, please try again.";
    res.redirect("/verify-otp");
  }
};

// ---------- CHANGE PASSWORD (logged-in user, from the Profile page) ----------
// Verifies the current password against the bcrypt hash in MongoDB (same
// comparison Passport's local strategy uses), then hashes and saves the new one.

exports.postChangePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    req.session.errorMessage = "All fields are required.";
    return res.redirect("/profile");
  }

  if (newPassword !== confirmPassword) {
    req.session.errorMessage = "New passwords do not match.";
    return res.redirect("/profile");
  }

  if (newPassword.length < 6) {
    req.session.errorMessage = "New password must be at least 6 characters long.";
    return res.redirect("/profile");
  }

  try {
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      req.session.errorMessage = "Current password is incorrect.";
      return res.redirect("/profile");
    }

    user.password = newPassword; // re-hashed automatically by the pre-save hook
    await user.save();

    req.session.successMessage = "Password changed successfully.";
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Something went wrong, please try again.";
    res.redirect("/profile");
  }
};
