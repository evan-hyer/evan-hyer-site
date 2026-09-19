import { z } from 'zod';
export const Insight = z
  .object({
    slug: z.string(),
    title: z.string(),
    topic: z.string(),
    excerpt: z.string(),
    date: z.string(),
    readMinutes: z.number().int().positive(),
    body: z.array(z.object({ heading: z.string(), text: z.string() }).strict()),
    demo: z.literal(true),
  })
  .strict();
export const Insights = z.array(Insight);
export type InsightData = z.infer<typeof Insight>;
export const parseInsights = (value: unknown) => Insights.parse(value);
export const parseInsight = (value: unknown) => Insight.parse(value);
