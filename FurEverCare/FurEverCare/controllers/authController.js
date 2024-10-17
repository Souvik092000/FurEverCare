const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const nodemailer = require('nodemailer');

passport.use(new LocalStrategy({
  usernameField: 'email',
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }

    if (user.email === 'souvikeva@gmail.com') {
      user.role = 'admin';
      user.approved = true; // Ensure admin is always approved
      await user.save();
    } else if (!user.approved) {
      return done(null, false, { message: 'Your signup is not approved by the admin yet.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});

exports.signupPage = (req, res) => {
  res.render('auth/signup');
};

exports.signup = async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;

  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match');
    return res.redirect('/user/signup');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email already exists');
      return res.redirect('/user/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = email === process.env.ADMIN_EMAIL ? 'admin' : role;
    const isApproved = userRole === 'admin';
    const user = new User({ username, email, password: hashedPassword, role: userRole, approved: isApproved });
    await user.save();

    if (userRole === 'doctor') {
      await sendApprovalRequest(user);  // send approval email if the user is a doctor
      req.flash('success_msg', 'Signup successful. Please wait for admin approval.');
      return res.redirect('/user/login');
    } else {
      req.flash('success_msg', 'You are now registered and can log in');
      return res.redirect('/user/login');
    }
  } catch (error) {
    console.error('Error during signup:', error);
    req.flash('error_msg', 'An error occurred during registration');
    return res.redirect('/user/signup');
  }
};

exports.loginPage = (req, res) => {
  res.render('auth/login');
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('error_msg', info.message);
      return res.redirect('/user/login');
    }

    req.logIn(user, (err) => {
      if (err) { return next(err); }

      // Debugging: log the user email and role
      console.log(`Logged in user email: ${user.email}`);
      console.log(`Logged in user role: ${user.role}`);

      // Reset session expiration time on successful login
      req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes

      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/user/dashboard');
      }
    });
  })(req, res, next);
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return next(err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
};


async function sendApprovalRequest(doctor) {
  const adminEmail = process.env.ADMIN_EMAIL;

  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: adminEmail,
    subject: 'Doctor Approval Request',
    text: `A new doctor signup request has been received.\n\nName: ${doctor.username}\nEmail: ${doctor.email}\n\nPlease log in to approve or reject the request.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Approval request email sent to admin.');
  } catch (error) {
    console.error('Error sending approval request email:', error);
  }
}
