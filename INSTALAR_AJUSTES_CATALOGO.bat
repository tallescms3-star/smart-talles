@echo off
setlocal
cd /d "%~dp0.."
python "%~dp0corrigir_catalogo_ajustes.py"
if errorlevel 1 (
  echo.
  echo ERRO: a instalacao nao foi concluida.
) else (
  echo.
  echo ================================================
  echo OK: ajustes do catalogo instalados.
  echo Acessorios sera a categoria padrao.
  echo As imagens dos acessorios ficarao maiores.
  echo ================================================
)
echo.
pause
