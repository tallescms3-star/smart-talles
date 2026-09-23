@echo off
cd /d "%~dp0"
python corrigir_whatsapp.py
if errorlevel 1 (
  echo.
  echo ERRO: a correcao nao foi aplicada.
  pause
  exit /b 1
)
echo.
echo Correcao concluida. Voce pode fechar esta janela.
pause
