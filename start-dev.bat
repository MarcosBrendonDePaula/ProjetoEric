@echo off
echo ========================================
echo  Iniciando Planejador Financeiro - DEV
echo ========================================
echo.
echo Construindo e iniciando containers em modo desenvolvimento...
docker-compose -f docker-compose.dev.yml up --build -d
echo.
echo ========================================
echo  Servicos iniciados em modo DEV!
echo ========================================
echo  Frontend: http://localhost:5173 (Hot Reload)
echo  Backend:  http://localhost:3001 (Hot Reload)
echo  MongoDB:  localhost:27017
echo  Redis:    localhost:6379
echo ========================================
echo.
echo Para parar os servicos, execute: docker-compose -f docker-compose.dev.yml down
echo Para ver logs: docker-compose -f docker-compose.dev.yml logs -f
echo.
pause