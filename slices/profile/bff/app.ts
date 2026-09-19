import {
  baseApp,
  finishApp,
  type FailureMode,
} from '../../../packages/server/src/index';
import { profile } from '../data/profile';
import { getProfile } from './service';
export function createApp(mode?: FailureMode) {
  const app = baseApp('profile', mode);
  app.get('/api/profile', (req, res) => {
    res.json(getProfile(profile, req.query));
  });

  return finishApp(app);
}
