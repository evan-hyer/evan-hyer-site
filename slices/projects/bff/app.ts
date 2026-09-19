import { z } from 'zod';
import {
  baseApp,
  finishApp,
  type FailureMode,
} from '../../../packages/server/src/index';
import { projects } from '../data/projects';
import { Projects, Project } from '../contracts/index';
const query = z
  .object({
    search: z.string().max(200).optional(),
    tag: z.string().max(80).optional(),
  })
  .strict();
export function createApp(mode?: FailureMode) {
  const app = baseApp('projects', mode);
  app.get('/api/projects', (req, res) => {
    const parsed = query.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error:
          'Use a single search (up to 200 characters) and tag (up to 80 characters).',
      });
      return;
    }
    const search = parsed.data.search?.trim().toLowerCase() || '';
    res.json(
      Projects.parse(
        projects.filter(
          (p) =>
            (!parsed.data.tag || p.tags.includes(parsed.data.tag)) &&
            [p.title, p.summary, ...p.tags]
              .join(' ')
              .toLowerCase()
              .includes(search),
        ),
      ),
    );
  });
  app.get('/api/projects/:slug', (req, res) => {
    if (
      Object.keys(req.query).length ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(req.params.slug)
    ) {
      res.status(400).json({ error: 'Invalid project request.' });
      return;
    }
    const project = projects.find((p) => p.slug === req.params.slug);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json(Project.parse(project));
  });
  return finishApp(app);
}
