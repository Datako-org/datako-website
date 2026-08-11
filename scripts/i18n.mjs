import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const pages = [
  { route: 'index', fr: 'index.html', en: 'index.html' },
  { route: 'blog', fr: 'blog.html', en: 'blog.html' },
  { route: 'solutions', fr: 'solutions.html', en: 'solutions.html' },
  { route: 'prestations', fr: 'prestations.html', en: 'prestations.html' },
  { route: 'formations', fr: 'formations.html', en: 'formations.html' },
  { route: 'academy', fr: 'academy.html', en: 'academy.html' },
  { route: 'matching', fr: 'matching.html', en: 'matching.html' },
  { route: 'contact', fr: 'contact.html', en: 'contact.html' },
  { route: 'solution-fleet', fr: 'solution-fleet.html', en: 'solution-fleet.html' },
  { route: 'solution-stations', fr: 'solution-stations.html', en: 'solution-stations.html' },
  { route: 'legal', fr: 'mentions-legales.html', en: 'legal.html' },
  { route: 'privacy', fr: 'politique-confidentialite.html', en: 'privacy.html' },
  { route: 'thanks', fr: 'merci.html', en: 'thanks.html' }
];

const templatePath = page => join(root, 'src', 'pages', `${page.route}.html`);
const localePath = (locale, page) => join(root, 'src', 'locales', locale, `${page.route}.json`);

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

async function renderPage(page, locale) {
  const [template, dictionary] = await Promise.all([
    readFile(templatePath(page), 'utf8'),
    readFile(localePath(locale, page), 'utf8').then(JSON.parse)
  ]);
  let html = renderPlaceholders(template, dictionary);
  if (locale === 'en') html = localizeEnglishPaths(html);
  html = injectSeoLinks(html, page, locale);
  return generatedBanner(html, page);
}

async function build({ check = false } = {}) {
  const mismatches = [];
  for (const page of pages) {
    for (const locale of ['fr', 'en']) {
      const html = await renderPage(page, locale);
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
