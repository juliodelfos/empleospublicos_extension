#!/bin/bash

# Git Setup Script para Filtrar ofertas empleospublicos.cl
# Este script inicializa el repositorio Git automáticamente

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       Inicializando repositorio Git                           ║"
echo "║       empleospublicos_extension                               ║"
╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "manifest.json" ]; then
  echo "❌ Error: manifest.json no encontrado"
  echo "Por favor ejecuta este script desde la raíz del proyecto"
  exit 1
fi

echo "📋 Verificando archivos..."

# Verificar archivos críticos
required_files=(
  "manifest.json"
  "popup.html"
  "content.js"
  "rubros.js"
  "README.md"
  "LICENSE"
  ".gitignore"
)

for file in "${required_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Falta: $file"
    exit 1
  fi
done

echo "✅ Todos los archivos presentes"
echo ""

# Inicializar git
echo "🔧 Inicializando repositorio Git..."
git init
git config user.email "tu-email@example.com" || echo "⚠️  Configura tu email con: git config user.email"
git config user.name "Tu Nombre" || echo "⚠️  Configura tu nombre con: git config user.name"

echo "📦 Añadiendo archivos..."
git add .

echo "💬 Creando primer commit..."
git commit -m "Initial commit: Filtrar ofertas empleospublicos.cl v1.0.1

- Filtrado por palabras clave (case-insensitive)
- Filtrado por 11 categorías profesionales
- Interfaz moderna con dos tabs
- Almacenamiento local de filtros
- Búsqueda insensible a acentos
- Ícono profesional (#17406F)
- Documentación completa
- CI/CD con GitHub Actions"

echo "🔀 Renombrando rama a 'main'..."
git branch -M main

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Repositorio inicializado exitosamente"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "📝 Para conectar con GitHub:"
echo ""
echo "1. Crea repositorio en: https://github.com/new"
echo "   - Nombre: empleospublicos_extension"
echo "   - Descripción: Filter job offers on empleospublicos.cl"
echo "   - NO inicialices con README (ya lo tienes)"
echo ""

echo "2. Conecta el repositorio remoto:"
echo "   git remote add origin https://github.com/TU-USUARIO/empleospublicos_extension.git"
echo ""

echo "3. Haz push del código:"
echo "   git push -u origin main"
echo ""

echo "🎉 ¡Listo!"
echo ""
echo "Próximos pasos:"
echo "  • Verifica que GitHub Actions esté activado en Settings"
echo "  • Añade topics a tu repositorio"
echo "  • Comparte con la comunidad"
echo ""
