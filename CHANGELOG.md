# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/),
y este proyecto sigue [Semantic Versioning](https://semver.org/).

## [1.4.0] - 2026-08-13

### Agregado
- Barra de estado en el listado con ofertas totales, visibles y ocultas.
- Vista temporal de ofertas ocultas con el motivo exacto del filtro aplicado.
- Opción para deshacer el último cambio de palabras o rubros desde el popup.
- Pruebas unitarias del motor de normalización y coincidencia.

### Mejorado
- Separa el motor de filtros, el adaptador del portal y los estilos del orquestador principal.
- Procesa incrementalmente las tarjetas nuevas y precompila las reglas de filtrado.
- Evita el parpadeo inicial del listado con un arranque seguro de 1,5 segundos.
- Muestra estadísticas y badges por pestaña, en vez de depender de un contador global.
- Mejora la navegación por teclado y la semántica accesible del popup.

### Compatibilidad
- Mantiene el contrato del portal 2026 y un fallback pequeño para listados antiguos conocidos.
- No agrega permisos ni dependencias externas.

## [1.3.3] - 2026-06-27

### Corregido
- Mantiene ocultas las ofertas filtradas al cambiar de modo cards a modo listado; una regla CSS del listado estaba sobrescribiendo `display: none`.
- Restaura la navegación con `J` y `K` después de usar el botón flotante de vista, quitando el foco del botón tras cambiar de modo.

## [1.3.2] - 2026-06-27

### Corregido
- Amplía el rubro Salud para excluir también ofertas identificadas por señales institucionales y de área como `Ministerio de Salud`, `Servicio de Salud`, `Hospital`, `CRS`, `CESFAM`, `COSAM`, `Ley 19.664`, `Ley 15.076` y `Salud`.
- Corrige casos donde cargos administrativos o técnicos de instituciones de salud seguían visibles porque no contenían profesiones clínicas en el título.

## [1.3.1] - 2026-06-27

### Corregido
- Evita que una actualización de la extensión borre filtros, rubros, pausa, modo de vista y última región guardada.
- Refuerza la persistencia de región en el portal actual de empleospublicos.cl, esperando más tiempo la carga remota de opciones y sincronizando el select visual con el select oculto.
- Agrega detección más robusta de controles de región para cambios menores del DOM del portal.

## [1.3.0] - 2026-06-21

### Added
- Soporte para el nuevo portal 2026 de empleospublicos.cl, que ahora renderiza convocatorias en `#results-cards .job-card`.
- Persistencia automática de la última región seleccionada: al recargar el portal se reaplica en `#filter-region` y `#hero-region-select`.
- Auto-carga limitada de más resultados cuando los filtros de la extensión dejan muy pocas ofertas visibles.

### Changed
- Readaptación de botones de acción para las nuevas cards: copiar link y añadir a Google Calendar.
- Modo lista/grilla actualizado para el nuevo layout del portal, manteniendo fallback para la estructura antigua.

### Removed
- Eliminada la lógica obsoleta que ocultaba la antigua sección de cifras `#gestionEmpleos`, ya no presente en el portal actual.

## [1.2.1] - 2026-06-01

### Fixed
- Se ocultó automáticamente el bloque de cifras de la portada (`#gestionEmpleos`) para evitar que esa información se muestre en el sitio.

### Release
- Paquete para Chrome Web Store: `empleospublicos_extension_v1.2.1.zip`.

## [1.2.0] - 2026-05-18

### Added
- Modo lista con navegación por teclado usando `J`, `K` y `Enter`.
- Botón para copiar el link del concurso desde cada tarjeta.
- Botón para crear en Google Calendar un evento de día completo para la fecha tope de postulación.
- Nuevas palabras clave en rubros de Salud y Finanzas: `psiquiatra`, `siquiatra`, `pabellón`, `pabellon` y `presupuesto`.

### Changed
- Se reemplazaron los iconos sociales de las tarjetas por acciones útiles.
- Se mantuvo el botón de Calendarización y se normalizó su estilo junto con las demás acciones.
- Se mejoró la convivencia con filtros nativos del sitio, como región.

### Fixed
- El filtrado ya no debe afectar vistas de detalle/postulación de concursos.

### Release
- Paquete para Chrome Web Store: `empleospublicos_extension_v1.2.0.zip`.

---

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
