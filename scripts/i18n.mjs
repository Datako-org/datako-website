import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const pages = [
  { route: 'index', fr: 'index.html', en: 'index.html' },
  { route: 'blog', fr: 'blog.html', en: 'blog.html' },
  { route: 'article-ia-pme', fr: 'blog-ia-generative-pme.html', en: 'blog-ia-generative-pme.html' },
  { route: 'article-data-stack', fr: 'blog-modern-data-stack.html', en: 'blog-modern-data-stack.html' },
  { route: 'article-equipe-data', fr: 'blog-equipe-data-pme.html', en: 'blog-equipe-data-pme.html' },
  { route: 'solutions', fr: 'solutions.html', en: 'solutions.html' },
  { route: 'prestations', fr: 'prestations.html', en: 'prestations.html' },
  { route: 'formations', fr: 'formations.html', en: 'formations.html' },
  { route: 'academy', fr: 'academy.html', en: 'academy.html' },
  { route: 'matching', fr: 'matching.html', en: 'matching.html' },
  { route: 'contact', fr: 'contact.html', en: 'contact.html' },
  { route: 'solution-fleet', fr: 'solution-fleet.html', en: 'solution-fleet.html' },
  { route: 'solution-distribution', fr: 'solution-distribution.html', en: 'solution-distribution.html' },
  { route: 'solution-stations', fr: 'solution-stations.html', en: 'solution-stations.html' },
  { route: 'legal', fr: 'mentions-legales.html', en: 'legal.html' },
  { route: 'privacy', fr: 'politique-confidentialite.html', en: 'privacy.html' },
  { route: 'thanks', fr: 'merci.html', en: 'thanks.html' }
];

const templatePath = page => join(root, 'src', 'pages', `${page.route}.html`);
const localePath = (locale, page) => join(root, 'src', 'locales', locale, `${page.route}.json`);
const partialPath = name => join(root, 'src', 'partials', `${name}.html`);
const partialLocalePath = locale => join(root, 'src', 'locales', locale, '_partials.json');

// Shared header/footer live in src/partials/ so the navigation and the footer exist
// once per locale instead of once per route. Includes look like:
//   {{> header active="solutions" }}
//   {{> footer class="home-footer" }}
// Partial dictionaries use the pt./pa. namespace so their indices never collide with
// the page-level t./a. arrays.
const includePattern = /\{\{>\s*([\w-]+)([^}]*)\}\}/g;

function parseIncludeParams(raw) {
  const params = {};
  for (const [, key, value] of raw.matchAll(/([\w-]+)="([^"]*)"/g)) params[key] = value;
  return params;
}

function renderPartialPlaceholders(template, dictionary) {
  return template
    .replace(/\{\{pt\.(\d+)\}\}/g, (_, index) => dictionary.text[Number(index)] ?? '')
    .replace(/\{\{pa\.(\d+)\}\}/g, (_, index) => dictionary.attributes[Number(index)] ?? '');
}

// {{navattrs:route}} becomes the anchor's class plus, for the current page, aria-current.
function renderNavState(html, active) {
  return html.replace(/\{\{navattrs:([\w-]+)\}\}/g, (_, route) => route === active
    ? 'class="nav-link active" aria-current="page"'
    : 'class="nav-link"');
}

async function loadPartials(locale) {
  const dictionary = JSON.parse(await readFile(partialLocalePath(locale), 'utf8'));
  const cache = new Map();
  return async name => {
    if (!cache.has(name)) cache.set(name, await readFile(partialPath(name), 'utf8'));
    const entry = dictionary[name];
    if (!entry) throw new Error(`_partials.json (${locale}) has no dictionary for partial "${name}".`);
    return renderPartialPlaceholders(cache.get(name), entry);
  };
}

async function expandIncludes(template, readPartial) {
  const includes = [...template.matchAll(includePattern)];
  let html = template;
  for (const [token, name, rawParams] of includes) {
    const params = parseIncludeParams(rawParams);
    let partial = await readPartial(name);
    partial = renderNavState(partial, params.active ?? '');
    partial = partial.replace(/\{\{class\}\}/g, params.class ?? 'site-footer');
    html = html.replace(token, () => partial);
  }
  return html;
}

function textParts(html) {
  let skipped = 0;
  const values = [];
  const parts = html.split(/(<[^>]+>)/g).map(part => {
    if (!part) return part;
    if (part.startsWith('<')) {
      const match = part.match(/^<\/?\s*([\w-]+)/);
      if (match && ['script', 'style'].includes(match[1].toLowerCase())) {
        skipped += part.startsWith('</') ? -1 : 1;
      }
      return part;
    }
    if (skipped || !part.trim()) return part;
    const leading = part.match(/^\s*/)?.[0] || '';
    const trailing = part.match(/\s*$/)?.[0] || '';
    values.push(part.slice(leading.length, part.length - trailing.length));
    return `${leading}{{t.${values.length - 1}}}${trailing}`;
  });
  return { template: parts.join(''), values };
}

function attributeParts(html) {
  const values = [];
  const pattern = /\b(aria-label|alt|placeholder)="([^"]*)"|(<meta\s+name="description"\s+content=")([^"]*)(")/g;
  const template = html.replace(pattern, (full, name, value, metaStart, metaValue, metaEnd) => {
    const current = name ? value : metaValue;
    values.push(current);
    return name ? `${name}="{{a.${values.length - 1}}}"` : `${metaStart}{{a.${values.length - 1}}}${metaEnd}`;
  });
  return { template, values };
}

function extractDocument(html) {
  html = html
    .replace(/\n?<!-- Generated from src\/pages\/[^>]+ -->/g, '')
    .replace(/<link rel="alternate" hreflang="(?:fr|en|x-default)" href="[^"]*">/g, '');
  const attributes = attributeParts(html);
  const text = textParts(attributes.template);
  return { template: text.template, locale: { text: text.values, attributes: attributes.values } };
}

function renderPlaceholders(template, locale) {
  return template
    .replace(/\{\{t\.(\d+)\}\}/g, (_, index) => locale.text[Number(index)] ?? '')
    .replace(/\{\{a\.(\d+)\}\}/g, (_, index) => locale.attributes[Number(index)] ?? '');
}

function localizeEnglishPaths(html) {
  const assets = ['css/', 'js/', 'images/', 'data/', 'assets/'];
  html = html.replace(/\b(href|src)="([^"]+)"/g, (full, attribute, value) => {
    if (/^(?:https?:|mailto:|tel:|#|\/)/.test(value)) return full;
    if (assets.some(prefix => value.startsWith(prefix))) return `${attribute}="../${value}"`;
    const routeMap = {
      'mentions-legales.html': 'legal.html',
      'politique-confidentialite.html': 'privacy.html',
      'merci.html': 'thanks.html'
    };
    return `${attribute}="${routeMap[value] || value}"`;
  });
  return html
    .replace('<html lang="fr">', '<html lang="en">')
    .replaceAll('name="contact-fr"', 'name="contact-en"')
    .replaceAll('value="contact-fr"', 'value="contact-en"')
    .replaceAll('action="/merci"', 'action="/en/thanks"');
}

function injectSeoLinks(html, page, locale) {
  const frHref = locale === 'fr' ? page.fr : `../${page.fr}`;
  const enHref = locale === 'fr' ? `en/${page.en}` : page.en;
  const links = `<link rel="alternate" hreflang="fr" href="${frHref}"><link rel="alternate" hreflang="en" href="${enHref}"><link rel="alternate" hreflang="x-default" href="${frHref}">`;
  return html.replace('</head>', `${links}</head>`);
}

function generatedBanner(html, page) {
  return html.replace(/<!DOCTYPE html>/i, `<!DOCTYPE html>\n<!-- Generated from src/pages/${page.route}.html — run npm run i18n:build. -->`);
}

async function extract() {
  // extract() rebuilds every template from the generated HTML, which would inline the
  // shared header and footer back into each route and silently undo src/partials/.
  // It was a one-time bootstrap; refuse to run once partials are the source of truth.
  try {
    await readFile(partialPath('header'), 'utf8');
    throw new Error(
      'extract is disabled: src/partials/ is now the source of truth for the shared header and footer.\n' +
      'Running it would inline them back into every route. Edit src/pages/, src/partials/ and src/locales/ directly, then run npm run i18n:build.'
    );
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  for (const page of pages) {
    const frHtml = await readFile(join(root, page.fr), 'utf8');
    const enHtml = await readFile(join(root, 'en', page.en), 'utf8');
    const fr = extractDocument(frHtml);
    const en = extractDocument(enHtml);
    if (fr.locale.text.length !== en.locale.text.length || fr.locale.attributes.length !== en.locale.attributes.length) {
      throw new Error(`${page.route}: FR/EN structures are not aligned (${fr.locale.text.length}/${en.locale.text.length} text, ${fr.locale.attributes.length}/${en.locale.attributes.length} attributes).`);
    }
    await mkdir(dirname(templatePath(page)), { recursive: true });
    await mkdir(dirname(localePath('fr', page)), { recursive: true });
    await mkdir(dirname(localePath('en', page)), { recursive: true });
    await writeFile(templatePath(page), fr.template);
    await writeFile(localePath('fr', page), `${JSON.stringify(fr.locale, null, 2)}\n`);
    await writeFile(localePath('en', page), `${JSON.stringify(en.locale, null, 2)}\n`);
  }
  console.log(`Extracted ${pages.length} shared page templates.`);
}

async function seed(route) {
  const page = pages.find(item => item.route === route);
  if (!page) throw new Error(`Unknown route: ${route}`);
  const frHtml = await readFile(join(root, page.fr), 'utf8');
  const fr = extractDocument(frHtml);
  await mkdir(dirname(templatePath(page)), { recursive: true });
  await mkdir(dirname(localePath('fr', page)), { recursive: true });
  await mkdir(dirname(localePath('en', page)), { recursive: true });
  await writeFile(templatePath(page), fr.template);
  await writeFile(localePath('fr', page), `${JSON.stringify(fr.locale, null, 2)}\n`);
  try {
    const enHtml = await readFile(join(root, 'en', page.en), 'utf8');
    const en = extractDocument(enHtml);
    const aligned = fr.locale.text.length === en.locale.text.length && fr.locale.attributes.length === en.locale.attributes.length;
    await writeFile(localePath('en', page), `${JSON.stringify(aligned ? en.locale : fr.locale, null, 2)}\n`);
    console.log(aligned ? `Seeded ${route} from aligned FR/EN pages.` : `Seeded ${route}; EN structure differs, so the FR dictionary is the translation starting point.`);
  } catch {
    await writeFile(localePath('en', page), `${JSON.stringify(fr.locale, null, 2)}\n`);
    console.log(`Seeded ${route}; no EN output exists, so the FR dictionary is the translation starting point.`);
  }
}

async function renderPage(page, locale, readPartial) {
  const [template, dictionary] = await Promise.all([
    readFile(templatePath(page), 'utf8'),
    readFile(localePath(locale, page), 'utf8').then(JSON.parse)
  ]);
  // Partials are expanded before the page dictionary and before the English path
  // rewrite, so shared navigation links get the same ../ and route mapping treatment
  // as page-level links.
  let html = await expandIncludes(template, readPartial);
  html = renderPlaceholders(html, dictionary);
  if (locale === 'en') html = localizeEnglishPaths(html);
  html = injectSeoLinks(html, page, locale);
  return generatedBanner(html, page);
}

async function build({ check = false } = {}) {
  const mismatches = [];
  const readPartial = Object.fromEntries(await Promise.all(
    ['fr', 'en'].map(async locale => [locale, await loadPartials(locale)])
  ));
  for (const page of pages) {
    for (const locale of ['fr', 'en']) {
      const html = await renderPage(page, locale, readPartial[locale]);
      const output = locale === 'fr' ? join(root, page.fr) : join(root, 'en', page.en);
      if (check) {
        const current = await readFile(output, 'utf8');
        if (current !== html) mismatches.push(output.slice(root.length + 1));
      } else {
        await mkdir(dirname(output), { recursive: true });
        await writeFile(output, html);
      }
    }
  }
  if (mismatches.length) {
    console.error(`Generated pages are stale:\n${mismatches.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(check ? 'All generated translations are current.' : `Built ${pages.length * 2} localized pages.`);
  }
}

const command = process.argv[2];
if (command === 'extract') await extract();
else if (command === 'build') await build();
else if (command === 'check') await build({ check: true });
else if (command === 'seed') await seed(process.argv[3]);
else throw new Error('Usage: node scripts/i18n.mjs <extract|seed route|build|check>');
