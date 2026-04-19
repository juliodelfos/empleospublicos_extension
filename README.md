# Filtrar ofertas empleospublicos.cl

Una extensión de Chrome que filtra empleos en [empleospublicos.cl](https://www.empleospublicos.cl) basándose en palabras clave personalizadas y categorías profesionales.

> **⚠️ Nota:** Esta no es una extensión oficial de empleospublicos.cl

## 🎯 Características

✅ **Filtrado por palabras clave**
- Añade palabras clave personalizadas
- Búsqueda insensible a acentos: `médico` = `medico` = `Médico`
- Los filtros se guardan automáticamente entre sesiones

✅ **Filtrado por categorías (Rubros)**
- 11 categorías profesionales precuradas:
  - 🏥 Salud
  - 📚 Educación
  - 📋 Administración
  - 💰 Finanzas y Contabilidad
  - 🏗️ Construcción y Obras
  - 🚚 Logística y Transporte
  - 💻 Tecnología e Informática
  - 👥 Recursos Humanos
  - 📊 Ventas y Marketing
  - ⚖️ Derecho y Legal
  - 🔒 Seguridad y Vigilancia

✅ **Interfaz moderna**
- Diseño limpio y minimalista (inspirado en shadcn)
- Dos tabs: Palabras Clave y Rubros
- Gestión simple de filtros

✅ **100% privado**
- Los filtros se guardan **localmente** en tu navegador
- No se envían datos a servidores
- Sin recopilación de datos personales

## 📦 Instalación

### Desde Chrome Web Store (Recomendado)
1. Ve a [Chrome Web Store - Filtrar ofertas empleospublicos.cl](https://chrome.google.com/webstore)
2. Busca "Filtrar ofertas empleospublicos.cl"
3. Haz clic en "Añadir a Chrome"
4. Confirma los permisos

### Instalación Manual (Desarrollo)
1. Clona o descarga este repositorio
2. Ve a `chrome://extensions/`
3. Activa el "Modo de desarrollador" (esquina superior derecha)
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona esta carpeta

## 🚀 Cómo Usar

### 1. Abre empleospublicos.cl
```
https://www.empleospublicos.cl
```

### 2. Abre la extensión
Haz clic en el icono azul **"EP"** en la barra de herramientas

### 3. Filtra por palabras clave
- **Tab "Palabras Clave"**
- Escribe una palabra (ej: `médico`)
- Haz clic en "Agregar"
- Las ofertas que NO contengan esa palabra se ocultarán automáticamente

### 4. O filtra por categorías
- **Tab "Rubros"**
- Selecciona una o más categorías (ej: `Salud`, `Derecho`)
- Las ofertas que coincidan con esos rubros se ocultarán automáticamente

### 5. Combina ambos filtros
Puedes usar **palabras clave y rubros** simultáneamente. Si una oferta coincide con cualquier palabra clave o rubro seleccionado, se oculta.

### Nota sobre páginas de detalle
El filtrado se aplica sobre listados de ofertas. Las páginas de detalle/postulación de una convocatoria no se filtran para evitar bloquear contenido que el usuario abrió explícitamente.

## 🔍 Ejemplos

**Eres programador, no buscas trabajos de administración:**
```
Palabras clave: "administración", "contador"
```

**No quieres ver ofertas de salud:**
```
Rubros: Salud
```

**Buscas solo trabajos en región Metropolitana:**
```
Palabras clave: "Arica", "Antofagasta", "Coquimbo"
```

## 🔧 Técnica

### 🎨 Filosofía: Vibe Coding

Este proyecto sigue el concepto de **vibe coding**:
- **Sin frameworks pesados** — Solo Vanilla JavaScript
- **Sin compiladores** — HTML, CSS, JS directo
- **Sin dependencias externas** — Todo autocontendido
- **Código limpio y legible** — Sin sobre-ingeniería
- **Iteración rápida** — Cambios inmediatos sin build

El código es simple, mantenible, y se enfoca en resolver el problema sin complejidad innecesaria.

**[→ Lee más sobre Vibe Coding aquí](./VIBE_CODING.md)**

### Tecnologías
- **Manifest V3** (estándar actual de Chrome)
- Vanilla JavaScript (sin dependencias externas)
- Chrome Storage API para persistencia local
- CSS moderno con Tailwind-inspired styling

### Estructura de Archivos
```
├── manifest.json          # Configuración de la extensión
├── popup.html            # Interfaz del popup
├── popup.js              # Lógica del popup
├── popup.css             # Estilos del popup
├── content.js            # Script que filtra ofertas
├── background.js         # Service worker
├── rubros.js             # Base de datos de categorías
├── icons/                # Iconos en 3 tamaños
└── README.md             # Este archivo
```

### Permisos Solicitados
- `storage` — Guardar filtros localmente
- `https://www.empleospublicos.cl/*` — Ejecutar el filtro en el sitio
- `https://empleospublicos.cl/*` — Variante sin www

## 📦 Release / Chrome Web Store

El paquete listo para subir a Chrome Web Store se genera como ZIP con los archivos runtime de la extensión.

Versión actual:

```txt
empleospublicos_extension_v1.0.5.zip
```

También puede existir una copia en `dist/` para mantener ordenados los paquetes de release. Antes de subir una actualización, verifica que `manifest.json` tenga una versión mayor que la ya publicada.

## 📊 Privacidad

**¿Qué datos recopila?**
- ❌ Ninguno

**¿Dónde se guardan los filtros?**
- ✅ Localmente en `chrome.storage.local` (tu navegador)

**¿Se envían datos a terceros?**
- ✅ No, nunca

## 🐛 Soporte

¿Encontraste un bug? Sigue estos pasos:

1. Abre un [Issue en GitHub](https://github.com/yersonolivares/empleospublicos_extension/issues)
2. Describe el problema:
   - ¿Qué hiciste?
   - ¿Qué esperabas?
   - ¿Qué pasó?
   - Tu versión de Chrome
3. Adjunta capturas de pantalla si es posible

## 🔄 Versiones

### v1.0.5 (Actual)
- ✅ Filtrado por palabras clave
- ✅ Filtrado por 11 categorías (rubros)
- ✅ Interfaz moderna con dos tabs
- ✅ Búsqueda insensible a acentos
- ✅ Almacenamiento local de filtros
- ✅ Protección para no filtrar páginas de detalle/postulación
- ✅ Disclaimer de no-oficial
- ✅ Ícono azul con iniciales "EP"

## 🎯 Próximas Mejoras

Ver [ROADMAP.md](./ROADMAP.md) para el plan completo de desarrollo.

**v1.1 (Planeado):**
- [ ] Tema oscuro
- [ ] Soporte para múltiples idiomas
- [ ] Filtrado avanzado por ubicación
- [ ] Estadísticas de búsqueda
- [ ] Exportar/importar configuración

**v2.0 (Largo plazo):**
- [ ] Sincronización en la nube
- [ ] Expresiones regulares (regex)
- [ ] Historial de ofertas
- [ ] Notificaciones de nuevas ofertas

## 📄 Licencia

MIT License - Eres libre de usar, modificar y distribuir este código.

## 👨‍💻 Autor

Desarrollado por [Yerson Olivares](https://github.com/yersonolivares)

---

Hecho con ❤️ para facilitar la búsqueda de empleos en Chile 🇨🇱
