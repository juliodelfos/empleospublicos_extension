# 🤝 Contribuir a Filtrar ofertas empleospublicos.cl

¡Gracias por querer contribuir! Este documento te guía en el proceso.

## 🎨 Filosofía: Vibe Coding

Este proyecto es **vibe coding** puro:
- **Sin frameworks** — Vanilla JavaScript solamente
- **Sin build tools** — HTML, CSS, JS directo
- **Sin dependencias** — Todo en la carpeta, todo autocontendido
- **Simplicidad** — Código limpio sin sobre-ingeniería
- **Velocidad** — Cambios inmediatos, sin compilación

Si contribuyes, mantén este espíritu. El objetivo es resolver el problema de forma elegante sin agregar complejidad.

**[→ Aprende más sobre la filosofía de vibe coding](./VIBE_CODING.md)**

## 📋 Código de Conducta

Se respetuoso con otros contribuidores. No toleramos discriminación, acoso o comportamientos tóxicos.

## 🐛 Reportar Bugs

### Antes de crear un issue:
1. Busca en [issues existentes](https://github.com/yersonolivares/empleospublicos_extension/issues)
2. Revisa la [documentación](README.md)
3. Prueba recargar la extensión (`chrome://extensions/` → 🔄)

### Al crear un issue:
```markdown
**Descripción**
Breve descripción del bug

**Pasos para reproducir**
1. Abre empleospublicos.cl
2. Añade filtro "X"
3. Observa comportamiento inesperado

**Comportamiento esperado**
Qué debería pasar

**Comportamiento actual**
Qué está pasando

**Información**
- Chrome version: 125.0.0.0
- Sistema operativo: macOS Sonoma
- Versión de la extensión: 1.0.5

**Screenshots**
[Si aplica, adjunta capturas]
```

## 💡 Sugerir Mejoras

### Antes de sugerir:
1. Revisa el [ROADMAP.md](ROADMAP.md)
2. Busca feature requests similares

### Formato:
```markdown
**Descripción**
Explica la mejora claramente

**Caso de uso**
Por qué es útil

**Alternativas consideradas**
Otras formas de resolver esto

**Ejemplos**
Screenshots o demos si aplica
```

## 💻 Desarrollo Local

### 1. Fork y clon
```bash
git clone https://github.com/tu-usuario/empleospublicos_extension.git
cd empleospublicos_extension
git remote add upstream https://github.com/yersonolivares/empleospublicos_extension.git
```

### 2. Crea una rama
```bash
git checkout -b feature/mi-feature
# o
git checkout -b fix/nombre-del-bug
```

### 3. Instala localmente
```bash
# En Chrome:
chrome://extensions/ → "Modo de desarrollador" → "Cargar extensión sin empaquetar"
# Selecciona esta carpeta
```

### 4. Haz cambios
- Edita los archivos necesarios
- En `chrome://extensions/` haz clic en 🔄 para recargar
- Prueba en `empleospublicos.cl`

### 5. Testing
```bash
# No hay tests automatizados aún, pero verifica:
- La extensión carga sin errores
- Los filtros funcionan
- No hay console errors (F12 → Console)
- Funciona en Chrome/Edge
```

### 6. Commit con mensaje claro
```bash
git commit -m "feat: agregar tema oscuro"
# o
git commit -m "fix: corregir filtrado de acentos"
```

Usa [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - Nueva característica
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formato, sin cambios lógicos
- `refactor:` - Refactorizar sin nuevas features
- `test:` - Añadir o modificar tests
- `chore:` - Cambios en build, deps, etc.

### 7. Push y Pull Request
```bash
git push origin feature/mi-feature
```

Luego en GitHub:
1. Crea Pull Request desde tu rama
2. Llena el template:
   - Descripción clara
   - Relaciona issue si aplica (`Closes #123`)
   - Screenshots/GIFs si es UI change
   - Testing checklist

## 📝 Guía de Estilo

### JavaScript
```javascript
// ✅ Bien
function filterJobs() {
  const keywords = getKeywords();
  return jobs.filter(job => keywords.includes(job.title));
}

// ❌ Evita
function filterJobs(){const k=getKeywords();return jobs.filter(j=>k.includes(j.title))}
```

**Reglas:**
- 2 espacios de indentación
- Nombres descriptivos (no `x`, `tmp`)
- Comentarios solo donde sea necesario
- Const por defecto, let si necesitas reasignar
- Sin semicolons opcionales
- Camel case para variables/funciones

### Archivos
```
popup.html → Estructura HTML limpia
popup.js   → Lógica del popup
popup.css  → Estilos (Tailwind-inspired)
content.js → Inyección en página
rubros.js  → Datos estáticos
```

## 🧪 Antes de Enviar PR

```
☐ Código sigue la guía de estilo
☐ Sin console.log() o código de debug
☐ Sin cambios no relacionados
☐ La extensión carga sin errores
☐ Probado en Chrome
☐ Documentación actualizada (si aplica)
☐ Commit messages claros
```

## 📦 Proceso de Release

1. **Versioning**: Usamos [Semantic Versioning](https://semver.org/)
   - v1.0.0 (mayor.minor.patch)
   - Cambios breaking = mayor
   - Features nuevas = minor
   - Bugfixes = patch

2. **Checklist de release**
   - [ ] Actualizar `manifest.json` version.
   - [ ] Actualizar `CHANGELOG.md`.
   - [ ] Actualizar `README.md` si cambia el comportamiento público.
   - [ ] Validar sintaxis con `node --check` en los archivos JS principales.
   - [ ] Generar ZIP con el número de versión correcto.
   - [ ] Verificar el `manifest.json` dentro del ZIP.
   - [ ] Crear tag en GitHub.
   - [ ] Subir ZIP a Chrome Web Store.
   - [ ] Crear Release en GitHub.

## ❓ Preguntas

- **Issues**: Para bugs, features y preguntas técnicas.
- **Discussions**: Para debates generales si se habilitan en GitHub.

## 📚 Recursos

- [Chrome Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Gracias por contribuir! 🎉**

Tu ayuda hace que esta extensión sea mejor para todos los que buscan empleo en Chile.
