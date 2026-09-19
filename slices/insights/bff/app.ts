import { z } from 'zod';
import {
  baseApp,
  finishApp,
  type FailureMode,
} from '../../../packages/server/src/index';
import { insights } from '../data/insights';
import { Insights, Insight } from '../contracts/index';
const query = z.object({ topic: z.string().max(80).optional() }).strict();
export function createApp(mode?: FailureMode) {
  const app = baseApp('insights', mode);
  app.get('/api/insights', (req, res) => {
    const parsed = query.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: 'Use a single topic of up to 80 characters.' });
      return;
    }
    res.json(
      Insights.parse(
        insights.filter(
          (p) => !parsed.data.topic || p.topic === parsed.data.topic,
        ),
      ),
    );
  });
  app.get('/api/insights/:slug', (req, res) => {
    if (
      Object.keys(req.query).length ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(req.params.slug)
    ) {
      res.status(400).json({ error: 'Invalid insight request.' });
      return;
    }
    const insight = insights.find((p) => p.slug === req.params.slug);
    if (!insight) {
      res.status(404).json({ error: 'Insight not found.' });
      return;
    }
    res.json(Insight.parse(insight));
  });
  return finishApp(app);
}
