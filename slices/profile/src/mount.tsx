import { version } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { MountOptions } from '@site/contract';
import { Badge, Link, State, useData } from '@site/ui';
import { parseProfile } from '../contracts/index';
import './style.css';
export const metadata = { framework: 'React', version };
const roots = new WeakMap<HTMLElement, Root>();
const base = __webpack_public_path__;
function Profile({ options }: { options: MountOptions }) {
  const state = useData(
    base,
    '/api/profile',
    parseProfile,
    options,
    'React',
    version,
  );
  if (!state.data)
    return <State label="profile" error={state.error} retry={state.retry} />;
  const profile = state.data;
  return (
    <div
      className="eh-profile"
      data-framework="React"
      data-version={version}
      data-testid="profile-content"
    >
      <section className="profile-hero" aria-label="Introduction">
        <div className="profile-copy">
          <p className="eh-eyebrow">
            {profile.name} <span aria-hidden="true"> / </span> {profile.role}
          </p>
          <h1>
            Thoughtful work.
            <br />
            Connected <em>ideas.</em>
          </h1>
          <p className="profile-intro">{profile.introduction}</p>
          <div className="profile-actions">
            <Link
              className="eh-button"
              to="/projects"
              navigate={options.navigate}
            >
              Explore projects <span aria-hidden="true">↗</span>
            </Link>
            <a
              className="eh-text-link"
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              Let’s connect <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="profile-footnote">
            <span className="eh-dot" aria-hidden="true" />
            Always a work in progress. Always curious.
          </p>
        </div>
        <div
          className="profile-art"
          role="img"
          aria-label="Abstract orbit illustration: independent circles connected by a shared path"
        >
          <div className="art-grid" />
          <div className="art-ring" />
          <div className="art-ring art-ring-two" />
          <div className="art-core" />
          <div className="art-orbit" />
          <div className="art-orbit art-orbit-two" />
          <div className="art-marker" />
          <div className="art-marker art-marker-two" />
          <div className="art-caption">
            <span>
              INDEPENDENT PARTS.
              <br />A CONNECTED WHOLE.
            </span>
            <span>
              FIG. 001
              <br />
              EH / 2026
            </span>
          </div>
        </div>
      </section>
      <div className="profile-strip" aria-label="Interests">
        {profile.interests.map((interest, i) => (
          <span key={interest}>
            <b aria-hidden="true">{['✳', '◇', '↗'][i]}</b>
            {interest}
          </span>
        ))}
      </div>
      {options.mode === 'full' && (
        <section className="profile-about">
          <p className="eh-eyebrow">A little more context</p>
          <h2>Hello, I’m {profile.name}.</h2>
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="profile-interests">
            {profile.interests.map((i) => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
          <p>
            <a
              className="eh-text-link"
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              Professional background on LinkedIn ↗
            </a>
          </p>
        </section>
      )}
    </div>
  );
}
export function mount(element: HTMLElement, options: MountOptions) {
  roots.get(element)?.unmount();
  const root = createRoot(element);
  roots.set(element, root);
  root.render(<Profile options={options} />);
  let disposed = false;
  return {
    unmount() {
      if (disposed) return;
      disposed = true;
      if (roots.get(element) === root) {
        root.unmount();
        roots.delete(element);
      }
    },
  };
}
