# 🐳 Docker Setup - Planejador Financeiro

## Executar com Docker Compose

### Desenvolvimento

```bash
# Clonar e configurar
git clone <repo>
cd ProjetoEric

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Produção

```bash
# Build e deploy completo
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Ou individual
docker-compose up -d mongodb redis
docker-compose up -d backend
docker-compose up -d frontend nginx
```

## Serviços Disponíveis

| Serviço | Porta | URL | Descrição |
|---------|-------|-----|-----------|
| Frontend | 5173 | http://localhost:5173 | React App |
| Backend | 3001 | http://localhost:3001 | API Elysia |
| MongoDB | 27017 | mongodb://localhost:27017 | Database |
| Redis | 6379 | redis://localhost:6379 | Cache |
| Nginx | 80 | http://localhost | Proxy/Load Balancer |

## Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Rebuild específico
docker-compose build backend
docker-compose up -d backend

# Logs de um serviço
docker-compose logs -f backend

# Entrar no container
docker-compose exec backend bash
docker-compose exec mongodb mongo

# Limpar volumes (CUIDADO: apaga dados)
docker-compose down -v

# Backup do MongoDB
docker-compose exec mongodb mongodump --out /backup

# Restore do MongoDB
docker-compose exec mongodb mongorestore /backup
```

## Desenvolvimento Local

### Hot Reload Ativo
- Frontend: Vite hot reload funciona automaticamente
- Backend: Bun hot reload com `--hot` flag
- MongoDB: Dados persistem em volume

### Debug
```bash
# Backend logs detalhados
docker-compose logs -f backend

# MongoDB shell
docker-compose exec mongodb mongo planejador-financeiro

# Redis CLI
docker-compose exec redis redis-cli
```

## Configuração de Produção

### Variáveis de Ambiente Necessárias
```bash
# APIs
ALPHA_VANTAGE_API_KEY=your-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Segurança
JWT_SECRET=super-secret-key-min-32-chars
```

### SSL/HTTPS
1. Adicione certificados em `nginx/ssl/`
2. Configure `nginx/nginx.conf` para HTTPS
3. Suba com `docker-compose up -d nginx`

### Monitoramento
- Health checks configurados
- Logs centralizados
- Restart automático em falha

## Troubleshooting

### Backend não conecta no MongoDB
```bash
# Verificar se MongoDB está rodando
docker-compose ps mongodb

# Verificar logs do MongoDB
docker-compose logs mongodb

# Testar conexão
docker-compose exec backend curl http://localhost:3001/health
```

### Frontend não carrega
```bash
# Verificar build
docker-compose logs frontend

# Rebuild se necessário
docker-compose build frontend
docker-compose up -d frontend
```

### Portas em uso
```bash
# Verificar portas ocupadas
netstat -tulpn | grep :3001
netstat -tulpn | grep :5173

# Mudar portas no docker-compose.yml se necessário
```

## Performance

### Otimizações de Produção
- Nginx gzip habilitado
- Cache de assets estáticos
- Multi-stage build nos Dockerfiles
- Health checks configurados
- Volumes nomeados para persistência

### Monitoramento
```bash
# Stats dos containers
docker stats

# Uso de rede
docker-compose exec backend netstat -i

# Logs de performance
docker-compose logs --tail=100 nginx
```