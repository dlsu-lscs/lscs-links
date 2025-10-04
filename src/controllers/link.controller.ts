import { Request, Response } from 'express';
import LinkModel from '../models/link.model';
import analyticsMiddleware from '../middlewares/analytics.middleware';

const getShortLink = async (req: Request, res: Response) => {
  const { shortLink } = req.params;

  if (!shortLink) {
    return res.status(400).json({
      status: 'error',
      message: '[ERROR] Invalid Link, Short Link is Required',
    });
  }

  try {
    const link = await LinkModel.findOne({ shortLink: shortLink });

    if (!link) {
      return res
        .status(404)
        .json({ status: 'error', message: '[ERROR] Link Not Found' });
    }

    analyticsMiddleware.onClick(req.path, (req.query.type as string) || 'link');
    return res.redirect(link.longLink);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 'error', message: '[ERROR] Internal Server Error' });
  }
};

export default { getShortLink };
