#!/bin/bash

# Script de deployment para Bulk Update Pro
# Uso: ./deploy.sh [version]

set -e

VERSION=${1:-"1.0.0"}
APP_NAME="bulk-update-pro"
ZIP_NAME="${APP_NAME}-v${VERSION}.zip"

echo "🚀 Iniciando deployment de ${APP_NAME} v${VERSION}"
echo ""

# Step 1: Limpiar builds anteriores
echo "📦 Paso 1: Limpiando builds anteriores..."
rm -rf dist/
rm -f *.zip
echo "✅ Build anterior eliminado"
echo ""

# Step 2: Instalar dependencias (si es necesario)
if [ ! -d "node_modules" ]; then
    echo "📦 Paso 2: Instalando dependencias..."
    npm install
    echo "✅ Dependencias instaladas"
    echo ""
else
    echo "✅ Paso 2: Dependencias ya instaladas"
    echo ""
fi

# Step 3: Ejecutar build
echo "🔨 Paso 3: Ejecutando build de producción..."
npm run build
echo "✅ Build completado"
echo ""

# Step 4: Verificar paths en index.html
echo "🔍 Paso 4: Verificando paths en index.html..."
if grep -q 'src="./assets/' dist/index.html && grep -q 'href="./assets/' dist/index.html; then
    echo "✅ Paths relativos correctos"
else
    echo "❌ ERROR: Paths no son relativos"
    echo "   Verifica que vite.config.js tenga base: './'"
    exit 1
fi
echo ""

# Step 5: Crear ZIP
echo "📦 Paso 5: Creando archivo ZIP..."
cd dist
if [ "$(uname)" == "Darwin" ] || [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Mac/Linux
    zip -r ../${ZIP_NAME} *
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ] || [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    # Windows Git Bash
    7z a -tzip ../${ZIP_NAME} *
else
    echo "❌ Sistema operativo no soportado para crear ZIP automáticamente"
    echo "   Por favor crea el ZIP manualmente desde la carpeta dist/"
    exit 1
fi
cd ..
echo "✅ ZIP creado: ${ZIP_NAME}"
echo ""

# Step 6: Verificar contenido del ZIP
echo "🔍 Paso 6: Verificando contenido del ZIP..."
if [ "$(uname)" == "Darwin" ] || [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    unzip -l ${ZIP_NAME} | head -20
else
    echo "   (Verificación manual requerida)"
fi
echo ""

# Step 7: Mostrar resumen
echo "✅ =========================================="
echo "✅ DEPLOYMENT BUILD COMPLETADO"
echo "✅ =========================================="
echo ""
echo "📦 Archivo: ${ZIP_NAME}"
echo "📊 Tamaño: $(du -h ${ZIP_NAME} | cut -f1)"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ve a Monday Developer Center"
echo "   2. Abre tu app 'Bulk Update Pro'"
echo "   3. Ve a Features → Board View → Builds"
echo "   4. Haz clic en 'New Build'"
echo "   5. Sube el archivo: ${ZIP_NAME}"
echo ""
echo "📖 Para más detalles, consulta DEPLOYMENT-GUIDE.md"
echo ""
