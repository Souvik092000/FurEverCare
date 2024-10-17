const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Render home page
exports.homePage = (req, res) => {
  res.render('home', {
    isAuthenticated: req.isAuthenticated(),
    isAdmin: req.user ? req.user.role === 'admin' : false,
    user: req.user
  });
};

// Render user dashboard
exports.userDashboard = async (req, res) => {
  try {
    const bookings = await Appointment.find({ user: req.user._id }).populate('doctor');
    res.render('user/dashboard', {
      isAuthenticated: req.isAuthenticated(),
      user: req.user,
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    req.flash('error_msg', 'Error fetching bookings');
    res.redirect('/');
  }
};

// Render user products page
exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.render('user/products', {
      products,
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.role === 'admin' : false,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    req.flash('error_msg', 'Error fetching products');
    res.redirect('/');
  }
};

// Render single product page
exports.viewProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render('user/product', {
      product,
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.role === 'admin' : false,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    req.flash('error_msg', 'Error fetching product');
    res.redirect('/user/products');
  }
};

// Render cart page
exports.viewCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.product');
    res.render('user/cart', {
      cart,
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.role === 'admin' : false,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    req.flash('error_msg', 'Error fetching cart');
    res.redirect('/user/products');
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }
    const productIndex = cart.items.findIndex(item => item.product.toString() === req.params.id);
    if (productIndex > -1) {
      cart.items[productIndex].quantity += 1;
    } else {
      cart.items.push({ product: req.params.id, quantity: 1 });
    }
    await cart.save();
    res.redirect('/user/cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    req.flash('error_msg', 'Error adding to cart');
    res.redirect('/user/products');
  }
};

// Update cart
exports.updateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      const productIndex = cart.items.findIndex(item => item.product.toString() === req.body.productId);
      if (productIndex > -1) {
        cart.items[productIndex].quantity = req.body.quantity;
      }
      await cart.save();
    }
    res.redirect('/user/cart');
  } catch (error) {
    console.error('Error updating cart:', error);
    req.flash('error_msg', 'Error updating cart');
    res.redirect('/user/cart');
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(item => item.product.toString() !== req.params.id);
      await cart.save();
    }
    res.redirect('/user/cart');
  } catch (error) {
    console.error('Error removing from cart:', error);
    req.flash('error_msg', 'Error removing from cart');
    res.redirect('/user/cart');
  }
};

// Render book doctor page
exports.bookDoctorPage = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', approved: true });
    console.log('Fetched Doctors:', doctors);
    res.render('user/bookDoctor', {
      doctors,
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.role === 'admin' : false,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    req.flash('error_msg', 'Error fetching doctors');
    res.redirect('/user/dashboard');
  }
};

// Book doctor
exports.bookDoctor = async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const appointment = new Appointment({
      user: req.user._id,
      doctor: doctorId,
      date,
      status: 'Pending'
    });
    await appointment.save();
    req.flash('success_msg', 'Appointment booked successfully');
    res.redirect('/user/appointments');
  } catch (error) {
    console.error('Error booking appointment:', error);
    req.flash('error_msg', 'Error booking appointment');
    res.redirect('/user/book-doctor');
  }
};

// Render appointments page
exports.listAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).populate('doctor').exec();
    
    // Debug: Log appointments to check doctor population
    console.log('Appointments:', appointments);

    res.render('user/appointments', {
      appointments,
      isAuthenticated: req.isAuthenticated(),
      isAdmin: req.user ? req.user.role === 'admin' : false,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    req.flash('error_msg', 'Error fetching appointments');
    res.redirect('/user/dashboard');
  }
};



// Search functionality
exports.search = async (req, res) => {
  const query = req.query.query;
  try {
    const products = await Product.find({ name: { $regex: query, $options: 'i' } });
    const doctors = await Doctor.find({ name: { $regex: query, $options: 'i' } });
    res.render('searchResults', { products, doctors, query });
  } catch (error) {
    console.error('Error during search:', error);
    req.flash('error_msg', 'Error during search');
    res.redirect('/');
  }
};

exports.apiSignupDoctor = async (req, res) => {
  try {
    const { name, email, specialty } = req.body;
    const doctor = new Doctor({ name, email, specialty });
    await doctor.save();
    res.status(201).json({ message: 'Doctor signup request sent' });
  } catch (error) {
    console.error('Error signing up doctor:', error);
    res.status(500).json({ message: 'Error signing up doctor', error });
  }
};

exports.apiBookDoctor = async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const appointment = new Appointment({
      user: req.user._id,
      doctor: doctorId,
      date,
      status: 'Pending'
    });
    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Error booking appointment', error });
  }
};

exports.apiListAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).populate('doctor');
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
};
