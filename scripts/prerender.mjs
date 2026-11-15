// Injects a server render of the page into dist/index.html (static prerender).
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);
const html = render();
const file = resolve(root, 'dist/index.html');
const tpl = readFileSync(file, 'utf8');
if (!tpl.includes('<div id="root"></div>')) throw new Error('root container not found');
writeFileSync(file, tpl.replace('<div id="root"></div>', `<div id="root">${html}</div>`));
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerendered ${Math.round(html.length / 1024)} KB of HTML into dist/index.html`);
