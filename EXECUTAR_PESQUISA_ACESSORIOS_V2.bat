@echo off
chcp 65001 >nul
cd /d "%~dp0"
python corrigir_pesquisa_acessorios_v2.py
if errorlevel 1 (
  echo.
  echo A correção não foi aplicada. Leia a mensagem acima.
)
echo.
pause
