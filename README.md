# Link Shortener

Encurtador de URLs moderno construído com Next.js, TypeScript e PostgreSQL.

## Funcionalidades

- ✂️ Encurtamento de URLs com códigos personalizáveis
- 🔐 Autenticação de usuários
- 📊 Dashboard com histórico de links
- 📈 Estatísticas de cliques

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Clerk
- **UI**: Tailwind CSS + shadcn/ui

## Pré-requisitos

- Node.js 18+
- Conta no [Neon](https://neon.tech) (PostgreSQL)
- Conta no [Clerk](https://clerk.com) (Autenticação)

## Setup Rápido

1. Clone o repositório e instale as dependências:
```bash
yarn install
```

2. Configure as variáveis de ambiente (`.env.local`):
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

3. Execute as migrações do banco:
```bash
yarn db:migrate
```

4. Inicie o servidor de desenvolvimento:
```bash
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Comandos Úteis

```bash
yarn dev          # Desenvolvimento
yarn build        # Build de produção
yarn db:generate  # Gerar migrações
yarn db:studio    # Drizzle Studio
```

## Documentação

Para desenvolvedores e agentes LLM, consulte:
- [AGENTS.md](AGENTS.md) - Guia principal
- [/docs](docs/) - Documentação técnica detalhada
