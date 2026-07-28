const Account = require('../models/Account');

const attachCurrentUser = async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.appName = process.env.APP_NAME || 'LumenPortal';

  if (!req.session.accountId) {
    return next();
  }

  try {
    const account = await Account.findById(req.session.accountId).select('-passwordHash');
    if (account && account.isActive) {
      res.locals.currentUser = account;
    } else {
      req.session.destroy(() => {});
    }
  } catch (_error) {
    req.session.destroy(() => {});
  }

  return next();
};

module.exports = attachCurrentUser;
