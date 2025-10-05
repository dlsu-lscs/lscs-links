import { Request, Response, NextFunction } from 'express';
import linkModel from '../models/link.model';
import { canModify } from '../lib/permissions';

export const requireModfiyPermisson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const member = req.member!;
    const link = await linkModel.findById(req.params.id);

    if (!link) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Link not found' });
    }

    if (!canModify(member, link)) {
      return res.status(403).json({
        status: 'error',
        message: '[ERROR] You do not have permission to modify this link',
      });
    }

    (req as any).link = link;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '[ERROR] Internal RBAC check failed',
    });
  }
};
