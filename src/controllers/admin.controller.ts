import { Request, Response } from 'express';
import linkModel from '../models/link.model';
import { canRead } from '../lib/permissions';

const getAllLinks = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.error('[ERROR] Get All Links:', error);
    return res.status(500).json({
      status: 'error',
      message: `[ERROR] Internal Server Error - ${error instanceof Error ? error.message : error}`,
    });
  }
};

const getLinkByID = async (req: Request, res: Response) => {
  try {
    const member = req.member;

    if (!member) {
      return res.status(401).json({
        status: 'error',
        message: '[ERROR] Unauthorized — no member found in request',
      });
    }

    const link = await linkModel.findById(req.params.id);

    if (!link) {
      return res.status(404).json({
        status: 'error',
        message: '[ERROR] Link not found',
      });
    }

    // Ensure committee_id is treated as string | null
    const committee_id: string | null = link.committee_id
      ? String(link.committee_id)
      : null;

    // Check read permission
    const allowed = canRead(member, committee_id);

    if (!allowed) {
      return res.status(403).json({
        status: 'error',
        message: '[ERROR] Access denied — not allowed to view this link',
      });
    }

    return res.status(200).json({
      status: 'ok',
      link,
    });
  } catch (error) {
    console.error('[ERROR] Get Link By ID:', error);
    return res.status(500).json({
      status: 'error',
      message: `[ERROR] Internal Server Error - ${error instanceof Error ? error.message : error}`,
    });
  }
};

export { getAllLinks, getLinkByID };
