@echo off
echo ========================================
echo  Visualizar Logs dos Containers
echo ========================================
echo.
echo Escolha qual ambiente deseja visualizar os logs:
echo.
echo 1. Producao
echo 2. Desenvolvimento  
echo 3. Storage apenas
echo.
set /p choice="Digite sua opcao (1-3): "

if "%choice%"=="1" (
    echo.
    echo Mostrando logs de PRODUCAO...
    docker-compose logs -f
) else if "%choice%"=="2" (
    echo.
    echo Mostrando logs de DESENVOLVIMENTO...
    docker-compose -f docker-compose.dev.yml logs -f
) else if "%choice%"=="3" (
    echo.
    echo Mostrando logs de STORAGE...
    docker-compose -f docker-compose.storage.yml logs -f
) else (
    echo.
    echo Opcao invalida!
    pause
)