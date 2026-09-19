import {
  baseApp,
  finishApp,
  type FailureMode,
} from '../../../packages/server/src/index';
import { projects } from '../data/projects';
import { getProject, listProjects } from './service';
export function createApp(mode?: FailureMode) {
  const app = baseApp('projects', mode);
  app.get('/api/projects', (req, res) => {
    res.json(listProjects(projects, req.query));
  });
  app.get('/api/projects/:slug', (req, res) => {
    res.json(getProject(projects, req.params.slug, req.query));
  });
  return finishApp(app);
}
