import '../../../packages/tokens/reset.css';
import { standalone, sliceConfig } from '@site/contract';
import { mount } from './mount';
const config = await sliceConfig(
  __webpack_public_path__,
  new AbortController().signal,
);
const root = document.getElementById('app')!;
root.outerHTML =
  '<div class="eh-standalone"><header class="eh-standalone-header"><a href="/">Evan Hyer / Insights</a><a id="full-site-link" href="#">Visit the full site ↗</a></header><main id="main" tabindex="-1"><div id="app"></div></main></div>';
document
  .getElementById('full-site-link')!
  .setAttribute('href', config.shellOrigin);
standalone('insights', mount, config.shellOrigin);
