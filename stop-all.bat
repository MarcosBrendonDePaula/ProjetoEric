@echo off
echo ========================================
echo  Parando todos os containers
echo ========================================
echo.
echo Parando containers de producao...
docker-compose down 2>nul
echo.
echo Parando containers de desenvolvimento...
docker-compose -f docker-compose.dev.yml down 2>nul
echo.
echo Parando containers de storage...
docker-compose -f docker-compose.storage.yml down 2>nul
echo.
echo ========================================
echo  Todos os containers foram parados!
echo ========================================
echo.
pause