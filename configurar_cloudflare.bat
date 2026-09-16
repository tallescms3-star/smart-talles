@echo off
setlocal
cd /d "%~dp0"

title Configurar Cloudflare - Sem dominio

echo ============================================================
echo   CLOUDFLARE - MODO SEM DOMINIO
 echo ============================================================
echo.
echo Voce NAO precisa comprar dominio para testar/acessar o sistema.
echo Este modo usa um Quick Tunnel e gera um endereco temporario:
echo https://alguma-coisa.trycloudflare.com
 echo.
echo O endereco muda quando o tunnel for encerrado e iniciado novamente.
echo Para iniciar o sistema pela internet, use:
echo   iniciar_sistema_internet.bat
 echo.
if not exist "C:\Cloudflared\bin" mkdir "C:\Cloudflared\bin"
if not exist "C:\Cloudflared\bin\cloudflared.exe" (
  echo Baixando a versao atual do Cloudflared...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'C:\Cloudflared\bin\cloudflared.exe'"
)
if exist "C:\Cloudflared\bin\cloudflared.exe" (
  echo.
  echo Cloudflared pronto.
  "C:\Cloudflared\bin\cloudflared.exe" --version
  echo.
  echo Agora execute iniciar_sistema_internet.bat para publicar o sistema.
) else (
  echo [ERRO] Nao foi possivel baixar o Cloudflared.
)
pause
