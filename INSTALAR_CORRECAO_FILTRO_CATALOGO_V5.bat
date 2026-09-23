@echo off
setlocal
title Smart Talles - Correcao Filtro Catalogo V5

echo.
echo ============================================
echo   SMART TALLES - CORRECAO CATALOGO V5
echo ============================================
echo.

set "ROOT=%~dp0"
set "WWW=%ROOT%www"
set "OLD=%WWW%\catalog-filter-v4.js"

if not exist "%OLD%" (
  echo ERRO: nao encontrei www\catalog-filter-v4.js
  echo.
  echo Isso indica que a V4 nao esta instalada nesta pasta.
  echo Nenhuma alteracao foi feita.
  echo.
  pause
  exit /b 1
)

for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set D=%%a
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set T=%%a
set "STAMP=%D%_%T%"
set "STAMP=%STAMP:/=-%"
set "STAMP=%STAMP::=-%"
set "BACKUP=%WWW%\catalog-filter-v4.js.backup_v5_%STAMP%"

copy /Y "%OLD%" "%BACKUP%" >nul
if errorlevel 1 (
  echo ERRO: nao foi possivel criar o backup.
  pause
  exit /b 1
)

copy /Y "%~dp0catalog-filter-v5.js" "%OLD%" >nul
if errorlevel 1 (
  echo ERRO ao substituir o filtro. O original foi preservado no backup.
  pause
  exit /b 1
)

echo.
echo OK: filtro do catalogo corrigido para V5.
echo.
echo Substituido: www\catalog-filter-v4.js
echo Backup: %BACKUP%
echo.
echo NAO alterou app.js, style.css, index.html nem vendas.db.
echo.
echo Agora inicie o servidor e pressione Ctrl+Shift+R.
echo.
pause
endlocal
