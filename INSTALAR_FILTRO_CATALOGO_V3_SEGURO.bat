@echo off
setlocal
title Smart Talles - Filtro de Catalogo V3

echo.
echo ============================================
echo   SMART TALLES - FILTRO CATALOGO V3
echo ============================================
echo.

set "ROOT=%~dp0"
set "WWW=%ROOT%www"

if not exist "%WWW%\index.html" (
  echo ERRO: nao encontrei www\index.html
  echo.
  pause
  exit /b 1
)

if not exist "%WWW%\app.js" (
  echo ERRO: nao encontrei www\app.js
  echo.
  pause
  exit /b 1
)

if exist "%WWW%\catalog-search-v3.js" (
  echo O filtro V3 ja esta instalado.
  echo Nenhuma alteracao foi feita.
  echo.
  pause
  exit /b 0
)

for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set D=%%a
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set T=%%a
set "STAMP=%D%_%T%"
set "STAMP=%STAMP:/=-%"
set "STAMP=%STAMP::=-%"
set "BACKUP=%WWW%\index.html.backup_catalogo_v3_%STAMP%"

copy /Y "%WWW%\index.html" "%BACKUP%" >nul
if errorlevel 1 (
  echo ERRO: nao foi possivel criar o backup.
  pause
  exit /b 1
)

copy /Y "%~dp0catalog-search-v3.js" "%WWW%\catalog-search-v3.js" >nul
if errorlevel 1 (
  echo ERRO: nao foi possivel copiar o arquivo JS.
  copy /Y "%BACKUP%" "%WWW%\index.html" >nul
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$p='%WWW%\index.html'; $s=Get-Content -Raw -Encoding UTF8 $p; if($s -notmatch 'catalog-search-v3\.js'){ $s=$s -replace '(<script\s+src=[\"'']app\.js[\"'']\s*></script>)','$1`r`n  <script src=\"catalog-search-v3.js\"></script> <!-- SMART-TALLES-CATALOG-SEARCH-V3 -->'; Set-Content -Encoding UTF8 $p $s }"

if errorlevel 1 (
  echo ERRO ao atualizar index.html. Restaurando...
  copy /Y "%BACKUP%" "%WWW%\index.html" >nul
  del /Q "%WWW%\catalog-search-v3.js" >nul 2>&1
  pause
  exit /b 1
)

echo.
echo OK: Filtro do catalogo V3 instalado.
echo.
echo Alterado somente: www\index.html
echo Criado: www\catalog-search-v3.js
echo Backup: %BACKUP%
echo.
echo IMPORTANTE: nao alterou app.js, style.css nem vendas.db.
echo.
echo Pressione Enter para sair...
pause >nul
endlocal
