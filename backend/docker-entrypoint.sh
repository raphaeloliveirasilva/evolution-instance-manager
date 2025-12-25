#!/bin/sh

echo "Aguardando 15s para estabilização do MySQL..."
sleep 15

# Caminho direto para o binário que o npm cria
SEQUELIZE="./node_modules/.bin/sequelize-cli"

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo ">>> Executando Migrations..."
  $SEQUELIZE db:migrate --url "mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:3306/$DB_NAME"
fi

if [ "$RUN_SEEDS" = "true" ]; then
  echo ">>> Executando Seeds..."
  $SEQUELIZE db:seed:all --url "mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:3306/$DB_NAME"
fi

echo ">>> Iniciando o servidor..."
exec node src/server.js