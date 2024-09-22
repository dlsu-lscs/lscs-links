const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const userModel = require('../models/user');
const userAuthMiddleware = require('../middleware/auth');
const userAuth = userAuthMiddleware;

// Create User

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).send({ status: 'error', error: 'Email and password are required.' });
  }

  try {
    // Find the user by email
    const user = await userModel.findOne({ email }).exec();
    if (!user) {
      return res.status(400).send({ status: 'error', error: 'User not found.' });
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).send({ status: 'error', error: 'Incorrect password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Payload
      process.env.JWT_SECRET,                  // Secret key (set in environment)
      { expiresIn: '1h' }                      // Token expiration time
    );

    // Update last_login time
    user.last_login = new Date().toISOString();
    await user.save();

    // Send the token to the client
    res.status(200).send({
      status: 'success',
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, name, password, orgs } = req.body;
    if (!email || !email.endsWith('@dlsu.edu.ph')) {
      return res.status(400).send({ status: 'error', error: 'Invalid email address.' });
    }
    if (!password) {
      return res.status(400).send({ status: 'error', error: 'Password is required.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      email,
      name,
      password: hashedPassword,
      orgs,
      created_at: new Date().toISOString(),
      last_login: null
    });
    await newUser.save();
    res.status(201).send({ status: 'success', user: newUser });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

// Read User
router.get('/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ status: 'error', error: 'User not found.' });
    }
    res.status(200).send({ status: 'success', user });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

// Update User
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await userModel.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) {
      return res.status(404).send({ status: 'error', error: 'User not found.' });
    }
    res.status(200).send({ status: 'success', user });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

// Delete User
router.delete('/:id', async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send({ status: 'error', error: 'User not found.' });
    }
    res.status(200).send({ status: 'success', message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

module.exports = router;
