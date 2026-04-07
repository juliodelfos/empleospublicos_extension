# Roadmap - Filtrar ofertas empleospublicos.cl

Plan de desarrollo futuro y próximas mejoras para la extensión.

## 📋 Versiones Planeadas

### ✅ v1.0.1 (Actual - En revisión)
**Estado**: En Chrome Web Store (pendiente aprobación)

- ✅ Filtrado por palabras clave
- ✅ Filtrado por 11 categorías profesionales (rubros)
- ✅ Interfaz moderna con dos tabs
- ✅ Búsqueda insensible a acentos (NFD normalization)
- ✅ Almacenamiento local de filtros
- ✅ Disclaimer de no-oficial
- ✅ Ícono azul con iniciales "EP"

---

### 📅 v1.1 (Próximo - Q2 2026)

#### **Interfaz y Experiencia**
- [ ] **Tema oscuro** (`prefers-color-scheme: dark`)
- [ ] **Animaciones mejoradas** (transiciones más suaves)
- [ ] **Tooltips informativos** (al pasar mouse sobre elementos)
- [ ] **Modal de "¿Primera vez?"** con tutorial interactivo

#### **Filtrado Avanzado**
- [ ] **Filtrado por ubicación** (región, provincia, comuna)
  - Extraer ubicación del listado de empleospublicos.cl
  - Crear selector de regiones de Chile
- [ ] **Filtrado por rango de sueldo** (mínimo, máximo)
- [ ] **Filtrado por tipo de contrato** (indefinido, plazo fijo, etc.)
- [ ] **Historial de búsquedas** (búsquedas recientes)

#### **Gestión de Filtros**
- [ ] **Guardar conjuntos de filtros** (presets)
  - Ej: "Búsqueda Médica", "Búsqueda Administrativa"
  - Cambiar entre presets con 1 clic
- [ ] **Exportar configuración** (JSON)
- [ ] **Importar configuración** (desde archivo)

#### **Estadísticas**
- [ ] **Contador mejorado** (ofertas ocultadas vs mostradas)
- [ ] **Gráfico de tendencias** (últimos 7 días)
- [ ] **Categorías más buscadas** (chart simple)

#### **Internacionalización**
- [ ] **Soporte para múltiples idiomas**
  - Español (actual)
  - Inglés
  - Portugués
- [ ] Selector de idioma en popup

---

### 🔮 v2.0 (Mediano Plazo - Q4 2026)

#### **Sincronización en la Nube**
- [ ] **Google Cloud Storage** para sincronización entre dispositivos
  - Backup automático de configuración
  - Restaurar en otro navegador/dispositivo
- [ ] **Autenticación con Google** (opcional)
- [ ] **Control de privacidad** (qué datos sincronizar)

#### **Filtrado Avanzado con Regex**
- [ ] **Expresiones regulares** para filtros complejos
  - Ej: `/médico|doctor|galeno/i`
- [ ] **Constructor visual de regex** (ayuda)
- [ ] **Validación y previsualizaciones**

#### **Integración con API**
- [ ] **Webhook para notificaciones** (si hay nueva oferta que coincide)
  - Integración con Slack, Discord, Telegram (futura)
- [ ] **REST API** para automatización
- [ ] **IFTTT support** (If This Then That)

#### **Historial y Análisis**
- [ ] **Historial de ofertas vistas/ocultadas**
  - Almacenar en local storage o cloud
  - Capacidad de recuperar ofertas
- [ ] **Análisis de tendencias**
  - Rubros más solicitados
  - Tendencias salariales
  - Instituciones que más ofrecen

#### **Notificaciones**
- [ ] **Notificaciones de Chrome** cuando nuevas ofertas coinciden
- [ ] **Notificaciones de email** (opt-in)
- [ ] **Frecuencia configurable** (cada hora, diaria, semanal)

---

### 🚀 v3.0 (Largo Plazo - 2027+)

#### **Inteligencia Artificial**
- [ ] **Recomendaciones basadas en IA**
  - Aprender de tus búsquedas
  - Sugerir filtros automáticamente
- [ ] **Análisis de CV y matching**
  - Cargar CV del usuario
  - Mostrar compatibilidad (%)
- [ ] **Optimización de búsqueda** con ML

#### **Comunidad**
- [ ] **Compartir presets** con otros usuarios
  - Presets públicos en galería
  - Votos y comentarios
- [ ] **Ranking de empleadores** (basado en opiniones)
- [ ] **Comentarios sobre empresas** (employer reviews)

#### **Plataforma Multiplataforma**
- [ ] **Extensión para Firefox**
- [ ] **Extensión para Safari** (si es viable)
- [ ] **Versión web** (webapp independiente)
- [ ] **App móvil** (React Native)

#### **Integraciones Avanzadas**
- [ ] **Integración con LinkedIn**
- [ ] **Exportar a Google Calendar** (fechas de cierre)
- [ ] **Integración con Indeed, Linkedin, etc.** (agregador)

---

## 🎯 Prioridades

### Corto Plazo (Inmediato - 2 semanas)
1. ✅ Publicar en Chrome Web Store
2. ✅ Recopilar feedback inicial de usuarios
3. Documentación de uso (YouTube tutorial)
4. Bug fixes si los hay

### Mediano Plazo (1-3 meses)
1. Tema oscuro (UI rápida, alto impacto)
2. Filtrado por ubicación
3. Exportar/importar configuración
4. Multi-idioma (al menos Inglés)

### Largo Plazo (6+ meses)
1. Sincronización en la nube
2. Historial y análisis
3. Notificaciones
4. Integraciones comunitarias

---

## 📊 Métricas de Éxito

Para priorizar qué construir, vamos a medir:

- **Instalaciones totales** (meta: 1000+ en primer mes)
- **Retención diaria** (% de usuarios que vuelven)
- **Ratings promedio** (meta: 4.5+ estrellas)
- **Feedback de usuarios** (en GitHub issues)
- **Tiempo en uso** (chrome web store analytics)

---

## 🤝 Contribuciones

¿Quieres ayudar a desarrollar nuevas características?

1. Abre un **GitHub Issue** con tu propuesta
2. Discutimos el alcance y diseño
3. Hacemos un **fork** de la rama `dev`
4. Desarrollas la característica
5. Envías un **Pull Request**
6. Revisamos y mergeamos

**Directrices:**
- Código limpio y comentado
- Tests (si es aplicable)
- Documentación actualizada
- Sin dependencias externas (JS vanilla)

---

## 📝 Changelog

### v1.0.1 (Actual)
- Publicación en Chrome Web Store
- Diseño moderno con tabs
- 11 categorías profesionales
- Búsqueda insensible a acentos

### v1.0.0 (Initial)
- Filtrado básico por palabras clave
- UI inicial
- Storage local

---

## ❓ Preguntas Frecuentes

**¿Cuándo sale v1.1?**
- Si todo va bien, en 4-6 semanas post-lanzamiento

**¿Se mantendrá gratis?**
- Sí, siempre gratis. La versión 3.0 podría tener features premium (opcional)

**¿Puedo solicitar una característica?**
- ¡Claro! Abre un issue en GitHub con "Feature Request"

**¿Qué pasa si empleospublicos.cl cambia su estructura?**
- Haremos un update rápido. Reporta en GitHub si ves problemas

---

## 📞 Contacto

- **GitHub Issues**: [Reportar bugs y sugerencias](https://github.com/yersonolivares/empleospublicos_extension/issues)
- **Email**: yerson@example.com (ajusta con tu email real)
- **Twitter**: [@username](https://twitter.com/username) (si tienes)

---

**Última actualización**: Abril 7, 2026
