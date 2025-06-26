# Planejador Financeiro MVP

Sistema completo de planejamento financeiro com backend e frontend separados.

## ✅ MVP Completo - 100% Implementado

### Funcionalidades Principais

- ✅ **Autenticação Segura**: Sistema completo com JWT + cookies httpOnly
- ✅ **Perfil do Usuário**: Cadastro de dados pessoais e financeiros
- ✅ **Metas Financeiras**: Criação e acompanhamento de objetivos
- ✅ **Dashboard Interativo**: Visualização de progresso com gráficos
- ✅ **Dados de Mercado**: Integração com Alpha Vantage e CoinGecko
- ✅ **Notificações por Email**: Sistema completo com templates HTML
- ✅ **Feedback Visual**: Sistema de toast notifications para UX
- ✅ **Portfólios de Investimento**: Sugestões conservadora, moderada e agressiva

### Tecnologias

**Backend:**
- Elysia (framework web moderno)
- MongoDB + Mongoose
- JWT para autenticação
- Nodemailer para emails
- Node-cron para tarefas agendadas
- APIs: Alpha Vantage, CoinGecko

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- shadcn/ui (componentes)
- Tailwind CSS
- React Query (gerenciamento de estado)
- Recharts (gráficos)

### Estrutura do Projeto

```
ProjetoEric/
├── backend/           # API com Elysia
│   ├── src/
│   │   ├── models/    # Modelos MongoDB
│   │   ├── routes/    # Rotas da API
│   │   ├── services/  # Serviços (email, market data)
│   │   └── middleware/ # Autenticação e validação
│   └── package.json
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/# Componentes UI
│   │   ├── pages/     # Páginas da aplicação
│   │   ├── hooks/     # Hooks customizados
│   │   └── lib/       # Utilitários
│   └── package.json
└── README.md
```

### Configuração

1. **Backend**: Configure `.env` com as variáveis necessárias
2. **Frontend**: Configure URL da API em `config`
3. **MongoDB**: Certifique-se que está rodando
4. **APIs**: Configure chaves Alpha Vantage e SMTP

### Como Executar

**Backend:**
```bash
cd backend
bun install
bun dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Recursos de Segurança

- Autenticação JWT com cookies httpOnly
- Rate limiting nas rotas
- Validação de dados com Zod
- Middleware de autenticação
- CORS configurado adequadamente

### Recursos Adicionais

- Sistema de notificações por email automatizado
- Atualizações de dados de mercado via cron jobs
- Interface responsiva e acessível
- Feedback visual em todas as ações do usuário
- Gerenciamento de estado otimizado com React Query

🎉 **MVP 100% COMPLETO** - Todas as funcionalidades do planejamento financeiro foram implementadas com sucesso!