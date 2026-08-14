import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
const popup = await readFile(new URL('popup.html', root), 'utf8');
const contentCss = await readFile(new URL('content.css', root), 'utf8');

test('mantiene Manifest V3 sin permisos nuevos', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ['storage']);
  assert.equal(manifest.version, '1.4.0');
});

test('carga el arranque antes del orquestador y en el orden correcto', () => {
  assert.equal(manifest.content_scripts[0].run_at, 'document_start');
  assert.deepEqual(manifest.content_scripts[0].css, ['content.css']);
  assert.deepEqual(manifest.content_scripts[0].js, ['boot.js']);
  assert.deepEqual(manifest.content_scripts[1].js, [
    'rubros.js',
    'filter-core.js',
    'portal-adapter.js',
    'content.js',
  ]);
});

test('todos los archivos runtime declarados existen', async () => {
  const files = manifest.content_scripts.flatMap((entry) => [
    ...(entry.css || []),
    ...(entry.js || []),
  ]);
  files.push(manifest.background.service_worker, manifest.action.default_popup);

  await Promise.all(files.map((file) => access(new URL(file, root))));
});

test('el popup expone tabs y estadísticas accesibles', () => {
  assert.match(popup, /role="tablist"/);
  assert.match(popup, /role="tabpanel"/);
  assert.match(popup, /aria-live="polite"/);
  assert.match(popup, /id="undoBtn"/);
});

test('la regla final mantiene ocultas las tarjetas también en modo lista', () => {
  const listRulePosition = contentCss.indexOf('#results-cards.ep-list-mode .job-card');
  const hiddenRulePosition = contentCss.lastIndexOf(
    '#results-cards:not(.ep-reveal-hidden) .job-card.ep-filtered-hidden',
  );

  assert.ok(listRulePosition >= 0);
  assert.ok(hiddenRulePosition > listRulePosition);
  assert.match(contentCss.slice(hiddenRulePosition), /display:\s*none\s*!important/);
});
