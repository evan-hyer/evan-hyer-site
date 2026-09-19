import { z } from 'zod';
export const Profile = z
  .object({
    name: z.string(),
    role: z.string(),
    introduction: z.string(),
    linkedin: z.url(),
    about: z.array(z.string()),
    interests: z.array(z.string()),
  })
  .strict();
export type ProfileData = z.infer<typeof Profile>;
export const parseProfile = (value: unknown) => Profile.parse(value);
