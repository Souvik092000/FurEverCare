const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureAdmin } = require('../middlewares/auth');

// Admin dashboard and doctor approval
router.get('/dashboard', ensureAuthenticated, ensureAdmin, adminController.dashboard);
router.get('/approve-doctors', ensureAuthenticated, ensureAdmin, adminController.approveDoctorPage);
router.post('/approve-doctors/:id', ensureAuthenticated, ensureAdmin, adminController.approveDoctor);
router.get('/approve-users', ensureAuthenticated, ensureAdmin, adminController.approveUserPage);
router.post('/approve-users/:id', ensureAuthenticated, ensureAdmin, adminController.approveUser);

// Admin product management
router.get('/products', ensureAuthenticated, ensureAdmin, adminController.adminListProducts);
router.get('/products/add', ensureAuthenticated, ensureAdmin, adminController.addProductPage);
router.post('/products/add', ensureAuthenticated, ensureAdmin, adminController.upload, adminController.addProduct);
router.get('/products/:id', ensureAuthenticated, ensureAdmin, adminController.viewProduct);
router.get('/products/edit/:id', ensureAuthenticated, ensureAdmin, adminController.editProductPage);
router.post('/products/edit/:id', ensureAuthenticated, ensureAdmin, adminController.upload, adminController.editProduct);
router.post('/products/delete/:id', ensureAuthenticated, ensureAdmin, adminController.deleteProduct);


module.exports = router;
