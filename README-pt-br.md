<div align="center">

# 🔗 Gerador de Webhook Handlers com IA

[![Vercel Status](https://therealsujitk-vercel-badge.vercel.app/?app=webhook-handler-generator)](https://webhook-handler-generator.vercel.app/)
[![Render](https://img.shields.io/badge/render-live-brightgreen?style=flat&logo=render&logoColor=white)](https://ai-powered-webhook-handler-generator.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um monorepo que simula eventos de webhook do Stripe e usa IA para gerar automaticamente handlers TypeScript tipados com base na estrutura do payload.

**Backend:** TypeScript · Fastify · Drizzle ORM · PostgreSQL  
**Frontend:** React · Vite · TypeScript

🌐 _[Read in English](README.md)_


<img width="700" height="400" alt="image" src="https://github.com/user-attachments/assets/d5a376a4-90a1-4aca-be4d-19dc84a1949b" />

</br>

[Demo ao Vivo](https://webhook-handler-generator.vercel.app/) · [API](https://ai-powered-webhook-handler-generator.onrender.com) · [Reportar Bug](https://github.com/guilhermehfr/AI-Powered-Webhook-Handler-Generator/issues)

</div>

---

## ✨ Funcionalidades

- **Simulação de webhooks do Stripe** – Eventos de webhook mockados pré-carregados, gerados com Faker para payloads realistas.
- **Geração de handlers com IA** – Selecione um evento de webhook e receba um handler TypeScript tipado, gerado por um LLM com base no seu payload.
- **Syntax highlighting** – Código gerado exibido com highlighting via Shiki.
- **Documentação de API interativa** – Swagger + Scalar disponíveis diretamente a partir do backend.
- **API type-safe** – Tipagem segura de ponta a ponta com TypeScript, Zod e Drizzle ORM.
- **UI moderna** – Interface React responsiva com Tailwind CSS v4, Radix UI e TanStack Router.
- **Monorepo** – Experiência de desenvolvimento unificada com pnpm workspaces.

---

## 🛠 Stack Tecnológica

### Backend

| Tecnologia | Propósito |
| --- | --- |
| [Fastify](https://www.fastify.io/) | Servidor de API |
| [Drizzle ORM](https://orm.drizzle.team/) | Acesso ao banco de dados type-safe |
| [Neon](https://neon.tech/) | PostgreSQL serverless |
| [Groq SDK](https://groq.com/) | Inferência de LLM (geração de handlers) |
| [Faker](https://fakerjs.dev/) | Geração de payloads de webhook mockados |
| [Zod](https://zod.dev/) | Validação e tipagem de schemas |
| [Swagger + Scalar](https://scalar.com/) | Documentação de API interativa |
| [Pino](https://getpino.io/) | Logging |
| [uuidv7](https://github.com/LiosK/uuidv7) | Geração de IDs |

### Frontend

| Tecnologia | Propósito |
| --- | --- |
| [React 19](https://react.dev/) | Framework de UI |
| [Vite](https://vite.dev/) | Build tool e dev server |
| [TanStack Router](https://tanstack.com/router) | Roteamento baseado em arquivos |
| [TanStack Query](https://tanstack.com/query) | Gerenciamento de estado assíncrono |
| [Tailwind CSS v4](https://tailwindcss.com/) | Estilização |
| [Radix UI](https://www.radix-ui.com/) | Componentes acessíveis |
| [Shiki](https://shiki.matsu.io/) | Syntax highlighting para o código gerado |
| [Zod](https://zod.dev/) | Validação de dados |
| [date-fns](https://date-fns.org/) | Manipulação de datas |

### Ferramentas

| Tecnologia | Propósito |
| --- | --- |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Biome](https://biomejs.dev/) | Formatação & linting |
| [pnpm](https://pnpm.io/) | Gerenciamento de pacotes |
| [Docker Compose](https://docs.docker.com/compose/) | Configuração de containers |

---

## 📁 Estrutura do Projeto
```
├── api/                        # Backend Fastify
│   ├── src/
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   └── schema/
│   │   ├── routes/
│   │   ├── env.ts
│   │   └── server.ts
│   ├── drizzle.config.ts
│   ├── docker-compose.yml
│   └── package.json
│
├── web/                        # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── http/
│   │   │   ├── client.ts       # URL base da API a partir de env
│   │   │   └── schemas/
│   │   └── routes/
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── pnpm-workspace.yaml
└── package.json
```

---

## 🚀 Como Começar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/)
- [Docker](https://docker.com/) (para banco de dados local) ou um banco [Neon](https://neon.tech/)
- Uma chave de API da [Groq](https://console.groq.com/)

### Instalação
```sh
git clone https://github.com/guilhermehfr/AI-Powered-Webhook-Handler-Generator.git
cd AI-Powered-Webhook-Handler-Generator
pnpm install
```

### Variáveis de Ambiente

**API:**
```sh
cp api/.env.example api/.env
```

Preencha seu `api/.env`:
```env
DATABASE_URL=postgresql://docker:docker@localhost:5432/webhooks   # Docker local
# DATABASE_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require  # Neon
GROQ_API_KEY=sua_chave_api_groq
```

**Frontend (opcional — padrão `http://localhost:3333`):**
```sh
cp web/.env.example web/.env
```

### Banco de Dados

Inicie o container local do Postgres:
```sh
pnpm --filter api db:up
```

Execute as migrations:
```sh
pnpm --filter api db:migrate
```

Popule com dados mockados (opcional):
```sh
pnpm --filter api db:seed:local
```

Pare o banco de dados quando terminar:
```sh
pnpm --filter api db:down
```

Resete o banco de dados (apaga todos os dados e começa do zero):
```sh
pnpm --filter api db:reset
```

### Desenvolvimento

Inicie a API e o frontend simultaneamente:
```sh
pnpm dev
```

Ou inicie individualmente:
```sh
# Apenas a API
pnpm --filter api dev

# Apenas o frontend
pnpm --filter web dev
```

### Build
```sh
pnpm --filter api build
pnpm --filter web build
```

---

## 👋 Contato

- LinkedIn: [guilhermehe](https://linkedin.com/in/guilhermehe)
- GitHub: [guilhermehfr](https://github.com/guilhermehfr)
