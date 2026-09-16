@echo off
setlocal
cd /d "%~dp0"
choice /C LI /N /M "[L] Acesso local  [I] Acesso pela internet: "
if errorlevel 2 goto INTERNET
:LOCAL
call iniciar_servidor.bat
exit /b
:INTERNET
call iniciar_sistema_internet.bat
exit /b
