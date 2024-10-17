module.exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'Please log in to view this page');
    res.redirect('/login');
  }
};

module.exports.ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  } else {
    req.flash('error_msg', 'You are not authorized to view this page');
    res.redirect('/login');
  }
};
