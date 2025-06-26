// Inicialização do MongoDB
// Este script é executado quando o container MongoDB é criado

db = db.getSiblingDB('planejador-financeiro');

// Criar usuário da aplicação
db.createUser({
  user: 'planejador',
  pwd: 'senha123',
  roles: [
    {
      role: 'readWrite',
      db: 'planejador-financeiro'
    }
  ]
});

// Criar índices para melhor performance
db.users.createIndex({ email: 1 }, { unique: true });
db.profiles.createIndex({ userId: 1 }, { unique: true });
db.goals.createIndex({ userId: 1 });
db.goals.createIndex({ createdAt: -1 });
db.notificationsettings.createIndex({ userId: 1 }, { unique: true });
db.marketdata.createIndex({ symbol: 1, type: 1 });
db.marketdata.createIndex({ lastUpdated: -1 });

// Inserir dados iniciais de exemplo (opcional)
db.marketdata.insertMany([
  {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    type: 'crypto',
    price: 45000,
    change: 1200,
    changePercent: 2.74,
    volume: 25000000000,
    currency: 'USD',
    lastUpdated: new Date()
  },
  {
    symbol: 'ETH-USD',
    name: 'Ethereum',
    type: 'crypto',
    price: 2800,
    change: 85,
    changePercent: 3.13,
    volume: 15000000000,
    currency: 'USD',
    lastUpdated: new Date()
  }
]);

print('MongoDB inicializado com sucesso!');
print('Usuário planejador criado');
print('Índices criados');
print('Dados de exemplo inseridos');