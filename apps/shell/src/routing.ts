import type { SliceName } from '@site/contract';
/** Resolve which remote to load without importing a rendering runtime. */
export function resolveRoute(path: string) {
  const match = path.match(/^\/(profile|projects|insights)(\/[^/]+)?\/?$/);
  const current = match?.[1] as SliceName | undefined;
  const isHome = path === '/';
  return {
    current,
    isHome,
    valid: Boolean(
      isHome || (current && (current !== 'profile' || !match?.[2])),
    ),
    relativeRoute: isHome ? '/' : match?.[2] || '/',
  };
}
