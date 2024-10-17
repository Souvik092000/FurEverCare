const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { ensureAuthenticated } = require('../middlewares/auth');

// User authentication routes
router.get('/signup', authController.signupPage);
router.post('/signup', authController.signup);
router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/dashboard', ensureAuthenticated, userController.userDashboard);

// User product operations
router.get('/products', userController.listProducts);
router.get('/products/:id', userController.viewProduct);

// User cart operations
router.get('/cart', ensureAuthenticated, userController.viewCart);
router.post('/cart/add/:id', ensureAuthenticated, userController.addToCart);
router.post('/cart/update', ensureAuthenticated, userController.updateCart);
router.post('/cart/remove/:id', ensureAuthenticated, userController.removeFromCart);

// User appointment operations
router.get('/appointments', ensureAuthenticated, userController.listAppointments);
router.get('/book-doctor', ensureAuthenticated, userController.bookDoctorPage);
router.post('/book-doctor', ensureAuthenticated, userController.bookDoctor);

// Search route
router.get('/search', userController.search);

module.exports = router;
