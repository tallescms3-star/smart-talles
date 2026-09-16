@echo off
cd /d "%~dp0"
echo =============================================
echo INSTALACAO - SISTEMA DE VENDAS / SERVIDOR
 echo =============================================
where py >nul 2>&1
if %errorlevel% neq 0 (
  echo Python nao foi encontrado.
  echo Instale Python 3 pelo site oficial e marque "Add Python to PATH".
  pause
  exit /b 1
)
echo Python encontrado.
py -m pip --version >nul 2>&1
if %errorlevel% neq 0 echo Aviso: pip nao esta disponivel. O sistema usa apenas bibliotecas nativas.
echo.
echo O banco sera criado automaticamente na primeira execucao.
echo Depois execute iniciar_servidor.bat
pause
