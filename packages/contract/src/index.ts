export type SliceName = 'profile' | 'projects' | 'insights';
export interface RuntimeMetadata {
  framework: 'React' | 'Vue';
  version: string;
  bffOrigin: string;
  bffStatus: 'loading' | 'online' | 'unavailable';
}
export interface MountOptions {
  route: string;
  mode: 'summary' | 'full';
  navigate: (path: string) => void;
  onStatus?: (metadata: RuntimeMetadata) => void;
}
export interface MountedSlice {
  unmount(): void;
}
export interface RemoteModule {
  mount(element: HTMLElement, options: MountOptions): MountedSlice;
  metadata: { framework: string; version: string };
}
export interface SliceConfig {
  bffOrigin: string;
  shellOrigin: string;
}
export interface ShellConfig {
  remotes: Record<SliceName, string>;
}
export function internalNavigation(
  event: {
    button: number;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    preventDefault(): void;
  },
  path: string,
  navigate: (path: string) => void,
) {
  if (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  ) {
    event.preventDefault();
    navigate(path);
  }
}
class SectionRequestError extends Error {}

export async function getJson<T>(
  url: string,
  signal: AbortSignal,
  parse: (value: unknown) => T,
): Promise<T> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(12000)]),
      cache: 'no-store',
    });
    if (!response.ok)
      throw new SectionRequestError(
        response.status === 404
          ? 'This page could not be found.'
          : 'This section is temporarily unavailable.',
      );
    return parse(await response.json());
  } catch (error) {
    if (signal.aborted || error instanceof SectionRequestError) throw error;
    throw new SectionRequestError(
      error instanceof Error && error.name === 'TimeoutError'
        ? 'This section took too long to respond. Please try again.'
        : 'This section is temporarily unavailable.',
    );
  }
}
export async function sliceConfig(
  base: string,
  signal: AbortSignal,
): Promise<SliceConfig> {
  return getJson(new URL('runtime-config.json', base).href, signal, (value) => {
    const config = value as SliceConfig;
    if (
      !config ||
      [config.bffOrigin, config.shellOrigin].some(
        (origin) => typeof origin !== 'string' || !/^https?:\/\//.test(origin),
      )
    )
      throw new Error('Invalid service configuration.');
    return config;
  });
}
export function standalone(
  name: SliceName,
  mount: RemoteModule['mount'],
  shellOrigin: string,
) {
  const element = document.getElementById('app')!;
  let current: MountedSlice | undefined;
  function render() {
    current?.unmount();
    current = mount(element, {
      route:
        location.pathname === '/'
          ? '/'
          : location.pathname.replace(new RegExp('^/' + name), '') || '/',
      mode: 'full',
      navigate,
    });
  }
  function navigate(path: string) {
    if (path !== '/' + name && !path.startsWith('/' + name + '/')) {
      location.assign(new URL(path, shellOrigin));
      return;
    }
    history.pushState({}, '', path);
    render();
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }
  addEventListener('popstate', render);
  addEventListener('pagehide', () => current?.unmount());
  render();
}
