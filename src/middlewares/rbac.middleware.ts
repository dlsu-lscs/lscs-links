import { Request, Response, NextFunction } from 'express';
import linkModel from '../models/link.model';
import { canModify } from '../lib/permissions';

export const requireModfiyPermisson = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(`[RBAC] Checking modify permission for link ID: ${req.params.id}`);
  try {
    const member = req.member!;
    const link = await linkModel.findById(req.params.id);

    if (!link) {
      console.log(`[RBAC] Link not found: ${req.params.id}`);
      return res
        .status(404)
        .json({ status: 'error', message: 'Link not found' });
    }

    if (!canModify(member, link)) {
      console.log(`[RBAC] Permission denied for user ${member.email} on link ${link.shortlink}`);
      return res.status(403).json({
        status: 'error',
        message: '[ERROR] You do not have permission to modify this link',
      });
    }

    console.log(`[RBAC] Permission granted for user ${member.email}`);
    (req as any).link = link;
    next();
  } catch (error) {
    console.error('[RBAC] Internal check failed:', error);
    res.status(500).json({
      status: 'error',
      message: '[ERROR] Internal RBAC check failed',
    });
  }
};
