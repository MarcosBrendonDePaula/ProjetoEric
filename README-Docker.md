# Docker Setup - Planejador Financeiro

Este projeto oferece diferentes configurações Docker para diferentes cenários de desenvolvimento.

## 📁 Arquivos Docker

- `docker-compose.yml` - **Produção** (imagens otimizadas)
- `docker-compose.dev.yml` - **Desenvolvimento** (hot reload, volumes)
- `docker-compose.storage.yml` - **Apenas Storage** (MongoDB + Redis)

## 🚀 Scripts de Inicialização (.bat)

### Para Windows:

- **`start-prod.bat`** - Inicia ambiente de produção
- **`start-dev.bat`** - Inicia ambiente de desenvolvimento
- **`start-storage.bat`** - Inicia apenas MongoDB e Redis
- **`stop-all.bat`** - Para todos os containers
- **`logs.bat`** - Visualiza logs dos containers

### Para Linux/Mac:
```bash
# Produção
docker-compose up --build -d

# Desenvolvimento
docker-compose -f docker-compose.dev.yml up --build -d

# Apenas Storage
docker-compose -f docker-compose.storage.yml up -d

# Parar todos
docker-compose down
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.storage.yml down
```

## 🔧 Cenários de Uso

### 1. **Desenvolvimento Completo (Recomendado)**
```bash
# Use: start-dev.bat
docker-compose -f docker-compose.dev.yml up --build -d
```
- ✅ Hot reload no backend e frontend
- ✅ Volumes mapeados para código local
- ✅ Logs em tempo real
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend: http://localhost:3001

### 2. **Desenvolvimento Manual (Storage apenas)**
```bash
# Use: start-storage.bat
docker-compose -f docker-compose.storage.yml up -d
```
Depois execute manualmente:
```bash
# Backend
cd backend
bun install
bun run dev

# Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

### 3. **Produção**
```bash
# Use: start-prod.bat
docker-compose up --build -d
```
- ✅ Imagens otimizadas
- ✅ Nginx para servir frontend
- ✅ Sem volumes de desenvolvimento

## 🗃️ Dados Persistentes

Cada ambiente mantém seus próprios volumes:
- **Produção**: `mongodb_data`, `redis_data`
- **Desenvolvimento**: `mongodb_dev_data`, `redis_dev_data`
- **Storage**: `mongodb_storage_data`, `redis_storage_data`

## 🔐 Credenciais MongoDB

```
Host: localhost:27017
Username: admin
Password: senha123
Database: planejador-financeiro
```

## 🚨 Comandos Úteis

```bash
# Ver status dos containers
docker ps

# Ver logs específicos
docker logs planejador-backend-dev -f

# Reconstruir imagens
docker-compose build --no-cache

# Limpar volumes (⚠️ Remove todos os dados)
docker-compose down -v

# Entrar no container
docker exec -it planejador-backend-dev /bin/sh
```

## 🐛 Troubleshooting

### Porta já em uso:
```bash
# Verificar processos usando as portas
netstat -an | findstr :3001
netstat -an | findstr :5173
netstat -an | findstr :27017
```

### Reconstruir completamente:
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build -d
```

### Problemas de permissão (Linux/Mac):
```bash
sudo chown -R $USER:$USER .
```