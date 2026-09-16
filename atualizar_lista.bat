@echo off
cd /d "%~dp0"
echo =============================================
echo ATUALIZAR LISTA DE PRODUTOS
 echo =============================================
echo.
echo IMPORTANTE: feche a janela do servidor antes de continuar.
echo.
if exist vendas.db (
  if not exist backups mkdir backups
  set "STAMP=%date:/=-%_%time::=-%"
  set "STAMP=%STAMP: =0%"
  copy /Y vendas.db "backups\vendas-antes-da-atualizacao-%STAMP%.db" >nul
  if errorlevel 1 (
    echo Nao foi possivel criar o backup. Atualizacao cancelada.
    pause
    exit /b 1
  )
  echo Backup do banco antigo criado na pasta backups.
  del /Q vendas.db
  if exist vendas.db (
    echo Nao foi possivel remover o banco antigo. Atualizacao cancelada.
    pause
    exit /b 1
  )
) else (
  echo Banco antigo nao encontrado. A nova lista sera criada automaticamente.
)
echo.
echo Lista antiga removida. A nova lista sera carregada ao iniciar o servidor.
echo PIN de administrador permanece configurado no config.json.
echo.
pause
