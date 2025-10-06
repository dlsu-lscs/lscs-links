import { Request, Response } from 'express';
import linkModel from '../models/link.model';
import { canRead } from '../lib/permissions';
import { MemberPayload } from '../types/models.types';

const getAllLinks = async (req: Request, res: Response) => {
  try {
    const member = req.member as MemberPayload;

    if (!member) {
      return res.status(401).json({
        status: 'error',
        message: '[ERROR] Unauthorized — no member found in request',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let query: Record<string, any> = {};

    //RBAC:
    // EVP and PRES → can view all committees' links (except personal)
    if (
      ['Executive Vice President', 'President'].includes(member.position_name)
    ) {
      query = { committee_id: { $ne: null } };
    } else {
      // Regular members and VPs → only their committee + personal
      query = {
        $or: [
          { committee_id: member.committee_id },
          { created_by: member.email, committee_id: null }, // their personal links
        ],
      };
    }

    // pinned first, then newest first
    const links = await linkModel
      .find(query)
      .sort({ pinned: -1, created_at: -1 })
      .skip(skip)
      .limit(limit);

    const totalLinks = await linkModel.countDocuments(query);

    return res.status(200).json({
      status: 'ok',
      total: totalLinks,
      page,
      totalPages: Math.ceil(totalLinks / limit),
      data: links,
    });
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
    const member = req.member as MemberPayload;

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
