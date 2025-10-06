import { Request, Response } from 'express';
import analyticsModel from '../models/analytics.model';
import { AnalyticsType } from '../types/models.types';

const getShortLinksAnalytics = async (req: Request, res: Response) => {
  try {
    const query: AnalyticsType = {
      link: `/${req.params.shortLink}`,
    };

    if (req.query.type != null && req.query.type != undefined) {
      query.type = req.query.type as string;
    }

    console.log('[QUERY] ', query);
    const result = await analyticsModel.find(query).exec();
    res.send({ status: 'ok', count: result });
  } catch (error) {
    res
      .status(400)
      .json({ status: 'error', message: '[ERROR] Invalid Request' });
  }
};

export { getShortLinksAnalytics };
