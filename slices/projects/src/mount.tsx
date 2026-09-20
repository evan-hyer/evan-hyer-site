import { useState, version } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { MountOptions } from '@site/contract';
import { Badge, Card, Heading, Link, State, useData } from '@site/ui';
import {
  projectTags,
  parseProject,
  parseProjects,
  type ProjectData,
} from '../contracts/index';
import './style.css';
import { visibleProjects } from './presentation';
export const metadata = { framework: 'React', version };
const base = __webpack_public_path__;
const roots = new WeakMap<HTMLElement, Root>();
function Cover({ project }: { project: ProjectData }) {
  return (
    <div className={'project-cover ' + project.color} aria-hidden="true">
      <div className={'project-visual ' + project.kind}>
        <i />
        <i />
        <i />
        <i />
      </div>
      <span className="cover-label">EH — {project.category.toUpperCase()}</span>
      <span className="cover-arrow">↗</span>
    </div>
  );
}
function Detail({ options, slug }: { options: MountOptions; slug: string }) {
  const state = useData(
    base,
    '/api/projects/' + encodeURIComponent(slug),
    parseProject,
    options,
    'React',
    version,
  );
  if (!state.data)
    return (
      <>
        <Link
          to="/projects"
          navigate={options.navigate}
          className="eh-text-link"
        >
          ← All projects
        </Link>
        <State label="project" error={state.error} retry={state.retry} />
      </>
    );
  const p = state.data;
  return (
    <article className="eh-detail">
      <Link to="/projects" navigate={options.navigate} className="eh-text-link">
        ← All projects
      </Link>
      <p className="eh-eyebrow">
        {p.category} / {p.year}
      </p>
      <h1>{p.title}</h1>
      <p className="eh-lead">{p.summary}</p>
      <div className="project-tags">
        {p.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
      <Cover project={p} />
      <p className="eh-demo">
        Public GitHub project · Source reviewed {p.sourceChecked}
      </p>
      <p>
        <a className="eh-text-link" href={p.repositoryUrl}>
          View repository on GitHub ↗
        </a>
      </p>
      <h2>The question</h2>
      <p>{p.challenge}</p>
      <h2>The approach</h2>
      <ul>
        {p.approach.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <h2>Project notes</h2>
      <p>{p.outcome}</p>
      <a className="eh-text-link" href={p.sourceUrl}>
        Read the source README ↗
      </a>
    </article>
  );
}
function List({ options }: { options: MountOptions }) {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const query = new URLSearchParams({ search, tag });
  const state = useData(
    base,
    '/api/projects?' + query,
    parseProjects,
    options,
    'React',
    version,
  );
  const summary = options.mode === 'summary';
  const ProjectTitle = summary ? 'h3' : 'h2';
  const projects = visibleProjects(state.data, options.mode);
  return (
    <section className="eh-section" aria-label="Projects">
      <Heading
        level={summary ? 2 : 1}
        number="01 / Selected explorations"
        title={
          summary ? 'Ideas, made tangible.' : 'A few things worth exploring.'
        }
        subtitle={
          summary
            ? 'Salesforce tools, component patterns, and experiments from my GitHub.'
            : 'A selection of my public repositories, with source links and implementation notes.'
        }
      >
        {summary && (
          <Link
            className="eh-text-link"
            to="/projects"
            navigate={options.navigate}
          >
            All projects <span aria-hidden="true">↗</span>
          </Link>
        )}
      </Heading>
      {!summary && (
        <>
          <div className="eh-search">
            <label htmlFor="project-search">Search projects</label>
            <input
              id="project-search"
              type="search"
              value={search}
              maxLength={200}
              placeholder="Find an idea, topic, or project…"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="eh-filters" aria-label="Filter projects">
            {['', ...projectTags].map((t) => (
              <button
                className="eh-filter"
                key={t}
                aria-pressed={tag === t}
                onClick={() => setTag(t)}
              >
                {t || 'All projects'}
              </button>
            ))}
          </div>
        </>
      )}
      {!projects ? (
        <State label="projects" error={state.error} retry={state.retry} />
      ) : (
        <>
          {!summary && (
            <p className="results-count" role="status">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          )}
          <div className={'projects-grid ' + (summary ? 'summary' : '')}>
            {projects.map((p) => (
              <Card key={p.slug} className="project-card">
                <Link to={'/projects/' + p.slug} navigate={options.navigate}>
                  <Cover project={p} />
                  <div className="project-category">{p.category}</div>
                  <ProjectTitle className="project-title">
                    {p.title}
                  </ProjectTitle>
                  <p>{p.summary}</p>
                </Link>
                <div className="project-tags">
                  {p.tags.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          {projects.length === 0 && (
            <div className="eh-state">
              <p>No projects match these filters.</p>
              <button
                className="eh-button"
                onClick={() => {
                  setSearch('');
                  setTag('');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
      <p className="eh-demo">
        Selected public repositories. Descriptions reflect their source
        documentation.
      </p>
    </section>
  );
}
export function mount(element: HTMLElement, options: MountOptions) {
  roots.get(element)?.unmount();
  const root = createRoot(element);
  roots.set(element, root);
  const slug = options.route.replace(/^\//, '');
  root.render(
    <div
      className="eh-projects"
      data-framework="React"
      data-version={version}
      data-testid="projects-content"
    >
      {slug ? (
        <Detail options={options} slug={slug} />
      ) : (
        <List options={options} />
      )}
    </div>,
  );
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
