import { MemberPayload } from '../types/models.types';
import { Document } from 'mongoose';

export const canRead = (
  member: MemberPayload,
  committee_id: string | null,
): boolean => {
  if (
    ['EVP', 'PRES'].includes(
      member.position_id as string,
    )
  )
    return true;

  return member.committee_id === committee_id;
};

export const canModify = (
  member: MemberPayload,
  link: Document & { created_by: string; committee_id: string | null },
): boolean => {
  const { position_id, email, committee_id } = member;

  // EVP and PRES → can edit/delete any
  if (['EVP', 'PRES'].includes(position_id))
    return true;

  // VP → can edit/delete within their own committee
  if (position_id === 'VP' && link.committee_id === committee_id)
    return true;

  // Regular members can only modify their own link
  if (email === link.created_by) return true;

  return false;
};
