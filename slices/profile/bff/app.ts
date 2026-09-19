import { z } from 'zod';
import {
  baseApp,
  finishApp,
  type FailureMode,
} from '../../../packages/server/src/index';
import { profile } from '../data/profile';
import { Profile } from '../contracts/index';
export function createApp(mode?: FailureMode) {
  const app = baseApp('profile', mode);
  app.get('/api/profile', (req, res) => {
    if (!z.object({}).strict().safeParse(req.query).success) {
      res.status(400).json({ error: 'Unsupported query parameter.' });
      return;
    }
    res.json(Profile.parse(profile));
  });
  return finishApp(app);
}
