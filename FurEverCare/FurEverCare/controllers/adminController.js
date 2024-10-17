const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

// Configure multer for image uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASSWORD,
  },
});
// Render admin dashboard
exports.dashboard = async (req, res) => {
  try {
    const pendingDoctors = await Doctor.find({ approved: false });
    const pendingUsers = await User.find({ approved: false });

    console.log('Pending Doctors:', pendingDoctors); // Debugging line
    console.log('Pending Users:', pendingUsers); // Debugging line

    res.render('admin/dashboard', { pendingDoctors, pendingUsers });
  } catch (error) {
    console.error('Error fetching data for dashboard:', error);
    req.flash('error_msg', 'Error fetching data for dashboard');
    res.redirect('/');
  }
};

// Render approve doctors page
exports.approveDoctorPage = async (req, res) => {
  try {
    const doctors = await Doctor.find({ approved: false });
    res.render('admin/approveDoctors', { doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    req.flash('error_msg', 'Error fetching doctors');
    res.redirect('/admin/dashboard');
  }
};

// Approve doctor
exports.approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      req.flash('error_msg', 'Doctor not found');
      return res.redirect('/admin/approve-doctors');
    }
    doctor.approved = true;
    await doctor.save();
    req.flash('success_msg', 'Doctor approved successfully');
    res.redirect('/admin/approve-doctors');
  } catch (error) {
    console.error('Error approving doctor:', error);
    req.flash('error_msg', 'Error approving doctor');
    res.redirect('/admin/approve-doctors');
  }
};

// Render approve users page
exports.approveUserPage = async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.render('admin/approveUsers', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    req.flash('error_msg', 'Error fetching users');
    res.redirect('/admin/dashboard');
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/admin/approve-users');
    }
    user.approved = true;
    await user.save();

    // Send activation email to user
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: user.email,
      subject: 'Account Activation',
      text: `Dear ${user.username},\n\nYour account has been approved by the admin. You can now log in to your account.\n\nRegards,\nFurEverCare Team`
    };

    await transporter.sendMail(mailOptions);
    console.log('Activation email sent to user.');

    req.flash('success_msg', 'User approved and activation email sent successfully');
    res.redirect('/admin/approve-users');
  } catch (error) {
    console.error('Error approving user:', error);
    req.flash('error_msg', 'Error approving user');
    res.redirect('/admin/approve-users');
  }
};

// Render add product page
exports.addProductPage = (req, res) => {
  res.render('admin/addProduct');
};

// Add product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file.filename;

    const product = new Product({ name, description, price, image });
    await product.save();
    req.flash('success_msg', 'Product added successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error adding product:', error);
    req.flash('error_msg', 'Error adding product');
    res.redirect('/admin/add-product');
  }
};

// Render edit product page
exports.editProductPage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/admin/products');
    }
    res.render('admin/editProduct', { product });
  } catch (error) {
    console.error('Error fetching product:', error);
    req.flash('error_msg', 'Error fetching product');
    res.redirect('/admin/products');
  }
};

// Edit product
exports.editProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const update = { name, description, price };

    if (req.file) {
      update.image = req.file.filename;
    }

    await Product.findByIdAndUpdate(req.params.id, update);
    req.flash('success_msg', 'Product updated successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error updating product:', error);
    req.flash('error_msg', 'Error updating product');
    res.redirect(`/admin/products/edit/${req.params.id}`);
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Product deleted successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error deleting product:', error);
    req.flash('error_msg', 'Error deleting product');
    res.redirect('/admin/products');
  }
};

// View product
exports.viewProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/admin/products');
    }
    res.render('admin/viewProduct', {
      product,
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.role === 'admin' : false,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    req.flash('error_msg', 'Error fetching product');
    res.redirect('/admin/products');
  }
};

// List products
exports.adminListProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.render('admin/products', {
      products,
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.role === 'admin' : false,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    req.flash('error_msg', 'Error fetching products');
    res.redirect('/admin/dashboard');
  }
};

// API Method to approve doctor
exports.apiApproveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    doctor.approved = true;
    await doctor.save();
    res.status(200).json({ message: 'Doctor approved successfully' });
  } catch (error) {
    console.error('Error approving doctor:', error);
    res.status(500).json({ message: 'Error approving doctor', error });
  }
};

exports.upload = upload.single('image');
