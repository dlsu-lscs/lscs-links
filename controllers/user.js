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

    const lscs = await axios.post(
      'https://auth.app.dlsu-lscs.org/member',
      `{ "email": "${response.data.email}" }`, // Pass the ID in the request body
      {
        headers: {
          Authorization: `Bearer ${process.env.LSCS_API_KEY}`, // Use the API key from the environment variables
          'Content-Type': 'application/json',
        },
      }
    );

    if (lscs.data.state == "absent")
      return res.status(400).send({ status: 'error', error: "Not an LSCS member" })

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

module.exports = router;
