@echo off
setlocal
title Smart Talles - Filtro Catalogo V4

echo.
echo ============================================
echo   SMART TALLES - FILTRO CATALOGO V4
echo ============================================
echo.

set "ROOT=%~dp0"
set "WWW=%ROOT%www"
set "TARGET=%WWW%\accessory-search.js"

if not exist "%TARGET%" (
  echo ERRO: nao encontrei:
  echo %TARGET%
  echo.
  echo Isso significa que a Pesquisa de Acessorios Segura nao esta instalada nesta pasta.
  echo NAO foi feita nenhuma alteracao.
  echo.
  pause
  exit /b 1
)

if exist "%WWW%\catalog-filter-v4.js" (
  echo O filtro V4 ja existe.
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
set "BACKUP=%TARGET%.backup_catalogo_v4_%STAMP%"

copy /Y "%TARGET%" "%BACKUP%" >nul
if errorlevel 1 (
  echo ERRO: nao foi possivel criar o backup.
  pause
  exit /b 1
)

copy /Y "%~dp0catalog-filter-v4.js" "%WWW%\catalog-filter-v4.js" >nul
if errorlevel 1 (
  echo ERRO ao copiar o filtro.
  pause
  exit /b 1
)

findstr /C:"SMART-TALLES-CATALOG-FILTER-V4-LOADER" "%TARGET%" >nul 2>&1
if not errorlevel 1 (
  echo O carregador V4 ja estava presente.
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p='%TARGET%'; $loader=Get-Content -Raw -Encoding UTF8 '%~dp0catalog-filter-v4-loader.txt'; Add-Content -Encoding UTF8 -Path $p -Value $loader"
  if errorlevel 1 (
    echo ERRO ao atualizar accessory-search.js. Restaurando...
    copy /Y "%BACKUP%" "%TARGET%" >nul
    del /Q "%WWW%\catalog-filter-v4.js" >nul 2>&1
    pause
    exit /b 1
  )
)

echo.
echo OK: Filtro do catalogo V4 instalado.
echo.
echo Alterado somente: www\accessory-search.js
echo Criado: www\catalog-filter-v4.js
echo Backup: %BACKUP%
echo.
echo NAO alterou app.js, style.css, index.html nem vendas.db.
echo.
echo Pressione Enter para sair...
pause >nul
endlocal
