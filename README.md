# Link Shortener

Encurtador de URLs moderno construído com Next.js, TypeScript e PostgreSQL.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Clerk
- **UI**: Tailwind CSS + shadcn/ui

## Setup Rápido

1. Clone o repositório e instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente (`.env.local`):
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

3. Execute as migrações do banco:
```bash
npm run db:migrate
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run db:generate  # Gerar migrações
npm run db:studio    # Drizzle Studio
```

## Documentação

Para desenvolvedores e agentes LLM, consulte:
- [AGENTS.md](AGENTS.md) - Guia principal
- [/docs](docs/) - Documentação técnica detalhada
