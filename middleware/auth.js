const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Token not found, authentication failed' });
  }

  try {
    console.log(token)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    console.log("passed here")
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If the request specified a Google Workspace domain:
    // const domain = payload['hd'];
    console.log(payload)
  }
  catch (e) {
    console.error('CRITICAL auth middleware error', e);
  }
  // NOTE: deprecated for google auth

  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ status: 'error', message: 'Invalid token, access denied' });
  //
  //   req.user = user; // Save the user info for the next middleware
  //   next();
  // });
}

module.exports = auth
