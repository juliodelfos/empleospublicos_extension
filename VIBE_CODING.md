# 🎨 Vibe Coding

## ¿Qué es Vibe Coding?

**Vibe coding** es una filosofía de desarrollo que prioriza:

✨ **Simplicidad** — Sin complejidad innecesaria
🚀 **Velocidad** — Cambios inmediatos, sin compilación
📦 **Autocontención** — Todo en el mismo lugar
🎯 **Claridad** — Código que se entiende a primera vista
🙅 **Anti over-engineering** — Sin frameworks que no necesitamos

## En Esta Extensión

### ✅ Lo que HACEMOS

```javascript
// ✨ Simple y directo
function normalizeText(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Guardamos en localStorage
chrome.storage.local.set({ filters: keywords });
```

### ❌ Lo que EVITAMOS

```javascript
// ❌ Over-engineering
import { NormalizationLibrary } from '@libs/unicode/normalization';
const service = new NormalizationService();
const result = await service.normalize(text);

// ❌ Dependencias innecesarias
npm install everything-under-the-sun
```

## Principios del Código

### 1. Vanilla JavaScript Puro
- **No React, Vue, Angular** — Puro JS
- **No Webpack, Vite, esbuild** — Sin build tools
- **No npm packages** — HTML, CSS, JS directo
- **HTML estándar** — Sin JSX, sin templating

### 2. Código Limpio
```javascript
// ✅ Nombres descriptivos
function filterJobs() {
  const keywords = getStoredKeywords();
  return jobs.filter(job => matchesKeywords(job, keywords));
}

// ❌ Nombres crípticos
function f() {
  const k = getK();
  return j.filter(i => m(i, k));
}
```

### 3. Estructura Plana
```
empleospublicos_extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
├── content.js
├── rubros.js
└── icons/
```

**Sin:**
- `src/`, `lib/`, `components/`, `utils/`, `services/`
- Jerarquía compleja
- Carpetas que no agregan valor

### 4. Comentarios Mínimos
```javascript
// ✅ Código que se explica solo
function shouldBlockJob(job) {
  return hasBlockedKeyword(job.title) || isBlockedCategory(job);
}

// ❌ Comentarios que dicen obviedades
// Verifica si el trabajo debe bloquearse
function shouldBlockJob(job) {
  return hasBlockedKeyword(job.title) || isBlockedCategory(job);
}
```

### 5. Sin Abstracciones Prematuras
```javascript
// ✅ Directo
if (keywords.includes(keyword)) {
  keywords.splice(index, 1);
  save();
}

// ❌ Sobre-ingeniería
class KeywordManager {
  private keywords: Array<Keyword>;
  public removeKeyword(id: ID): Observable<void> {
    return this.httpClient.post('/api/keywords/remove', { id })
      .pipe(tap(() => this.refreshState()));
  }
}
```

## La Vibe en Acción

### Característica: Filtrado de Acentos

**Con vibe coding:**
```javascript
// content.js - 3 líneas
function normalizeText(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
```

**Sin vibe coding (hipotético):**
```javascript
// Necesitarías:
// npm install unicode-normalization
// npm install accent-remover
// npm install string-utilities
// import { UnicodeNormalizer } from '@lib/unicode';
// const normalizer = new UnicodeNormalizer(options);
// await normalizer.initialize();
// const result = normalizer.normalize(text);
```

## Beneficios del Vibe Coding

| Aspecto | Vibe Coding | Over-Engineering |
|---------|------------|-----------------|
| **Tamaño** | 112 KB | 2+ MB |
| **Velocidad** | Instantáneo | Requiere build |
| **Mantenimiento** | Simple | Complejo |
| **Debugging** | Directo (F12) | Transpilers, sourcemaps |
| **Curva aprendizaje** | Baja | Alta |
| **Contribuciones** | Fácil | Difícil |

## Cómo Mantener el Vibe

Si contribuyes a esta extensión:

1. **Lee el código primero**
   - Entiende cómo funciona hoy
   - Mantén la simplicidad

2. **No agregues frameworks**
   - Si necesitas UI reactiva → JS puro
   - Si necesitas estado → chrome.storage.local

3. **Evita dependencias**
   - ¿Puedes hacerlo en vanilla JS?
   - Entonces no necesitas npm

4. **Comenta cuando sea necesario**
   - Código claro no necesita comentarios
   - Comenta el "por qué", no el "qué"

5. **Mantén la estructura plana**
   - Archivos en la raíz
   - Sin carpetas anidadas profundas

## Futuro: Vibe Coding en v2.0

Incluso con más features, mantendremos el vibe:

- ❌ NO: Usar Redux para estado
- ✅ SÍ: Expandir chrome.storage

- ❌ NO: TypeScript + Webpack
- ✅ SÍ: JavaScript puro + comentarios

- ❌ NO: React para UI
- ✅ SÍ: HTML + CSS + Vanilla JS

- ❌ NO: Cloudflare Workers
- ✅ SÍ: Chrome Storage + Local

## Inspiración

El vibe coding es inspirado por:
- **10 Simple Rules for Good Code** — Robert C. Martin
- **The Pragmatic Programmer** — Hunt & Thomas
- **Small, Sharp Software Tools** — filosofía Unix
- **Web Components** — standards nativa HTML

## Resumen

**Vibe coding no es perezoso, es elegante.**

Elegir las herramientas correctas (o ninguna) es más difícil que agregar todas las herramientas.

Mantener el código simple requiere más disciplina que hacerlo complejo.

---

**Si tu PR agrega complejidad sin agregar valor, probablemente no sea el vibe de este proyecto.**

Hecho con ❤️ y buen vibes 🎨
