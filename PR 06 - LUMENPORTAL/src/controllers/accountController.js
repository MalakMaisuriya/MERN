const Account = require('../models/Account');
const { flashSuccess, flashError } = require('../middleware/flash');

const renderProfile = (res, status, account, fieldErrors = {}) => {
  return res.status(status).render('account/profile', {
    pageTitle: 'My Profile',
    activeNav: 'profile',
    account,
    fieldErrors
  });
};

const showProfile = async (_req, res) => {
  return renderProfile(res, 200, res.locals.currentUser);
};

const updateProfile = async (req, res) => {
  const account = await Account.findById(res.locals.currentUser._id);

  if (!account) {
    flashError(req, 'Account not found');
    return res.redirect('/console/profile');
  }

  const { fullName, age, gender, bio } = req.body;
  const fieldErrors = {};

  if (!fullName || fullName.trim().length < 2) {
    fieldErrors.fullName = 'Name must be at least 2 characters';
  }

  const parsedAge = age ? Number(age) : undefined;
  if (age && (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120)) {
    fieldErrors.age = 'Enter an age between 13 and 120';
  }

  const allowedGenders = new Set(['', 'male', 'female', 'non-binary', 'other', 'prefer-not-to-say']);
  if (!allowedGenders.has(gender || '')) {
    fieldErrors.gender = 'Select a valid gender option';
  }

  if (bio && bio.trim().length > 240) {
    fieldErrors.bio = 'Bio cannot exceed 240 characters';
  }

  if (req.uploadError) {
    fieldErrors.avatar = req.uploadError;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return renderProfile(res, 422, {
      ...account.toObject(),
      fullName,
      age,
      gender,
      bio
    }, fieldErrors);
  }

  account.fullName = fullName.trim();
  account.age = parsedAge;
  account.gender = gender || '';
  account.bio = bio ? bio.trim() : '';

  if (req.file) {
    account.avatarUrl = `/uploads/${req.file.filename}`;
  }

  await account.save();

  flashSuccess(req, 'Profile updated successfully');
  return res.redirect('/console/profile');
};

module.exports = {
  showProfile,
  updateProfile
};
