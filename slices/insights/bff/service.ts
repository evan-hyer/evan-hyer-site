import { z } from 'zod';
import { RequestError } from '../../../packages/server/src/request-error';
import { Insight, Insights, type InsightData } from '../contracts/index';
const querySchema = z.object({ topic: z.string().max(80).optional() }).strict();
export function listInsights(
  catalog: readonly InsightData[],
  query: unknown = {},
) {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success)
    throw new RequestError(400, 'Use a single topic of up to 80 characters.');
  return Insights.parse(
    catalog.filter(
      (insight) => !parsed.data.topic || insight.topic === parsed.data.topic,
    ),
  );
}
export function getInsight(
  catalog: readonly InsightData[],
  slug: string,
  query: unknown = {},
) {
  if (
    !z.object({}).strict().safeParse(query).success ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  )
    throw new RequestError(400, 'Invalid insight request.');
  const insight = catalog.find((item) => item.slug === slug);
  if (!insight) throw new RequestError(404, 'Insight not found.');
  return Insight.parse(insight);
}
