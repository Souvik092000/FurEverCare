const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');

// User-related API routes
router.post('/signup', userController.apiSignupDoctor);
router.post('/book-doctor', ensureAuthenticated, userController.apiBookDoctor);
router.get('/appointments', ensureAuthenticated, userController.apiListAppointments);

// Admin-related API routes
router.post('/approve-doctor/:id', ensureAuthenticated, ensureAdmin, adminController.apiApproveDoctor);

module.exports = router;
