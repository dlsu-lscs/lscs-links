import { MemberPayload } from '../types/models.types';
import { Document } from 'mongoose';

export const canRead = (
  member: MemberPayload,
  committee_id: String,
): boolean => {
  if (
    ['Executive Vice President', 'President'].includes(
      member.position_name as string,
    )
  )
    return true;

  return member.committee_id === committee_id;
};

export const canModify = (
  member: MemberPayload,
  link: Document & { created_by: string; committee_id: string },
): boolean => {
  const { position_name, email, committee_id } = member;

  // EVP and PRES → can edit/delete any
  if (['Executive Vice President', 'President'].includes(position_name))
    return true;

  // VP → can edit/delete within their own committee
  if (position_name === 'Vice President' && link.committee_id === committee_id)
    return true;

  // Regular members can only modify their own link
  if (email === link.created_by) return true;

  return false;
};
