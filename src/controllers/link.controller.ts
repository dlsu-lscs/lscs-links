import { Request, Response } from 'express';
import path from 'path';
import LinkModel from '../models/link.model';
import analyticsMiddleware from '../middlewares/analytics.middleware';

const getShortLink = async (req: Request, res: Response) => {
  let { shortlink } = req.params;
  shortlink = (shortlink || '').trim();

  if (!shortlink || shortlink === 'favicon.ico') {
    return res.status(204).end();
  }

  try {
    const link = await LinkModel.findOne({ shortlink: shortlink });

    if (!link) {
      return res
        .status(404)
        .sendFile(path.join(__dirname, '../../public/404.html'));
    }

    analyticsMiddleware.onClick(req.path, (req.query.type as string) || 'link');
    return res.redirect(link.longlink);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .sendFile(path.join(__dirname, '../../public/error.html'));
  }
};

export default { getShortLink };
