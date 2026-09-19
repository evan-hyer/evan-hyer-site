import { useCallback, useEffect, useRef, useState, version } from 'react';
import { createRoot } from 'react-dom/client';
import {
  loadRemote,
  registerRemotes,
} from '@module-federation/enhanced/runtime';
import {
  internalNavigation,
  type MountedSlice,
  type RemoteModule,
  type RuntimeMetadata,
  type ShellConfig,
  type SliceName,
} from '@site/contract';
import { Button, Link, State } from '@site/ui';
import '../../../packages/tokens/reset.css';
import '../../../packages/tokens/theme.css';
const names: SliceName[] = ['profile', 'projects', 'insights'];
const labels = {
  profile: 'Profile',
  projects: 'Projects',
  insights: 'Insights',
};
function RemoteSlot({
  name,
  route,
  mode,
  config,
  navigate,
  report,
}: {
  name: SliceName;
  route: string;
  mode: 'summary' | 'full';
  config: ShellConfig;
  navigate: (path: string) => void;
  report: (name: SliceName, status: RuntimeMetadata) => void;
}) {
  const target = useRef<HTMLDivElement>(null);
  const [state, setState] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let instance: MountedSlice | undefined;
    setState('loading');
    const entry = config.remotes[name];
    registerRemotes(
      [
        {
          name: 'eh_' + name,
          entry,
          shareScope: name === 'projects' ? 'react18' : 'default',
        },
      ],
      { force: attempt > 0 },
    );
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Remote load timed out')),
        12000,
      );
    });
    Promise.race([loadRemote<RemoteModule>('eh_' + name + '/mount'), timeout])
      .then((remote) => {
        if (!active) return;
        if (!remote || typeof remote.mount !== 'function')
          throw new Error('Invalid remote contract');
        instance = remote.mount(target.current!, {
          route,
          mode,
          navigate,
          onStatus: (status) => {
            if (active) report(name, status);
          },
        });
        setState('ready');
      })
      .catch(() => {
        if (active) setState('error');
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      const mounted = instance;
      queueMicrotask(() => mounted?.unmount());
    };
  }, [name, route, mode, config, navigate, report, attempt]);
  return (
    <div data-slice={name} aria-label={labels[name]}>
      {state !== 'ready' && (
        <State
          label={name}
          error={
            state === 'error'
              ? labels[name] +
                ' could not be loaded. The rest of the site is still available.'
              : undefined
          }
          retry={() => setAttempt((a) => a + 1)}
        />
      )}
      <div ref={target} />
    </div>
  );
}
function App() {
  const [route, setRoute] = useState(location.pathname);
  const [config, setConfig] = useState<ShellConfig>();
  const [configError, setConfigError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [statuses, setStatuses] = useState<
    Partial<Record<SliceName, RuntimeMetadata>>
  >({});
  const report = useCallback(
    (name: SliceName, status: RuntimeMetadata) =>
      setStatuses((previous) => ({ ...previous, [name]: status })),
    [],
  );
  useEffect(() => {
    const controller = new AbortController();
    setConfigError('');
    fetch('/runtime-config.json', {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const value = (await response.json()) as ShellConfig;
        if (
          !value.remotes ||
          names.some(
            (name) =>
              typeof value.remotes[name] !== 'string' ||
              !/^https?:\/\//.test(value.remotes[name]),
          )
        )
          throw new Error();
        if (!controller.signal.aborted) setConfig(value);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setConfigError('The site configuration could not be loaded.');
      });
    return () => controller.abort();
  }, [attempt]);
  const focusMain = () =>
    requestAnimationFrame(() => {
      document.getElementById('main')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    });
  const navigate = useCallback((path: string) => {
    if (!path.startsWith('/') || path.startsWith('//')) return;
    if (location.pathname !== path) history.pushState({}, '', path);
    setRoute(path);
    focusMain();
  }, []);
  useEffect(() => {
    const pop = () => {
      setRoute(location.pathname);
      focusMain();
    };
    addEventListener('popstate', pop);
    return () => removeEventListener('popstate', pop);
  }, []);
  const match = route.match(/^\/(profile|projects|insights)(\/[^/]+)?\/?$/);
  const current = match?.[1] as SliceName | undefined;
  const isHome = route === '/';
  const valid = isHome || (current && (current !== 'profile' || !match?.[2]));
  useEffect(() => {
    document.title = isHome
      ? 'Evan Hyer — Thoughtful work. Connected ideas.'
      : (current ? labels[current] : 'Page not found') + ' — Evan Hyer';
  }, [isHome, current]);
  return (
    <div className="eh-shell">
      <header className="eh-nav">
        <Link to="/" navigate={navigate} className="eh-logo">
          <span className="eh-monogram" aria-hidden="true">
            eh
          </span>
          Evan Hyer<span className="sr-only"> home</span>
        </Link>
        <nav className="eh-nav-links" aria-label="Main navigation">
          {names.map((name) => (
            <a
              key={name}
              href={'/' + name}
              aria-current={current === name ? 'page' : undefined}
              onClick={(e) => internalNavigation(e, '/' + name, navigate)}
            >
              {name === 'profile' ? 'About' : labels[name]}
            </a>
          ))}
          <a
            className="eh-external"
            href="https://www.linkedin.com/in/evan-hyer"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        {!valid ? (
          <section className="eh-detail">
            <p className="eh-eyebrow">404 / A small detour</p>
            <h1>Nothing here just yet.</h1>
            <p>This page doesn’t exist. There’s plenty to explore back home.</p>
            <Link to="/" navigate={navigate} className="eh-text-link">
              Back to home ↗
            </Link>
          </section>
        ) : !config ? (
          <State
            label="site"
            error={configError}
            retry={() => setAttempt((a) => a + 1)}
          />
        ) : (
          (isHome ? names : [current!]).map((name) => (
            <RemoteSlot
              key={name + route}
              name={name}
              config={config}
              route={isHome ? '/' : match?.[2] || '/'}
              mode={isHome ? 'summary' : 'full'}
              navigate={navigate}
              report={report}
            />
          ))
        )}
        {isHome && (
          <section className="eh-cta">
            <div>
              <p className="eh-eyebrow mb-2">
                Good things start with a conversation
              </p>
              <h2>Have an idea? Let’s connect.</h2>
              <p className="eh-muted">
                A shared question is a good place to begin.
              </p>
            </div>
            <a
              className="eh-button eh-button-outline"
              href="https://www.linkedin.com/in/evan-hyer"
              target="_blank"
              rel="noreferrer"
            >
              Find me on LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </section>
        )}
      </main>
      {__DEV__ && config && (
        <details className="eh-diagnostics">
          <summary>Development architecture</summary>
          <p>Shell: React {version}</p>
          <dl>
            {names.map((name) => (
              <div key={name} style={{ display: 'contents' }}>
                <dt>{labels[name]}</dt>
                <dd>
                  {config.remotes[name]}
                  <br />
                  {statuses[name] ? (
                    <>
                      {statuses[name]!.framework} {statuses[name]!.version} ·
                      BFF {statuses[name]!.bffStatus}
                      <br />
                      {statuses[name]!.bffOrigin}
                    </>
                  ) : (
                    'Not mounted'
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
      <footer className="eh-footer">
        <Link to="/" navigate={navigate} className="eh-logo">
          <span className="eh-monogram" aria-hidden="true">
            eh
          </span>
          Evan Hyer
        </Link>
        <span>© {new Date().getFullYear()} Evan Hyer</span>
        <span className="eh-footer-note">
          <span className="eh-dot" aria-hidden="true" />
          Made with care & a little curiosity.
        </span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById('app')!).render(<App />);
