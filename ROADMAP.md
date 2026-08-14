# Roadmap - Filtrar ofertas empleospublicos.cl

Plan de desarrollo futuro y mejoras para la extensión.

## 📋 Versiones

### ✅ v1.4.0 (Actual)
**Estado**: lista para enviar a Chrome Web Store.

- ✅ Filtrado por palabras clave.
- ✅ Filtrado por 11 categorías profesionales (rubros).
- ✅ Conteos por pestaña y motivos de exclusión visibles.
- ✅ Vista temporal de ofertas ocultas.
- ✅ Modo lista con navegación por teclado.
- ✅ Persistencia de región.
- ✅ Motor de filtrado precompilado y procesamiento incremental.
- ✅ Adaptador del portal actual con fallback legado limitado.
- ✅ Búsqueda insensible a acentos.
- ✅ Almacenamiento local de filtros.
- ✅ Exclusión de páginas de detalle/postulación para evitar bloqueos accidentales.

---

### 📅 Próxima versión

#### Gestión de filtros
- [ ] Exportar/importar configuración.
- [ ] Guardar conjuntos de filtros (presets).

#### Filtrado avanzado
- [ ] Filtrado por ubicación/región.
- [ ] Filtrado por rango de sueldo.

---

### 🔮 v2.0 (Mediano plazo)

- [ ] Expresiones regulares para filtros complejos.
- [ ] Historial de ofertas vistas.
- [ ] Notificaciones de Chrome para nuevas ofertas relevantes.
- [ ] Sincronización opcional de configuración.

---

### 🚀 v3.0+ (Largo plazo, si hay demanda)

- [ ] Extensión para Firefox.
- [ ] Presets compartibles por la comunidad.
- [ ] Recomendaciones inteligentes de filtros.

---

## 🎯 Prioridades

### Corto plazo
1. Publicar `v1.4.0` en Chrome Web Store.
2. Confirmar periódicamente el contrato DOM del portal.
3. Recopilar feedback de usuarios.
4. Resolver bugs de compatibilidad si empleospublicos.cl cambia su estructura.

### Mediano plazo
1. Filtrado por ubicación.
2. Exportar/importar configuración.
3. Tema oscuro.
4. Contador mejorado.

### Largo plazo
1. Historial de ofertas.
2. Notificaciones.
3. Extensión para Firefox.

---

## 📊 Métricas de éxito

- Instalaciones activas.
- Rating promedio en Chrome Web Store.
- Bugs reportados por versión.
- Feedback de usuarios en GitHub Issues.
- Frecuencia de cambios necesarios por modificaciones del sitio.

---

## 🤝 Contribuciones

¿Quieres ayudar?

1. Abre un GitHub Issue con la propuesta o bug.
2. Define alcance simple y verificable.
3. Haz fork o rama nueva.
4. Implementa manteniendo JavaScript vanilla y sin dependencias.
5. Actualiza documentación si cambia comportamiento público.
6. Envía Pull Request.

---

## 📝 Changelog resumido

### v1.0.5
- Fix: páginas de detalle/postulación ya no se ocultan con filtros activos.
- Versión lista para actualización en Chrome Web Store.

### v1.0.1
- Interfaz moderna con tabs.
- 11 categorías profesionales.
- Búsqueda insensible a acentos.

### v1.0.0
- Filtrado básico por palabras clave.
- UI inicial.
- Storage local.

---

**Última actualización**: 13 de agosto de 2026
