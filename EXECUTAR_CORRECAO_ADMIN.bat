@echo off
title Correcao Admin - Smart Talles
cd /d "%~dp0"
python corrigir_admin_contatar_cliente.py
echo.
echo CORRECAO DO ADMIN CONCLUIDA.
echo Abra o GitHub Desktop e confira www\admin.js.
pause
