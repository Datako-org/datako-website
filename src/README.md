# Static i18n sources

Localized HTML pages are generated at build time so search engines and users receive complete documents without a JavaScript translation dependency.

- `pages/` contains one shared structural template per route.
- `locales/fr/` and `locales/en/` contain only translated text and attributes.
- `npm run i18n:seed -- <route>` onboards a page whose locale structures are not yet aligned.
- `npm run i18n:build` generates the historical French routes and their `/en/` equivalents.
- `npm run i18n:check` verifies that committed HTML outputs are current.

Do not edit a generated route directly. Edit its shared template or locale dictionary, then rebuild.
