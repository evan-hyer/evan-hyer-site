import { z } from 'zod';
import { RequestError } from '../../../packages/server/src/request-error';
import { Profile, type ProfileData } from '../contracts/index';
export function getProfile(profile: ProfileData, query: unknown = {}) {
  if (!z.object({}).strict().safeParse(query).success)
    throw new RequestError(400, 'Unsupported query parameter.');
  return Profile.parse(profile);
}
