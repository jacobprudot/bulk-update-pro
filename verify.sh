#!/bin/bash

echo "🔍 VERIFICACIÓN RÁPIDA - Bulk Update Pro"
echo "========================================"
echo ""

# Check 1: ZIP existe
if [ -f "bulk-update-pro-v1.0.0.zip" ]; then
    SIZE=$(du -h bulk-update-pro-v1.0.0.zip | cut -f1)
    echo "✅ ZIP existe: $SIZE"
else
    echo "❌ ZIP no encontrado"
    exit 1
fi

# Check 2: Build existe
if [ -f "dist/index.html" ]; then
    echo "✅ Build existe"
else
    echo "❌ dist/index.html no encontrado"
    exit 1
fi

# Check 3: Paths relativos
if grep -q 'src="./assets/' dist/index.html; then
    echo "✅ Paths relativos correctos"
else
    echo "❌ Paths no son relativos"
    exit 1
fi

# Check 4: Monday SDK
if grep -q "monday-sdk-js" src/hooks/useMonday.js; then
    echo "✅ Monday SDK importado"
else
    echo "❌ Monday SDK no encontrado"
    exit 1
fi

# Check 5: Assets
ASSET_COUNT=$(ls -1 dist/assets/*.js 2>/dev/null | wc -l)
if [ "$ASSET_COUNT" -ge 2 ]; then
    echo "✅ Assets compilados ($ASSET_COUNT archivos JS)"
else
    echo "❌ Faltan assets"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ TODAS LAS VERIFICACIONES PASARON"
echo "🚀 Listo para deployment!"
echo "========================================"
