const express = require('express');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const router = express.Router();
const userModel = require('../models/user');
const userAuthMiddleware = require('../middleware/auth');
const userAuth = userAuthMiddleware;
const axios = require('axios');

// NOTE:- Deprecated for LSCS Auth.

// // Create User
//
router.post('/login', async (req, res) => {
  const { token } = req.body;
  console.log('called')
  // Check if email and password are provided
  if (!token) {
    return res.status(400).send({ status: 'error', error: 'Google access token required.' });
  }

  try {

    // TODO: LSCS member validation
    // TODO: token refresh

    // NOTE: validates google login only, dlsu email and lscs member verification is handled in the frontend
    // TODO: handle dlsu member validation backend
    //
    // TODO: verify access token, check error, if good, generate server-end JWT token, give to frontend, ..-
    // TODO: -.. use that as header token for the endpoints

    const response = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      params: { access_token: token },
    });

    console.log('passed response:', response.data)

    if (response.error != undefined || response.error != null) {
      return res.status(400).send({ status: 'error', error: 'Invalid google access token' });
    }

    // checks if the login client id matches with the backend client id 
    if (response.data.audience != process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).send({ status: 'error', error: 'Invalid gogole access token [#2]' });
    }
    // Generate JWT token
    const jwt_token = jwt.sign(
      response.data, // Payload
      process.env.JWT_SECRET,                  // Secret key (set in environment)
    );

    // Update last_login time
    // user.last_login = new Date().toISOString();
    // await user.save();


    console.log('success', jwt_token)
    // Send the token to the client
    return res.status(200).send({
      status: 'success',
      jwt_token,
    });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

// router.post('/register', async (req, res) => {
//   try {
//     const { email, name, password, orgs } = req.body;
//     if (!email || !email.endsWith('@dlsu.edu.ph')) {
//       return res.status(400).send({ status: 'error', error: 'Invalid email address.' });
//     }
//     if (!password) {
//       return res.status(400).send({ status: 'error', error: 'Password is required.' });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new userModel({
//       email,
//       name,
//       password: hashedPassword,
//       orgs,
//       created_at: new Date().toISOString(),
//       last_login: null
//     });
//     await newUser.save();
//     res.status(201).send({ status: 'success', user: newUser });
//   } catch (error) {
//     res.status(500).send({ status: 'error', error: error.message });
//   }
// });
//
// // Read User
// router.get('/:id', async (req, res) => {
//   try {
//     const user = await userModel.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send({ status: 'error', error: 'User not found.' });
//     }
//     res.status(200).send({ status: 'success', user });
//   } catch (error) {
//     res.status(500).send({ status: 'error', error: error.message });
//   }
// });
//
// // Update User
// router.put('/:id', async (req, res) => {
//   try {
//     const updates = req.body;
//     if (updates.password) {
//       updates.password = await bcrypt.hash(updates.password, 10);
//     }
//     const user = await userModel.findByIdAndUpdate(req.params.id, updates, { new: true });
//     if (!user) {
//       return res.status(404).send({ status: 'error', error: 'User not found.' });
//     }
//     res.status(200).send({ status: 'success', user });
//   } catch (error) {
//     res.status(500).send({ status: 'error', error: error.message });
//   }
// });
//
// // Delete User
// router.delete('/:id', async (req, res) => {
//   try {
//     const user = await userModel.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).send({ status: 'error', error: 'User not found.' });
//     }
//     res.status(200).send({ status: 'success', message: 'User deleted successfully.' });
//   } catch (error) {
//     res.status(500).send({ status: 'error', error: error.message });
//   }
// });
//
module.exports = router;
