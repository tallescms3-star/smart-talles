@echo off
setlocal
cd /d "%~dp0"

title Teste de acesso pela Internet - Cloudflare Quick Tunnel

echo ============================================================
echo   TESTE CLOUDFLARE - SEM DOMINIO
 echo ============================================================
echo.
if not exist "C:\Cloudflared\bin\cloudflared.exe" (
  if not exist "C:\Cloudflared\bin" mkdir "C:\Cloudflared\bin"
  echo Baixando Cloudflared...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'C:\Cloudflared\bin\cloudflared.exe'"
)
if not exist "C:\Cloudflared\bin\cloudflared.exe" (
  echo [ERRO] Nao foi possivel obter o Cloudflared.
  pause
  exit /b 1
)

where py >nul 2>&1
if %errorlevel%==0 (set PY=py) else (set PY=python)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/health -TimeoutSec 5 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo O servidor local nao esta rodando.
  echo Execute primeiro iniciar_servidor.bat ou iniciar_sistema_internet.bat.
  pause
  exit /b 1
)

echo.
echo Sua URL publica sera exibida abaixo.
echo Copie a linha que comeca com https:// e abra no celular usando 4G/5G.
echo.
"C:\Cloudflared\bin\cloudflared.exe" tunnel --url http://localhost:8080
pause
