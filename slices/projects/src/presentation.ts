import type { MountOptions } from '@site/contract';
import type { ProjectData } from '../contracts/index';
/** The homepage features three projects in editorial order; browse shows all. */
export function visibleProjects(
  projects: readonly ProjectData[] | undefined,
  mode: MountOptions['mode'],
): readonly ProjectData[] | undefined {
  return mode === 'summary' ? projects?.slice(0, 3) : projects;
}
