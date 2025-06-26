@echo off
echo ========================================
echo  Iniciando apenas Storage (MongoDB + Redis)
echo ========================================
echo.
echo Iniciando containers de armazenamento...
docker-compose -f docker-compose.storage.yml up -d
echo.
echo ========================================
echo  Storage iniciado!
echo ========================================
echo  MongoDB: localhost:27017
echo    - Usuario: admin
echo    - Senha: senha123
echo    - Database: planejador-financeiro
echo  Redis: localhost:6379
echo ========================================
echo.
echo Agora voce pode iniciar o backend e frontend manualmente:
echo.
echo BACKEND (pasta backend/):
echo   bun install
echo   bun run dev
echo.
echo FRONTEND (pasta frontend/):
echo   npm install
echo   npm run dev
echo.
echo Para parar o storage: docker-compose -f docker-compose.storage.yml down
echo.
pause