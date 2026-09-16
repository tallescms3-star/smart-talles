@echo off
cd /d "%~dp0"
if not exist backups mkdir backups
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set D=%%c-%%b-%%a
for /f "tokens=1-2 delims=:" %%a in ("%time%") do set T=%%a-%%b
copy /Y vendas.db backups\vendas-%D%_%T%.db >nul
if %errorlevel%==0 echo Backup criado em backups\
if not %errorlevel%==0 echo O banco ainda nao existe. Execute o servidor primeiro.
pause
