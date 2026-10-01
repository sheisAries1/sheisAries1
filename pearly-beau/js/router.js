// Tiny hash router: works on GitHub Pages with no server rewrites.
// Patterns like '/product/:slug'; query strings are parsed into `query`.

const routes = [];
let notFound = () => '';
let afterRender = () => {};

export function route(pattern, handler) {
  const keys = [];
  const re = new RegExp(
    '^' + pattern.replace(/\/:(\w+)/g, (_, k) => (keys.push(k), '/([^/]+)')) + '/?$'
  );
  routes.push({ re, keys, handler });
}

export const fallback = (handler) => (notFound = handler);
export const onRender = (fn) => (afterRender = fn);

export function current() {
  const raw = location.hash.slice(1) || '/';
  const [path, qs = ''] = raw.split('?');
  return { path, query: Object.fromEntries(new URLSearchParams(qs)) };
}

export function navigate(path, { replace = false } = {}) {
  const url = '#' + path;
  if (replace) history.replaceState(null, '', url);
  else location.hash = path;
  if (replace) resolve();
}

export function resolve() {
  const { path, query } = current();
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return afterRender(r.handler({ params, query, path }), path);
    }
  }
  afterRender(notFound({ path }), path);
}

export function start() {
  addEventListener('hashchange', resolve);
  resolve();
}
