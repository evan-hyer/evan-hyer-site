import { z } from 'zod';
export const Project = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
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
    demo: z.literal(false),
    repositoryUrl: z
      .string()
      .regex(/^https:\/\/github\.com\/evan-hyer\/[A-Za-z0-9_.-]+$/),
    sourceUrl: z
      .string()
      .regex(
        /^https:\/\/github\.com\/evan-hyer\/[A-Za-z0-9_.-]+\/blob\/[^?#]+$/,
      ),
    sourceChecked: z.iso.date(),
  })
  .strict()
  .refine(
    (p) => p.sourceUrl.startsWith(p.repositoryUrl + '/blob/'),
    'Source must belong to the project repository',
  );
export const Projects = z
  .array(Project)
  .refine(
    (items) =>
      new Set(items.map((item) => item.slug)).size === items.length &&
      new Set(items.map((item) => item.repositoryUrl)).size === items.length,
    'Projects must have unique slugs and repositories',
  );
export const projectTags = [
  'Salesforce',
  'CLI',
  'TypeScript',
  'LWC',
  'JavaScript',
  'Apex',
  'Design patterns',
  'Svelte',
  'Web components',
] as const;
export type ProjectData = z.infer<typeof Project>;
export const parseProjects = (value: unknown) => Projects.parse(value);
export const parseProject = (value: unknown) => Project.parse(value);
