import {
  useEffect,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from 'react';
import {
  internalNavigation,
  getJson,
  sliceConfig,
  type MountOptions,
  type RuntimeMetadata,
} from '@site/contract';
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={'eh-button ' + (props.className ?? '')} />
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="eh-badge">{children}</span>;
}
export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <article className={'eh-card ' + className}>{children}</article>;
}
export function Heading({
  number,
  title,
  subtitle,
  children,
  level = 2,
}: {
  number: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  level?: 1 | 2;
}) {
  const Title = level === 1 ? 'h1' : 'h2';
  return (
    <header className="eh-section-head">
      <div>
        <p className="eh-eyebrow">{number}</p>
        <Title className="eh-page-title">{title}</Title>
        {subtitle && <p className="eh-muted">{subtitle}</p>}
      </div>
      {children}
    </header>
  );
}
export function Link({
  to,
  navigate,
  children,
  className = '',
}: {
  to: string;
  navigate: MountOptions['navigate'];
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => internalNavigation(e, to, navigate)}
    >
      {children}
    </a>
  );
}
export function State({
  error,
  retry,
  label,
}: {
  error?: string;
  retry: () => void;
  label: string;
}) {
  return (
    <div className="eh-state" role={error ? 'alert' : 'status'}>
      <p>{error || 'Loading ' + label + '…'}</p>
      {error && <Button onClick={retry}>Try again</Button>}
    </div>
  );
}
export function useData<T>(
  base: string,
  path: string,
  parse: (value: unknown) => T,
  options: MountOptions,
  framework: RuntimeMetadata['framework'],
  version: string,
) {
  const [state, setState] = useState<{ data?: T; error?: string }>({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let origin = '';
    setState({});
    options.onStatus?.({
      framework,
      version,
      bffOrigin: origin,
      bffStatus: 'loading',
    });
    (async () => {
      const config = await sliceConfig(base, controller.signal);
      origin = config.bffOrigin;
      const data = await getJson(origin + path, controller.signal, parse);
      if (!controller.signal.aborted) {
        setState({ data });
        options.onStatus?.({
          framework,
          version,
          bffOrigin: origin,
          bffStatus: 'online',
        });
      }
    })().catch((error) => {
      if (!controller.signal.aborted) {
        setState({
          error:
            error instanceof Error
              ? error.message
              : 'Unable to load this section.',
        });
        options.onStatus?.({
          framework,
          version,
          bffOrigin: origin,
          bffStatus: 'unavailable',
        });
      }
    });
    return () => controller.abort();
  }, [base, path, parse, attempt, options, framework, version]);
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
