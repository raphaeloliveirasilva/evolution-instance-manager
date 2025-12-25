require('dotenv').config(); // Carrega as variáveis do .env
const express = require('express');
const cors = require('cors');
const { connection } = require('./models/Index');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(cors()); // Permite acesso externo (útil para o frontend depois)
app.use(express.json()); // Permite que a API entenda JSON no corpo das requisições
app.use(routes);

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    // Testa a conexão com o banco antes de dizer que está tudo ok
    await connection.authenticate();
    console.log('✅ Conexão com MySQL estabelecida com sucesso.');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  } catch (error) {
    console.error('❌ Falha ao conectar no banco de dados:', error);
  }
});