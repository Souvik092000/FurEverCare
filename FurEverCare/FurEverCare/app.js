require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const Doctor = require('./models/Doctor');
const User = require('./models/User');
const Cart = require('./models/Cart');

// Connect to MongoDB
mongoose.connect(process.env.DB_URL,);

// Initialize view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Initialize session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minutes
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set local variables
app.use(async (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.email === 'souvikeva@gmail.com') {
      req.user.role = 'admin';
      req.user.approved = true; // Ensure admin is always approved
      await req.user.save();
    }

    if (req.user.role === 'admin') {
      const pendingApprovals = await Doctor.countDocuments({ approved: false });
      const pendingUserApprovals = await User.countDocuments({ approved: false });
      res.locals.pendingApprovals = pendingApprovals;
      res.locals.pendingUserApprovals = pendingUserApprovals;
    } else {
      const cart = await Cart.findOne({ userId: req.user._id });
      res.locals.cartItemCount = cart ? cart.items.length : 0;
    }
  } else {
    res.locals.pendingApprovals = 0;
    res.locals.pendingUserApprovals = 0;
    res.locals.cartItemCount = 0;
  }

  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.user = req.user || null;
  res.locals.isAdmin = req.user && req.user.role === 'admin';
  next();
});




// Import routes
const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');
const userRouter = require('./routes/user');

// Use routes
app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);
app.use('/user', userRouter);


// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
