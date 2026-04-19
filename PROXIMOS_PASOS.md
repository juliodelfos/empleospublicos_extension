# 📋 Próximos Pasos - Filtrar ofertas empleospublicos.cl

Guía operativa para mantener y publicar nuevas versiones de la extensión.

---

## ✅ Estado Actual

- ✅ Versión actual: `1.0.5`
- ✅ Bug corregido: las páginas de detalle/postulación ya no se filtran por error cuando hay rubros o tags activos.
- ✅ Paquete listo para Chrome Web Store:
  ```txt
  empleospublicos_extension_v1.0.5.zip
  ```
- ✅ Copia ordenada en `dist/`:
  ```txt
  dist/empleospublicos_extension_v1.0.5_store.zip
  ```

---

## 🚀 Publicar actualización en Chrome Web Store

1. **Verificar versión en `manifest.json`**
   ```json
   "version": "1.0.5"
   ```

2. **Verificar el ZIP correcto**
   ```bash
   unzip -p empleospublicos_extension_v1.0.5.zip manifest.json | grep '"version"'
   ```

3. **Subir a Chrome Web Store**
   - Entrar al dashboard de Chrome Web Store Developer.
   - Seleccionar la extensión.
   - Subir `empleospublicos_extension_v1.0.5.zip`.
   - Guardar cambios y enviar a revisión.

4. **Probar después de publicar**
   - Activar rubro `Carreras de Salud`.
   - Abrir un detalle de convocatoria.
   - Confirmar que la página de detalle carga normalmente.

---

## 🧪 Checklist de pruebas manuales

Antes de cada release:

- [ ] La extensión carga en `chrome://extensions/` sin errores.
- [ ] El popup abre correctamente.
- [ ] Se pueden agregar y eliminar palabras clave.
- [ ] Se pueden activar y desactivar rubros.
- [ ] El filtrado oculta ofertas en listados.
- [ ] Las páginas de detalle/postulación no se ocultan.
- [ ] El contador de ofertas filtradas se actualiza correctamente.
- [ ] No hay errores relevantes en la consola del navegador.

Validación rápida de sintaxis:

```bash
node --check content.js
node --check popup.js
node --check background.js
node --check rubros.js
```

---

## 📦 Generar ZIP para la store

Comando recomendado:

```bash
zip -r empleospublicos_extension_v1.0.5.zip \
  manifest.json \
  background.js \
  content.js \
  rubros.js \
  popup.html \
  popup.js \
  popup.css \
  icon.svg \
  icons \
  LICENSE \
  README.md \
  CHANGELOG.md
```

Si se genera una copia en `dist/`:

```bash
mkdir -p dist
zip -r dist/empleospublicos_extension_v1.0.5_store.zip \
  manifest.json \
  background.js \
  content.js \
  rubros.js \
  popup.html \
  popup.js \
  popup.css \
  icon.svg \
  icons \
  LICENSE \
  README.md \
  CHANGELOG.md
```

Evitar incluir en el ZIP:

- `.git/`
- `.github/`
- ZIPs antiguos
- scripts de desarrollo
- archivos temporales

---

## 🛠️ Próximas mejoras sugeridas

- [ ] Acotar el filtrado solo a páginas/listados conocidos para reducir falsos positivos futuros.
- [ ] Mejorar el contador: ofertas ocultadas vs. ofertas visibles.
- [ ] Agregar exportar/importar configuración.
- [ ] Agregar filtrado por ubicación.
- [ ] Agregar tema oscuro.

---

## 📝 Flujo recomendado para próximas versiones

1. Hacer el cambio.
2. Probar manualmente.
3. Actualizar `manifest.json`.
4. Actualizar `CHANGELOG.md`.
5. Actualizar README si cambia el comportamiento público.
6. Generar ZIP nuevo con el número de versión correcto.
7. Verificar el `manifest.json` dentro del ZIP.
8. Subir a Chrome Web Store.
9. Crear tag/release en GitHub.

