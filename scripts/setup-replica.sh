#!/bin/bash

echo "Aguardando MongoDB inicializar..."
sleep 10

echo "Configurando Replica Set..."

# Conectar ao primary e inicializar replica set
mongo --host mongodb-primary:27017 -u admin -p senha123 --authenticationDatabase admin --eval "
try {
  rs.initiate({
    _id: 'rs0',
    members: [
      {
        _id: 0,
        host: 'mongodb-primary:27017',
        priority: 2
      },
      {
        _id: 1,
        host: 'mongodb-secondary1:27017',
        priority: 1
      },
      {
        _id: 2,
        host: 'mongodb-secondary2:27017',
        priority: 1
      },
      {
        _id: 3,
        host: 'mongodb-arbiter:27017',
        arbiterOnly: true
      }
    ]
  });
  print('Replica set iniciado com sucesso!');
} catch (e) {
  print('Erro ao iniciar replica set: ' + e);
}
"

echo "Aguardando replica set estabilizar..."
sleep 15

# Verificar status do replica set
mongo --host mongodb-primary:27017 -u admin -p senha123 --authenticationDatabase admin --eval "
rs.status();
"

echo "Criando usuário da aplicação..."

# Criar usuário da aplicação no primary
mongo --host mongodb-primary:27017 -u admin -p senha123 --authenticationDatabase admin planejador-financeiro --eval "
try {
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
  print('Usuário planejador criado com sucesso!');
} catch (e) {
  print('Usuário já existe ou erro: ' + e);
}
"

echo "Criando índices..."

# Criar índices para performance
mongo --host mongodb-primary:27017 -u admin -p senha123 --authenticationDatabase admin planejador-financeiro --eval "
// Índices únicos
db.users.createIndex({ email: 1 }, { unique: true });
db.profiles.createIndex({ userId: 1 }, { unique: true });
db.notificationsettings.createIndex({ userId: 1 }, { unique: true });

// Índices de consulta
db.goals.createIndex({ userId: 1 });
db.goals.createIndex({ createdAt: -1 });
db.goals.createIndex({ status: 1 });
db.marketdata.createIndex({ symbol: 1, type: 1 });
db.marketdata.createIndex({ lastUpdated: -1 });

// Índices compostos para queries complexas
db.goals.createIndex({ userId: 1, status: 1, createdAt: -1 });
db.marketdata.createIndex({ type: 1, lastUpdated: -1 });

print('Índices criados com sucesso!');
"

echo "Inserindo dados de exemplo..."

# Inserir dados iniciais
mongo --host mongodb-primary:27017 -u admin -p senha123 --authenticationDatabase admin planejador-financeiro --eval "
try {
  db.marketdata.insertMany([
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      type: 'crypto',
      price: 67000,
      change: 1500,
      changePercent: 2.29,
      volume: 28000000000,
      currency: 'USD',
      lastUpdated: new Date()
    },
    {
      symbol: 'ETH-USD',
      name: 'Ethereum',
      type: 'crypto',
      price: 3500,
      change: 120,
      changePercent: 3.56,
      volume: 15000000000,
      currency: 'USD',
      lastUpdated: new Date()
    },
    {
      symbol: '^GSPC',
      name: 'S&P 500',
      type: 'stock',
      price: 5400,
      change: 25,
      changePercent: 0.46,
      volume: 3500000000,
      currency: 'USD',
      lastUpdated: new Date()
    }
  ]);
  print('Dados de exemplo inseridos!');
} catch (e) {
  print('Dados já existem ou erro: ' + e);
}
"

echo "Configuração do Replica Set concluída!"
echo ""
echo "=== STATUS DO REPLICA SET ==="
mongo --host mongodb-primary:27017 -u admin -p senha123 --authenticationDatabase admin --eval "
print('PRIMARY: mongodb-primary:27017');
print('SECONDARY 1: mongodb-secondary1:27017');
print('SECONDARY 2: mongodb-secondary2:27017');
print('ARBITER: mongodb-arbiter:27017');
print('');
print('=== CONFIGURAÇÃO DE CONEXÃO ===');
print('WRITE (Primary): mongodb://admin:senha123@mongodb-primary:27017/planejador-financeiro?authSource=admin&replicaSet=rs0');
print('READ (Secondaries): mongodb://admin:senha123@mongodb-secondary1:27017,mongodb-secondary2:27017/planejador-financeiro?authSource=admin&replicaSet=rs0&readPreference=secondaryPreferred');
print('');
rs.status().members.forEach(function(member) {
  print(member.name + ' - ' + member.stateStr + ' (health: ' + member.health + ')');
});
"