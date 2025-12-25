# 🚀 Evolution Instance Manager

Uma solução completa de painel administrativo (Dashboard) para gerenciamento de instâncias da **Evolution API**. Este projeto permite controlar sessões, visualizar status e gerenciar múltiplas instâncias de forma centralizada e intuitiva.

## 🛠️ Tecnologias e Arquitetura

O ecossistema é composto por três serviços principais, orquestrados via Docker:

* **Frontend**: Interface administrativa moderna construída com **React/Vite**, servida por um servidor Nginx otimizado.
* **Backend**: API RESTful em **Node.js** utilizando **Express**, **Sequelize ORM** e integração nativa com os endpoints da Evolution API.
* **Database**: Persistência de dados segura utilizando **MySQL 8.0**.

---

## 📦 Guia de Instalação

A stack foi projetada para deploy imediato via **Docker Compose**.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/seu-usuario/evolution-instance-manager.git](https://github.com/seu-usuario/evolution-instance-manager.git)
cd evolution-instance-manager
```

### 2. Variáveis de Ambiente
Copie o arquivo de exemplo para configurar suas chaves e URLs:
```bash
cp .env.exemplo .env
```
> **Nota:** Abra o arquivo `.env` e certifique-se de apontar a `EVOLUTION_URL` para a sua instalação ativa da Evolution API.

### 3. Inicialização
Suba toda a stack com um único comando:
```bash
docker-compose up -d
```

---

## 🔄 Automação de Banco de Dados (Migrations)

O backend possui um script de inicialização inteligente que gerencia o ciclo de vida do banco de dados automaticamente:

1.  **Wait-for-DB**: O container aguarda a prontidão do MySQL antes de iniciar.
2.  **Auto-Migrations**: Cria e atualiza as tabelas do sistema sem necessidade de intervenção manual.
3.  **Auto-Seeds**: Alimenta o banco com as configurações e permissões iniciais necessárias.

Você pode habilitar/desabilitar essas funções através das variáveis de ambiente:
* `RUN_MIGRATIONS=true`
* `RUN_SEEDS=true`

---

## 🔐 Acesso e Credenciais Iniciais

Após o deploy, acesse o painel através do endereço configurado no seu Proxy Reverso (ou `localhost` se estiver rodando localmente).

**Credenciais Padrão de Primeiro Acesso:**
* **E-mail:** `admin@admin`
* **Senha:** `admin`

> ⚠️ **Segurança:** Recomenda-se a alteração imediata da senha padrão e do e-mail de administrador após o primeiro acesso bem-sucedido.

---

## 📂 Organização do Projeto

* `/backend`: Lógica de negócio, autenticação e integração com Evolution API.
* `/frontend`: Interface do usuário e gerenciamento de estado das instâncias.
* `docker-compose.yml`: Orquestração completa da stack para produção.
* `.env.exemplo`: Guia de configuração de variáveis obrigatórias.

---

## 🛡️ Versionamento

* O arquivo `.env` real é ignorado pelo Git para evitar vazamento de credenciais.
* Versões estáveis são marcadas com **Git Tags** (ex: `v1.0.0`).
* As imagens oficiais deste projeto são construídas via Dockerfile nas respectivas pastas.