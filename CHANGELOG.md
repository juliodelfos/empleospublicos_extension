# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/),
y este proyecto sigue [Semantic Versioning](https://semver.org/).

## [1.0.5] - 2026-04-18

### Fixed
- Se corrigió un problema donde, al tener filtros de rubro o palabras clave activos, algunas páginas de detalle/postulación podían quedar ocultas por el filtro.
- Las páginas `/pub/convocatorias/convpostularavisoTrabajo.aspx` ahora quedan excluidas del filtrado para que siempre carguen cuando el usuario las abre.

### Changed
- Se reinicia el contador de ofertas filtradas (`blockedCount`) en páginas donde el filtro no debe ejecutarse.
- Se revalida el tipo de página antes de cada re-filtrado para cubrir navegación dinámica del sitio.
- Se actualizó la versión de la extensión a `1.0.5`.

### Release
- Paquete para Chrome Web Store: `empleospublicos_extension_v1.0.5.zip`.

---

## [1.0.1] - 2026-04-07

### Added
- Interfaz moderna con dos tabs (Palabras Clave y Rubros)
- Filtrado por 11 categorías profesionales:
  - Salud, Educación, Derecho, Administración
  - Ingeniería, Ciencias, Artes y Diseño, Finanzas
  - Negocios Internacionales, Construcción, Transporte y Logística
- Búsqueda insensible a acentos (NFD normalization)
  - "médico" = "medico" = "Médico" = "MÉDICO"
- Diseño minimalista con Tailwind-inspired colors
- Ícono azul profesional (#17406F) con iniciales "EP"
- Disclaimer de no-oficial en footer
- Almacenamiento local de filtros (chrome.storage.local)
- Documentación completa (README, ROADMAP, CONTRIBUTING)

### Changed
- Rediseño total de UI (de gradiente morado a blanco/azul moderno)
- Nombre de extensión: "Filtro de Empleos" → "Filtrar ofertas empleospublicos.cl"
- Descripción más clara y enfocada

### Removed
- Feature de captura de filtros nativos (requería Bootstrap dropdown handling complejo)
- Feature de sincronización en la nube (postponed para v2.0)
- Popup inicial con modal de bienvenida

### Technical
- Content script mejorado para detectar ofertas con múltiples selectores
- Normalización de acentos usando Unicode NFD
- Mejor manejo de errores y edge cases
- Soporte para variantes del dominio (www y sin www)

---

## [1.0.0] - 2026-04-01

### Added
- Versión inicial de la extensión
- Filtrado básico por palabras clave
- Panel popup para gestionar filtros
- Almacenamiento local
- Contador de ofertas filtradas
- Icono provisional

### Technical
- Manifest V3
- Content script injection
- Chrome Storage API
- CSS básico

---

## Planeado

### [1.1.0] - Próximo (4-6 semanas)
- Tema oscuro
- Filtrado por ubicación (región, provincia, comuna)
- Filtrado por rango de sueldo
- Guardar presets de filtros
- Exportar/importar configuración
- Soporte para múltiples idiomas (Inglés, Portugués)
- Tooltip informativos
- Historial de búsquedas

### [2.0.0] - Mediano Plazo (3-6 meses)
- Sincronización en la nube (Google Cloud)
- Soporte para expresiones regulares (regex)
- Notificaciones de nuevas ofertas
- Análisis de tendencias
- Historial de ofertas vistas
- API REST para terceros
- Webhook integrations

### [3.0.0] - Largo Plazo (6-12 meses)
- Extensión para Firefox
- Versión web standalone
- App móvil
- Inteligencia artificial (recomendaciones)
- Integración con LinkedIn
- Comunidad de usuarios
- Employer ratings

---

## Cómo Reportar Issues

Si encontras un bug:
1. Busca en [issues existentes](https://github.com/yersonolivares/empleospublicos_extension/issues)
2. [Crea un nuevo issue](https://github.com/yersonolivares/empleospublicos_extension/issues/new)
3. Incluye: versión, pasos para reproducir, comportamiento esperado

---

## Cómo Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para instrucciones detalladas.
