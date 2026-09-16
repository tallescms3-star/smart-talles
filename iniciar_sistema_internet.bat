@echo off
setlocal
cd /d "%~dp0"

title Sistema de Vendas - Servidor + Cloudflare

echo ============================================================
echo   SISTEMA DE VENDAS - ACESSO PELA INTERNET
echo ============================================================
echo.

aif exist "C:\Cloudflared\bin\cloudflared.exe" goto CLOUDFLARED_OK

if not exist "C:\Cloudflared\bin" mkdir "C:\Cloudflared\bin"
echo Cloudflared nao encontrado. Baixando a versao atual...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'C:\Cloudflared\bin\cloudflared.exe'"
if not exist "C:\Cloudflared\bin\cloudflared.exe" (
  echo.
  echo [ERRO] Nao foi possivel baixar o Cloudflared.
  echo Verifique sua internet e execute este arquivo novamente.
  pause
  exit /b 1
)

:CLOUDFLARED_OK
where py >nul 2>&1
if %errorlevel%==0 (set PY=py) else (set PY=python)

if not exist "vendas.db" echo Banco de dados sera criado automaticamente na primeira inicializacao.

echo Iniciando o servidor local em http://localhost:8080 ...
start "Sistema de Vendas - Servidor" /min cmd /c "%PY% server.py"
timeout /t 3 /nobreak >nul

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/health -TimeoutSec 5 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo.
  echo [ERRO] O servidor nao respondeu em http://localhost:8080.
  echo Verifique se o Python esta instalado e se server.py iniciou corretamente.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   ABRINDO ENDERECO PUBLICO TEMPORARIO
 echo ============================================================
echo.
echo Aguarde. O Cloudflare mostrara uma URL parecida com:
echo https://alguma-coisa.trycloudflare.com
 echo.
echo IMPORTANTE:
echo - NAO feche esta janela enquanto quiser acesso pela internet.
echo - O endereco trycloudflare.com muda quando o tunnel e reiniciado.
echo - O computador precisa permanecer ligado.
echo - Para uso permanente com endereco fixo, sera necessario um dominio.
echo.
"C:\Cloudflared\bin\cloudflared.exe" tunnel --url http://localhost:8080

echo.
echo O Cloudflare Tunnel foi encerrado.
echo O servidor local pode continuar em execucao.
pause
