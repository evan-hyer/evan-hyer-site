import { z } from 'zod';
import { RequestError } from '../../../packages/server/src/request-error';
import { Project, Projects, type ProjectData } from '../contracts/index';
const querySchema = z
  .object({
    search: z.string().max(200).optional(),
    tag: z.string().max(80).optional(),
  })
  .strict();
export function listProjects(
  catalog: readonly ProjectData[],
  query: unknown = {},
) {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success)
    throw new RequestError(
      400,
      'Use a single search (up to 200 characters) and tag (up to 80 characters).',
    );
  const search = parsed.data.search?.trim().toLowerCase() || '';
  return Projects.parse(
    catalog.filter(
      (project) =>
        (!parsed.data.tag || project.tags.includes(parsed.data.tag)) &&
        [project.title, project.summary, ...project.tags]
          .join(' ')
          .toLowerCase()
          .includes(search),
    ),
  );
}
export function getProject(
  catalog: readonly ProjectData[],
  slug: string,
  query: unknown = {},
) {
  if (
    !z.object({}).strict().safeParse(query).success ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  )
    throw new RequestError(400, 'Invalid project request.');
  const project = catalog.find((item) => item.slug === slug);
  if (!project) throw new RequestError(404, 'Project not found.');
  return Project.parse(project);
}
