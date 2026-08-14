import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../filter-core.js', import.meta.url), 'utf8');
const rubrosSource = await readFile(new URL('../rubros.js', import.meta.url), 'utf8');
const context = vm.createContext({});
vm.runInContext(source, context);
vm.runInContext(rubrosSource, context);
const { normalizeText, compileRules, matchText } = context.EPFilterCore;

test('normaliza mayúsculas, acentos y espacios', () => {
  assert.equal(normalizeText('  MÉDICO   Cirujano '), 'medico cirujano');
});

test('compila palabras sin duplicados normalizados', () => {
  const rules = compileRules({ filters: ['Médico', 'medico', '  abogado  '] });
  assert.equal(rules.keywordRules.length, 2);
  assert.equal(rules.keywordRules[0].normalized, 'medico');
  assert.equal(rules.keywordRules[1].normalized, 'abogado');
});

test('explica una coincidencia por palabra personalizada', () => {
  const rules = compileRules({ filters: ['análisis de datos'] });
  const result = matchText('Jefatura de Análisis de Datos', rules);

  assert.equal(result.blocked, true);
  assert.equal(result.reasons[0].type, 'keyword');
  assert.equal(result.reasons[0].label, 'análisis de datos');
});

test('explica una coincidencia por rubro y palabra interna', () => {
  const rules = compileRules({
    rubros: ['salud'],
    definitions: {
      salud: {
        label: 'Carreras de Salud',
        keywords: ['hospital', 'médico'],
      },
    },
  });

  const result = matchText('Servicio en Hospital Regional', rules);
  assert.equal(result.blocked, true);
  assert.equal(result.reasons[0].type, 'rubro');
  assert.equal(result.reasons[0].label, 'Carreras de Salud');
  assert.equal(result.reasons[0].keyword, 'hospital');
});

test('no bloquea texto sin coincidencias', () => {
  const rules = compileRules({ filters: ['abogado'] });
  const result = matchText('Ingeniero de software', rules);
  assert.equal(result.blocked, false);
  assert.equal(result.reasons.length, 0);
});

test('limita el número de motivos devueltos', () => {
  const rules = compileRules({ filters: ['uno', 'dos', 'tres', 'cuatro'] });
  const result = matchText('uno dos tres cuatro', rules, 3);
  assert.equal(result.reasons.length, 3);
});

test('compila el catálogo real de rubros', () => {
  const definitions = Object.fromEntries(
    vm.runInContext('getRubros()', context).map((rubro) => [rubro.id, rubro]),
  );
  const rules = compileRules({ rubros: ['salud'], definitions });
  const result = matchText('Servicio de Salud Metropolitano / Hospital Regional', rules);

  assert.equal(result.blocked, true);
  assert.equal(result.reasons[0].id, 'salud');
});
