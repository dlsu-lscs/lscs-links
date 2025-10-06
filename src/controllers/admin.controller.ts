import { Request, Response } from 'express';
import linkModel from '../models/link.model';
import { canRead } from '../lib/permissions';
import { MemberPayload } from '../types/models.types';

//CREATE LINK (with RBAC and pinned links)
const createLink = async (req: Request, res: Response) => {
  try {
    const member = req.member as MemberPayload;

    if (!member) {
      return res.status(401).json({
        status: 'error',
        message: '[ERROR] Unauthorized — no member found in request',
      });
    }

    const {
      shortLink,
      longLink,
      pinned = false,
      committee_id,
    } = req.body as {
      shortLink: string;
      longLink: string;
      pinned?: boolean;
      committee_id?: string | null;
    };

    // RBAC: Only VP, EVP, PRES can pin
    if (
      pinned &&
      !['Vice President', 'Executive Vice President', 'President'].includes(
        member.position_name,
      )
    ) {
      return res.status(403).json({
        status: 'error',
        message: '[ERROR] Only VP, EVP, or PRES can set pinned links',
      });
    }

    // Determine final committee_id based on position
    let finalCommitteeId: string | null = null;

    if (
      ['Executive Vice President', 'President'].includes(member.position_name)
    ) {
      // EVP/PRES can assign any committee_id or null for personal links
      finalCommitteeId = committee_id ?? null;
    } else if (
      member.position_name === 'Vice President' ||
      member.position_name === 'Associate Vice President'
    ) {
      // VP and AVP → assigned committee only
      finalCommitteeId = member.committee_id ?? null;
    } else {
      // Regular members → personal links only
      finalCommitteeId = null;
    }

    // Constraint: Pinned links must have a valid committee_id
    if (pinned && !finalCommitteeId) {
      return res.status(400).json({
        status: 'error',
        message: '[ERROR] Pinned links must have a valid committee_id',
      });
    }

    const newLink = new linkModel({
      shortLink,
      longLink,
      created_at: new Date(),
      created_by: member.email,
      committee_id: finalCommitteeId,
      pinned,
    });

    const savedLink = await newLink.save();

    return res.status(201).json({
      status: 'ok',
      link: savedLink,
    });
  } catch (error) {
    console.error('[ERROR] Create Link:', error);
    return res.status(500).json({
      status: 'error',
      message: `[ERROR] Internal Server Error - ${error instanceof Error ? error.message : error}`,
    });
  }
};

//GET ALL LINKS (with pagination and RBAC and pinned sorting)
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

//GET LINK BY ID (with RBAC)
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

export { createLink, getAllLinks, getLinkByID };
