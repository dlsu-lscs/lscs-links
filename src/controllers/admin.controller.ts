import { Request, Response } from 'express';
import linkModel from '../models/link.model';
import { canModify, canRead } from '../lib/permissions';
import { CreateLinksRequest, MemberPayload } from '../types/models.types';

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
      shortlink,
      longlink,
      pinned = false,
      committee_id,
    } = req.body as CreateLinksRequest; 


    // RBAC: Only VP, EVP, PRES can pin
    if (
      pinned &&
      !['VP', 'EVP', 'PRES'].includes(
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
      ['EVP', 'PRES'].includes(member.position_name)
    ) {
      // EVP/PRES can assign any committee_id or null for personal links
      finalCommitteeId = committee_id ?? null;
    } else if (
      member.position_name === 'VP' ||
      member.position_name === 'AVP'
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
      shortlink,
      longlink,
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

//RAED ALL LINKS (with pagination and RBAC and pinned sorting)
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
      ['EVP', 'PRES'].includes(member.position_name)
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

//READ LINK BY ID (with RBAC)
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

// UPDATE LINK BY ID (with RBAC + pinned + max length)
const updateLinkByID = async (req: Request, res: Response) => {
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

    if (!canModify(member, link)) {
      return res.status(403).json({
        status: 'error',
        message: '[ERROR] You do not have permission to edit this link',
      });
    }

    const { shortlink, longlink, pinned, committee_id } = req.body;


    // RBAC: Only VP, EVP, PRES can set pinned links
    if (
      pinned !== undefined &&
      pinned === true &&
      !['VP', 'EVP', 'PRES'].includes(
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
      ['EVP', 'PRES'].includes(member.position_name)
    ) {
      // EVP/PRES can assign any committee_id or null
      finalCommitteeId = committee_id ?? link.committee_id ?? null;
    } else if (
      member.position_name === 'VP' ||
      member.position_name === 'AVP'
    ) {
      // VP/AVP → assigned committee only
      finalCommitteeId = member.committee_id ?? null;
    } else {
      // Regular members → personal links only
      finalCommitteeId = null;
    }

    // Constraint: Pinned links must have a valid committee_id
    if (pinned === true && !finalCommitteeId) {
      return res.status(400).json({
        status: 'error',
        message: '[ERROR] Pinned links must have a valid committee_id',
      });
    }

    // Update fields
    link.shortlink = shortlink || link.shortlink;
    link.longlink = longlink || link.longlink;
    link.pinned = pinned !== undefined ? pinned : link.pinned;
    link.committee_id = finalCommitteeId;
    link.created_at = req.body.created_at || link.created_at;

    const savedLink = await link.save();

    return res.status(200).json({
      status: 'ok',
      link: savedLink,
    });
  } catch (error) {
    console.error('[ERROR] Update Link:', error);
    return res.status(500).json({
      status: 'error',
      message: `[ERROR] Internal Server Error - ${error instanceof Error ? error.message : error}`,
    });
  }
};

// DELETE LINK BY ID (with RBAC)
const deleteLinkByID = async (req: Request, res: Response) => {
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

    if (!canModify(member, link)) {
      return res.status(403).json({
        status: 'error',
        message: '[ERROR] You do not have permission to delete this link',
      });
    }

    await linkModel.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'ok',
      message: 'Link deleted successfully',
    });
  } catch (error) {
    console.error('[ERROR] Delete Link:', error);
    return res.status(500).json({
      status: 'error',
      message: `[ERROR] Internal Server Error - ${error instanceof Error ? error.message : error}`,
    });
  }
};

export { createLink, getAllLinks, getLinkByID, updateLinkByID, deleteLinkByID };
