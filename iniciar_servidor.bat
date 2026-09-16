@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (set PY=py) else (set PY=python)
%PY% server.py
pause
