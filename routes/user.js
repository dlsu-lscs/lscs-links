import { Router } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = Router();

// NOTE:- Deprecated for LSCS Auth.

router.post('/login', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send({ status: 'error', error: 'Google access token required.' });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
      params: { access_token: token },
    });

    console.log('passed response:', response.data);

    if (response.error !== undefined && response.error !== null) {
      return res.status(400).send({ status: 'error', error: 'Invalid google access token' });
    }

    if (response.data.audience !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).send({ status: 'error', error: 'Invalid google access token [#2]' });
    }

    // Generate JWT token
    const jwt_token = jwt.sign(response.data, process.env.JWT_SECRET);

    const lscs = await axios.post(
      'https://auth.app.dlsu-lscs.org/member',
      `{ "email": "${response.data.email}" }`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LSCS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (lscs.data.state === 'absent') {
      return res.status(400).send({ status: 'error', error: 'Not an LSCS member' });
    }

    console.log('success', jwt_token);
    return res.status(200).send({
      status: 'success',
      jwt_token,
    });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

export default router;

