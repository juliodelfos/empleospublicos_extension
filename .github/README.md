# GitHub Workflows

Este directorio contiene configuración de GitHub Actions para CI/CD.

## 🎨 Vibe Coding

Este proyecto es **vibe coding puro**: sin frameworks, sin build tools, sin dependencias innecesarias.

Los workflows están diseñados con la misma filosofía: simples, directos, sin over-engineering.

## Workflows Activos

### validate.yml
Validación automática en cada push/pull request:
- ✅ Valida `manifest.json`
- ✅ Verifica archivos necesarios
- ✅ Valida dimensiones de iconos
- ✅ Chequea documentación
- ✅ Busca código de debug

Se ejecuta en cada:
- Push a `main` o `dev`
- Pull request hacia `main` o `dev`

## Próximos Workflows

- [ ] `publish-release.yml` - Publicar en Chrome Web Store automáticamente
- [ ] `test.yml` - Tests e2e (cuando se agreguen)

## Cómo Agregar un Nuevo Workflow

1. Crea archivo en `.github/workflows/nombre.yml`
2. Usa [GitHub Actions documentation](https://docs.github.com/en/actions)
3. Haz un PR para revisión
4. **Mantén la simplicidad** — El workflow debe ser legible y comprensible

## Debugging

Para ver logs de un workflow:
1. Ve a la sección "Actions" en GitHub
2. Selecciona el workflow fallido
3. Haz clic en el job para ver detalles
