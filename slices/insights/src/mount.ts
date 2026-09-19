import {
  createApp,
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  watch,
  version,
  type App,
} from 'vue';
import {
  getJson,
  internalNavigation,
  sliceConfig,
  type MountOptions,
} from '@site/contract';
import {
  parseInsight,
  parseInsights,
  type InsightData,
} from '../contracts/index';
import './style.css';
export const metadata = { framework: 'Vue', version };
const base = __webpack_public_path__;
const roots = new WeakMap<HTMLElement, App>();
const date = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
export function mount(element: HTMLElement, options: MountOptions) {
  roots.get(element)?.unmount();
  const component = defineComponent({
    setup() {
      const topic = ref('');
      const attempt = ref(0);
      const data = ref<InsightData[] | InsightData>();
      const error = ref('');
      const slug = options.route.replace(/^\//, '');
      const summary = options.mode === 'summary';
      const stop = watch(
        [topic, attempt],
        async (_values, _old, onCleanup) => {
          const controller = new AbortController();
          onCleanup(() => controller.abort());
          data.value = undefined;
          error.value = '';
          let origin = '';
          options.onStatus?.({
            framework: 'Vue',
            version,
            bffOrigin: origin,
            bffStatus: 'loading',
          });
          try {
            const config = await sliceConfig(base, controller.signal);
            origin = config.bffOrigin;
            const result = slug
              ? await getJson(
                  origin + '/api/insights/' + encodeURIComponent(slug),
                  controller.signal,
                  parseInsight,
                )
              : await getJson(
                  origin +
                    '/api/insights?' +
                    new URLSearchParams({ topic: topic.value }),
                  controller.signal,
                  parseInsights,
                );
            if (controller.signal.aborted) return;
            data.value = result;
            options.onStatus?.({
              framework: 'Vue',
              version,
              bffOrigin: origin,
              bffStatus: 'online',
            });
          } catch (e) {
            if (controller.signal.aborted) return;
            error.value =
              e instanceof Error ? e.message : 'Unable to load insights.';
            options.onStatus?.({
              framework: 'Vue',
              version,
              bffOrigin: origin,
              bffStatus: 'unavailable',
            });
          }
        },
        { immediate: true },
      );
      onBeforeUnmount(stop);
      const link = (
        to: string,
        children: Parameters<typeof h>[2],
        className = '',
      ) =>
        h(
          'a',
          {
            href: to,
            class: className,
            onClick: (e: MouseEvent) =>
              internalNavigation(e, to, options.navigate),
          },
          children,
        );
      const state = () =>
        h(
          'div',
          { class: 'eh-state', role: error.value ? 'alert' : 'status' },
          [
            h('p', error.value || 'Loading insights…'),
            error.value &&
              h(
                'button',
                { class: 'eh-button', onClick: () => attempt.value++ },
                'Try again',
              ),
          ],
        );
      const demo = () =>
        h(
          'p',
          { class: 'eh-demo' },
          'Demonstration writing · illustrative articles, not previously published work.',
        );
      return () =>
        h(
          'div',
          {
            class: 'eh-insights',
            'data-framework': 'Vue',
            'data-version': version,
            'data-testid': 'insights-content',
          },
          [
            slug
              ? h('article', { class: 'eh-detail' }, [
                  link('/insights', '← All insights', 'eh-text-link'),
                  !data.value
                    ? state()
                    : (() => {
                        const article = data.value as InsightData;
                        return [
                          h('p', { class: 'eh-eyebrow' }, article.topic),
                          h('h1', article.title),
                          h('p', { class: 'eh-lead' }, article.excerpt),
                          h('div', { class: 'article-meta' }, [
                            h(
                              'time',
                              { datetime: article.date },
                              date(article.date),
                            ),
                            h('span', article.readMinutes + ' min read'),
                          ]),
                          demo(),
                          ...article.body.map((p) =>
                            h('section', { key: p.heading }, [
                              h('h2', p.heading),
                              h('p', p.text),
                            ]),
                          ),
                        ];
                      })(),
                ])
              : h(
                  'section',
                  { class: 'eh-section', 'aria-label': 'Insights' },
                  [
                    h('header', { class: 'eh-section-head' }, [
                      h('div', [
                        h(
                          'p',
                          { class: 'eh-eyebrow' },
                          '02 / Notes & perspectives',
                        ),
                        h(
                          summary ? 'h2' : 'h1',
                          { class: summary ? '' : 'eh-page-title' },
                          summary
                            ? 'A little thinking out loud.'
                            : 'Notes on making things.',
                        ),
                        h(
                          'p',
                          { class: 'eh-muted' },
                          'Observations on design, building, and the things in between.',
                        ),
                      ]),
                      summary &&
                        link(
                          '/insights',
                          [
                            'All insights ',
                            h('span', { 'aria-hidden': 'true' }, '↗'),
                          ],
                          'eh-text-link',
                        ),
                    ]),
                    !summary &&
                      h(
                        'div',
                        {
                          class: 'eh-filters',
                          'aria-label': 'Filter insights',
                        },
                        ['', 'Design', 'Engineering', 'Process'].map((t) =>
                          h(
                            'button',
                            {
                              class: 'eh-filter',
                              'aria-pressed': topic.value === t,
                              onClick: () => (topic.value = t),
                            },
                            t || 'All topics',
                          ),
                        ),
                      ),
                    !data.value
                      ? state()
                      : h('div', [
                          ...(data.value as InsightData[]).map((article) =>
                            link(
                              '/insights/' + article.slug,
                              [
                                h('div', { class: 'insight-meta' }, [
                                  h(
                                    'span',
                                    { class: 'eh-badge' },
                                    article.topic,
                                  ),
                                  h('div', [
                                    h(
                                      'time',
                                      { datetime: article.date },
                                      date(article.date),
                                    ),
                                    h(
                                      'span',
                                      ' · ' + article.readMinutes + ' min',
                                    ),
                                  ]),
                                ]),
                                h('div', [
                                  h(
                                    summary ? 'h3' : 'h2',
                                    { class: 'insight-title' },
                                    article.title,
                                  ),
                                  h('p', article.excerpt),
                                ]),
                                h(
                                  'span',
                                  {
                                    class: 'insight-arrow',
                                    'aria-hidden': 'true',
                                  },
                                  '↗',
                                ),
                              ],
                              'insight-row',
                            ),
                          ),
                          (data.value as InsightData[]).length === 0 &&
                            h(
                              'p',
                              { class: 'eh-state' },
                              'No insights match this topic.',
                            ),
                        ]),
                    demo(),
                  ],
                ),
          ],
        );
    },
  });
  const app = createApp(component);
  roots.set(element, app);
  app.mount(element);
  let disposed = false;
  return {
    unmount() {
      if (disposed) return;
      disposed = true;
      if (roots.get(element) === app) {
        app.unmount();
        roots.delete(element);
      }
    },
  };
}
