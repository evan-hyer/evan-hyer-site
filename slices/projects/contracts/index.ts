import { z } from 'zod';
export const Project = z
  .object({
    slug: z.string(),
    title: z.string(),
    category: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    year: z.string(),
    color: z.enum(['sage', 'clay', 'blue', 'sand']),
    kind: z.enum(['orbit', 'blocks', 'lines', 'grid']),
    challenge: z.string(),
    approach: z.array(z.string()),
    outcome: z.string(),
    demo: z.literal(true),
  })
  .strict();
export const Projects = z.array(Project);
export type ProjectData = z.infer<typeof Project>;
export const parseProjects = (value: unknown) => Projects.parse(value);
export const parseProject = (value: unknown) => Project.parse(value);
