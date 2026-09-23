@echo off
setlocal
cd /d "%~dp0.."
set "WWW=%CD%\www"
set "OLD=%WWW%\catalogo-ajustes.js"
set "NEW=%~dp0catalogo-ajustes-v2.js"

echo.
echo ================================================
echo   SMART TALLES - CORRECAO DOS CARDS V2
echo ================================================
echo.

if not exist "%OLD%" (
  echo ERRO: nao encontrei www\catalogo-ajustes.js
  echo.
  echo Nenhuma alteracao foi feita.
  pause
  exit /b 1
)

for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set D=%%a
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set T=%%a
set "STAMP=%D%_%T%"
set "STAMP=%STAMP:/=-%"
set "STAMP=%STAMP::=-%"
set "BACKUP=%WWW%\catalogo-ajustes.js.backup_cards_v2_%STAMP%"

copy /Y "%OLD%" "%BACKUP%" >nul
if errorlevel 1 (
  echo ERRO: nao foi possivel criar o backup.
  pause
  exit /b 1
)

copy /Y "%NEW%" "%OLD%" >nul
if errorlevel 1 (
  echo ERRO ao instalar a correcao.
  echo O arquivo original foi preservado no backup.
  pause
  exit /b 1
)

echo.
echo OK: cards de acessorios corrigidos.
echo.
echo Mantido: Acessorios como categoria padrao.
echo Ajustado: imagem, texto, preco e botao + sem sobreposicao.
echo.
echo Backup: %BACKUP%
echo.
echo Nao alterou app.js, style.css nem vendas.db.
echo.
echo Agora inicie o servidor e use Ctrl+Shift+R.
echo.
pause
endlocal
