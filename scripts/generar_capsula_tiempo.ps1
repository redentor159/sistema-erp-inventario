<#
.SYNOPSIS
Generador automático de la Cápsula del Tiempo ERP (Paquete de Supervivencia)
#>

$BasePath = $PSScriptRoot + "\.."
$CapsulaPath = "$BasePath\_ARCHIVO_MAESTRO_ERP"
$EmergenciaPath = "$BasePath\_EMERGENCIA_SUPABASE"

Write-Host "Iniciando creacion de Capsula del Tiempo..." -ForegroundColor Cyan

# 1. Crear directorios base
New-Item -ItemType Directory -Force -Path "$CapsulaPath\codigo_fuente" | Out-Null
New-Item -ItemType Directory -Force -Path "$CapsulaPath\build_out" | Out-Null
New-Item -ItemType Directory -Force -Path "$CapsulaPath\secretos" | Out-Null
New-Item -ItemType Directory -Force -Path "$CapsulaPath\base_datos" | Out-Null
New-Item -ItemType Directory -Force -Path "$CapsulaPath\instaladores" | Out-Null
New-Item -ItemType Directory -Force -Path "$CapsulaPath\documentacion" | Out-Null
New-Item -ItemType Directory -Force -Path "$EmergenciaPath\docker" | Out-Null
New-Item -ItemType Directory -Force -Path "$EmergenciaPath\instaladores" | Out-Null

Write-Host "Estructura de carpetas creada." -ForegroundColor Green

# 2. Copiar Codigo Fuente (Excluyendo node_modules y .git)
Write-Host "Copiando codigo fuente (esto tomara unos segundos)..." -ForegroundColor Yellow
$ExcludeList = @("node_modules", ".git", ".next", "_ARCHIVO_MAESTRO_ERP", "_EMERGENCIA_SUPABASE", ".vercel", "out")
Get-ChildItem -Path $BasePath -Exclude $ExcludeList | Copy-Item -Destination "$CapsulaPath\codigo_fuente" -Recurse -Force

# 3. Copiar Compilado (Build /out si existe)
if (Test-Path "$BasePath\out") {
    Write-Host "Copiando carpeta /out estatica..."
    Copy-Item -Path "$BasePath\out\*" -Destination "$CapsulaPath\build_out" -Recurse -Force
}
else {
    Write-Host "[!] No se encontro la carpeta /out. Recuerda correr 'npm run build' antes de generar la capsula." -ForegroundColor Red
}

# 4. Copiar Secretos
if (Test-Path "$BasePath\.env.local") {
    Write-Host "Copiando variables de entorno .env.local..."
    Copy-Item -Path "$BasePath\.env.local" -Destination "$CapsulaPath\secretos\.env.local" -Force
    Copy-Item -Path "$BasePath\.env.local" -Destination "$EmergenciaPath\.env.local" -Force
}
else {
    Write-Host "[!] Archivo .env.local no encontrado." -ForegroundColor Red
}

# 5. Generar Dump de Base de Datos Local (Requiere pg_dump instalado y variable SUPABASE_DB_URL)
$envFilePath = "$BasePath\.env.local"
if (Test-Path $envFilePath) {
    # Extraer URI de BD del .env (Asumiendo nombre DATABASE_URL o parecido)
    $DBUrl = (Select-String -Path $envFilePath -Pattern "NEXT_PUBLIC_SUPABASE_URL" | Out-String)
    if ($DBUrl) {
        Write-Host "Se encontro cadena de conexion a Supabase." -ForegroundColor Cyan
    }
    Write-Host "[IMPORTANTE] Se reuqiere pg_dump para extraer la base de datos real." -ForegroundColor Magenta
    Write-Host "[IMPORTANTE] El Workflow de Github (.github/workflows) lo hara diario gratis!" -ForegroundColor Magenta
}

Write-Host " "
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Cápsula del Tiempo generada exitosamente en:" -ForegroundColor White
Write-Host "$CapsulaPath" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Green
Write-Host " "
Write-Host "SIGUIENTES PASOS MANUALES:" -ForegroundColor Yellow
Write-Host "1. Descarga e inserta el instalador offline de Node.js v20 en $CapsulaPath\instaladores"
Write-Host "2. Descarga e inserta Docker Desktop en $EmergenciaPath\instaladores"
Write-Host "3. Guarda los archivos resultantes en un USB de contingencia"
Write-Host " "

Start-Sleep -Seconds 3
