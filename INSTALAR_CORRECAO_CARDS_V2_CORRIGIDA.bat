@echo off
setlocal
title SMART TALLES - CORRECAO DOS CARDS V2 CORRIGIDA
echo =====================================================
echo   SMART TALLES - CORRECAO DOS CARDS V2
echo =====================================================
echo.
set "ROOT=%~dp0"
cd /d "%ROOT%"
if not exist "www" (
  echo ERRO: nao encontrei a pasta www.
  pause
  exit /b 1
)
if not exist "www\accessory-search.js" (
  echo ERRO: nao encontrei www\accessory-search.js
  pause
  exit /b 1
)
copy /Y "cards-acessorios-v2.js" "www\cards-acessorios-v2.js" >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='www\accessory-search.js'; $s=[IO.File]::ReadAllText($p); if($s -notmatch 'cards-acessorios-v2\.js'){ Add-Content -Path $p -Value \"`r`n`r`n/* SMART-TALLES-CARDS-V2 */`r`n(function(){var s=document.createElement('script');s.src='cards-acessorios-v2.js';document.head.appendChild(s);})();`r`n\" }"
if errorlevel 1 (
  echo ERRO ao instalar a correcao.
  pause
  exit /b 1
)
echo.
echo OK: correcao visual dos cards instalada.
echo.
echo Inicie o servidor e teste com Ctrl+Shift+R.
pause
