#!/bin/bash

# Script de Teste - Sistema de Login com Persistência PostgreSQL
# Execute este script para testar o sistema completo com persistência

echo "🚀 Testando Sistema de Login com Persistência PostgreSQL"
echo "========================================================"

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    exit 1
fi

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Arquivo .env.local não encontrado."
    echo "📝 Copie o arquivo env-template.txt para .env.local e configure as variáveis:"
    echo "   cp env-template.txt .env.local"
    echo "   # Edite .env.local com suas credenciais do Google"
    exit 1
fi

echo "✅ Docker está rodando"
echo "✅ Arquivo .env.local encontrado"

# Parar containers existentes
echo "🔄 Parando containers existentes..."
docker-compose down

# Iniciar PostgreSQL
echo "🐘 Iniciando PostgreSQL..."
docker-compose up -d postgres

# Aguardar o PostgreSQL inicializar
echo "⏳ Aguardando PostgreSQL inicializar..."
sleep 15

# Verificar se o PostgreSQL está rodando
if docker-compose ps postgres | grep -q "Up"; then
    echo "✅ PostgreSQL está rodando"
else
    echo "❌ Erro ao iniciar PostgreSQL"
    docker-compose logs postgres
    exit 1
fi

# Verificar conexão com o banco
echo "🔍 Testando conexão com o banco..."
if docker exec task-manager-postgres psql -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Conexão com PostgreSQL OK"
else
    echo "❌ Erro na conexão com PostgreSQL"
    exit 1
fi

# Verificar se as tabelas foram criadas
echo "📊 Verificando tabelas do NextAuth..."
TABLES=$(docker exec task-manager-postgres psql -U task_manager_user -d task_manager -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('users', 'accounts', 'sessions', 'verification_tokens');")

if [ "$TABLES" -eq 4 ]; then
    echo "✅ Todas as tabelas do NextAuth foram criadas"
else
    echo "❌ Tabelas do NextAuth não foram criadas corretamente"
    echo "📋 Tabelas encontradas:"
    docker exec task-manager-postgres psql -U task_manager_user -d task_manager -c "\dt"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se as dependências foram instaladas
if [ -d "node_modules/@auth/pg-adapter" ]; then
    echo "✅ Dependências instaladas"
else
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo ""
echo "🎉 Sistema configurado com persistência!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure suas credenciais do Google no arquivo .env.local"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000/login"
echo "4. Teste o login com Google"
echo "5. Verifique os dados no banco:"
echo ""
echo "🔧 Comandos para verificar persistência:"
echo "# Ver usuários criados:"
echo "docker exec -it task-manager-postgres psql -U task_manager_user -d task_manager -c 'SELECT * FROM users;'"
echo ""
echo "# Ver contas OAuth:"
echo "docker exec -it task-manager-postgres psql -U task_manager_user -d task_manager -c 'SELECT * FROM accounts;'"
echo ""
echo "# Ver sessões ativas:"
echo "docker exec -it task-manager-postgres psql -U task_manager_user -d task_manager -c 'SELECT * FROM sessions;'"
echo ""
echo "📊 Gerenciamento do banco (opcional):"
echo "- pgAdmin: http://localhost:8080"
echo "- Email: admin@taskmanager.com"
echo "- Senha: admin123"
