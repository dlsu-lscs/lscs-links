import { Request, Response } from 'express';
import axios from 'axios';
import jwt, { JwtPayload } from 'jsonwebtoken';

const userLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  console.log('[LOGIN STARTED]');

  if (!token) {
    return res
      .status(400)
      .json({ status: 'error', message: '[ERROR] GOOGLE TOKEN IS REQUIRED' });
  }

  try {
    const googleResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v1/tokeninfo',
      {
        params: { access_token: token },
      },
    );

    console.log('[GOOGLE RESPONSE]:', googleResponse.data);

    if (googleResponse.data.error) {
      return res
        .status(401)
        .json({ status: 'error', message: '[ERROR] INVALID GOOGLE TOKEN' });
    }

    if (googleResponse.data.audience != process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({
        status: 'error',
        message: '[ERROR] INVALID ENV GOOGLE CLIENT ID',
      });
    }

    const lscsResponse = await axios.post(
      'https://core.api.dlsu-lscs.org/member',
      { email: googleResponse.data.email },
      {
        headers: {
          Authorization: `Bearer ${process.env.LSCS_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (lscsResponse.data.state === 'absent') {
      return res
        .status(400)
        .json({ status: 'error', error: 'Not an LSCS member' });
    }

    const memberData = lscsResponse.data;

    // Generate backend JWT with RBAC info
    const jwtToken = jwt.sign(
      {
        email: googleResponse.data.email,
        sub: googleResponse.data.user_id,
        committee_id: memberData.committee_id,
        committee_name: memberData.committee_name,
        position_id: memberData.position_id,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    console.log('[SUCCESS] ', jwtToken);

    return res.status(200).json({
      status: 'success',
      jwtToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      error: `[ERROR] ${error instanceof Error ? error.message : String(error)}`,
    });
  }
};

export default { userLogin };
