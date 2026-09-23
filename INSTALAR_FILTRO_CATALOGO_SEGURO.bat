@echo off
setlocal
cd /d "%~dp0"
echo.
echo ==========================================
echo Smart Talles - Filtro do Catalogo
echo ==========================================
echo.

if not exist "www\index.html" (
  echo ERRO: www\index.html nao encontrado.
  pause
  exit /b 1
)

if not exist "www\accessory-search.js" (
  echo ERRO: o accessory-search.js da pesquisa segura nao foi encontrado.
  echo Instale primeiro a Pesquisa de Acessorios Segura.
  pause
  exit /b 1
)

if exist "www\catalog-filter.js" (
  echo O filtro de catalogo ja existe. Nenhuma alteracao feita.
  pause
  exit /b 0
)

copy /Y "www\index.html" "www\index.html.backup_catalogo_%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%.html" >nul

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$p='www\index.html'; $s=Get-Content -Raw -LiteralPath $p; if($s -notmatch 'SMART-TALLES-CATALOG-FILTER-SAFE-V1'){ $s=$s -replace '</body>','<script src=""catalog-filter.js""></script><!-- SMART-TALLES-CATALOG-FILTER-SAFE-V1 --></body>'; Set-Content -LiteralPath $p -Value $s -Encoding UTF8 }"

if errorlevel 1 (
  echo ERRO ao alterar o index.html.
  pause
  exit /b 1
)

copy /Y "catalog-filter.js" "www\catalog-filter.js" >nul
if errorlevel 1 (
  echo ERRO ao copiar catalog-filter.js.
  pause
  exit /b 1
)

echo.
echo OK: Filtro de catalogo instalado com seguranca.
echo Alterado: www/index.html
echo Criado: www/catalog-filter.js
echo Backup: index.html.backup_catalogo_...
echo.
echo Pressione Enter para sair...
pause >nul
endlocal
