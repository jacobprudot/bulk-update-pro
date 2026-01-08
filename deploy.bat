@echo off
REM Script de deployment para Bulk Update Pro (Windows)
REM Uso: deploy.bat [version]

setlocal enabledelayedexpansion

set VERSION=%1
if "%VERSION%"=="" set VERSION=1.0.0

set APP_NAME=bulk-update-pro
set ZIP_NAME=%APP_NAME%-v%VERSION%.zip

echo ========================================
echo 🚀 Deployment de %APP_NAME% v%VERSION%
echo ========================================
echo.

REM Step 1: Limpiar builds anteriores
echo 📦 Paso 1: Limpiando builds anteriores...
if exist dist rmdir /s /q dist
if exist *.zip del /q *.zip
echo ✅ Build anterior eliminado
echo.

REM Step 2: Verificar node_modules
echo 📦 Paso 2: Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
    echo ✅ Dependencias instaladas
) else (
    echo ✅ Dependencias ya instaladas
)
echo.

REM Step 3: Build
echo 🔨 Paso 3: Ejecutando build de producción...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Build falló
    exit /b 1
)
echo ✅ Build completado
echo.

REM Step 4: Verificar paths
echo 🔍 Paso 4: Verificando paths en index.html...
findstr /C:"src=\"./assets/" dist\index.html >nul
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Paths no son relativos
    echo    Verifica que vite.config.js tenga base: './'
    exit /b 1
)
echo ✅ Paths relativos correctos
echo.

REM Step 5: Crear ZIP
echo 📦 Paso 5: Creando archivo ZIP...
cd dist
tar -a -c -f ..\%ZIP_NAME% *
cd ..
echo ✅ ZIP creado: %ZIP_NAME%
echo.

REM Step 6: Mostrar tamaño
echo 🔍 Paso 6: Información del archivo...
for %%A in (%ZIP_NAME%) do set SIZE=%%~zA
set /a SIZE_MB=!SIZE! / 1048576
echo    Tamaño: !SIZE_MB! MB
echo.

REM Step 7: Resumen
echo ========================================
echo ✅ DEPLOYMENT BUILD COMPLETADO
echo ========================================
echo.
echo 📦 Archivo: %ZIP_NAME%
echo.
echo 📋 Próximos pasos:
echo    1. Ve a Monday Developer Center
echo    2. Abre tu app 'Bulk Update Pro'
echo    3. Ve a Features → Board View → Builds
echo    4. Haz clic en 'New Build'
echo    5. Sube el archivo: %ZIP_NAME%
echo.
echo 📖 Para más detalles, consulta DEPLOYMENT-GUIDE.md
echo.

pause
