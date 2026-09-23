@echo off
title Correcao completa - Smart Talles
cd /d "%~dp0"
python corrigir_alteracoes_completas.py
if errorlevel 1 (
 echo.
 echo A correcao NAO foi aplicada.
 pause
 exit /b 1
)
echo.
echo CORRECAO COMPLETA APLICADA COM SUCESSO
echo.
echo Arquivos alterados:
echo www\app.js
echo www\index.html
echo www\admin.js
echo.
echo Abra o GitHub Desktop e deixe marcados SOMENTE esses 3 arquivos.
pause
