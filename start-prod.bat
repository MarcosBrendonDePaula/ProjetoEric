@echo off
echo ========================================
echo  Iniciando Planejador Financeiro - PROD
echo ========================================
echo.
echo Construindo e iniciando containers...
docker-compose up --build -d
echo.
echo ========================================
echo  Servicos iniciados!
echo ========================================
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:3001
echo  MongoDB:  localhost:27017
echo  Redis:    localhost:6379
echo ========================================
echo.
echo Para parar os servicos, execute: docker-compose down
echo Para ver logs: docker-compose logs -f
echo.
pause