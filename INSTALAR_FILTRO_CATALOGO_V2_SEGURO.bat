@echo off
setlocal EnableExtensions
cd /d "%~dp0"
echo.
echo === Smart Talles - Filtro do catalogo V2 ===
echo.
set "ROOT=%~dp0"
set "INDEX=%ROOT%www\index.html"
if not exist "%INDEX%" (
  echo ERRO: nao encontrei www\index.html nesta pasta.
  echo Execute este .bat dentro de C:\Users\Home\Documents\GitHub\smart-talles
  pause
  exit /b 1
)
set "SRC=%ROOT%catalog-filter-v2.js"
if not exist "%SRC%" (
  echo ERRO: catalog-filter-v2.js nao encontrado.
  pause
  exit /b 1
)
for /f "tokens=1-6 delims=/:. " %%a in ("%date% %time%") do set "STAMP=%%f%%e%%d_%%b%%c%%a"
set "BACKUP=%ROOT%www\index.html.backup_catalogo_v2_%RANDOM%"
copy /y "%INDEX%" "%BACKUP%" >nul
if errorlevel 1 (
  echo ERRO ao criar backup.
  pause
  exit /b 1
)
copy /y "%SRC%" "%ROOT%www\catalog-filter-v2.js" >nul
if errorlevel 1 (
  copy /y "%BACKUP%" "%INDEX%" >nul
  echo ERRO ao copiar o filtro. O index foi restaurado.
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%INDEX%'; $s=Get-Content -Raw -Encoding UTF8 $p; $s=[regex]::Replace($s,'\s*<script[^>]*src=[\"'']catalog-filter(?:\.js|-v2\.js)[\"''][^>]*></script>',''); if($s -notmatch 'SMART-TALLES-CATALOG-FILTER-SAFE-V2'){ $tag='<script src=\"catalog-filter-v2.js\"></script><!-- SMART-TALLES-CATALOG-FILTER-SAFE-V2 -->'; $s=[regex]::Replace($s,'(<script\s+src=[\"'']app\.js[\"''][^>]*></script>)','$1'+[Environment]::NewLine+'    '+$tag,1,[Text.RegularExpressions.RegexOptions]::IgnoreCase) }; Set-Content -Path $p -Value $s -Encoding UTF8"
if errorlevel 1 (
  copy /y "%BACKUP%" "%INDEX%" >nul
  echo ERRO ao alterar index.html. O index foi restaurado.
  pause
  exit /b 1
)
echo.
echo OK: Filtro do catalogo V2 instalado.
echo Alterado: www\index.html
 echo Criado: www\catalog-filter-v2.js
 echo Backup: %BACKUP%
echo.
echo Pressione Enter para sair...
pause >nul
