import {
  baseApp,
  finishApp,
  type FailureMode,
} from '../../../packages/server/src/index';
import { insights } from '../data/insights';
import { getInsight, listInsights } from './service';
export function createApp(mode?: FailureMode) {
  const app = baseApp('insights', mode);
  app.get('/api/insights', (req, res) => {
    res.json(listInsights(insights, req.query));
  });
  app.get('/api/insights/:slug', (req, res) => {
    res.json(getInsight(insights, req.params.slug, req.query));
  });
  return finishApp(app);
}
