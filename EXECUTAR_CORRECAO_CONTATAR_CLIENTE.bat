@echo off
title Correcao - Contatar cliente - Smart Talles
cd /d "%~dp0"
python corrigir_contatar_cliente.py
if errorlevel 1 (
  echo.
  echo A correcao nao foi aplicada.
  pause
  exit /b 1
)
echo.
echo Correcao concluida com sucesso.
echo.
echo Agora abra o GitHub Desktop para conferir a alteracao.
pause
