const fs = require("fs");
const path = require("path");
const User = require("../models/User");

exports.getProfile = (req, res) => {
  res.render("profile", {
    title: "Profile",
    successMessage: req.session.successMessage || null,
    errorMessage: req.session.errorMessage || null,
  });
  req.session.successMessage = null;
  req.session.errorMessage = null;
};

// Update name, surname, address
exports.updateProfile = async (req, res) => {
  const { name, surname, address } = req.body;

  if (!name) {
    req.session.errorMessage = "Name cannot be empty.";
    return res.redirect("/profile");
  }

  try {
    await User.findByIdAndUpdate(req.user._id, {
      name,
      surname: surname || "",
      address: address || "",
    });

    req.session.successMessage = "Profile updated successfully.";
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Something went wrong, please try again.";
    res.redirect("/profile");
  }
};

// Change profile photo — deletes the old uploaded file from disk (unless it's the default avatar)
exports.updateAvatar = async (req, res) => {
  if (!req.file) {
    req.session.errorMessage = "No image selected.";
    return res.redirect("/profile");
  }

  try {
    const user = await User.findById(req.user._id);

    if (user.avatar && user.avatar !== "/img/user-profile.jpg") {
      const oldPath = path.join(__dirname, "..", "public", user.avatar);
      fs.unlink(oldPath, () => {}); // ignore error if file already gone
    }

    user.avatar = "/uploads/" + req.file.filename;
    await user.save();

    req.session.successMessage = "Profile photo updated successfully.";
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.session.errorMessage = "Something went wrong, please try again.";
    res.redirect("/profile");
  }
};
