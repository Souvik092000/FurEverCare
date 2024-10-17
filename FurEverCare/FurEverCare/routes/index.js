const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Home page route
router.get('/', userController.homePage);

module.exports = router;
