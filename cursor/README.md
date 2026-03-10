# Twitter Clone

Clone do Twitter com feed, curtir, retweet, perfil e seguir pessoas.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Autenticação JWT (cookie httpOnly)

## Setup

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o banco: copie `.env.example` para `.env` e defina:
   - `DATABASE_URL`: connection string do PostgreSQL (ex.: Supabase ou Neon)
   - `JWT_SECRET`: uma chave secreta longa e aleatória

3. Crie as tabelas no banco:
   ```bash
   npm run db:push
   ```

4. (Opcional) Popule com usuários e posts de exemplo:
   ```bash
   npm run db:seed
   ```
   Senha dos usuários de seed: `password123`. Depois siga alguns deles para ver o feed cheio.

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

Acesse [http://localhost:3000](http://localhost:3000). Cadastre-se em **/register** e faça login em **/login**.

## Funcionalidades

- Registro e login
- Feed com abas "Para você" (algoritmo) e "Seguindo" (cronológico)
- Criar post (texto, até 280 caracteres)
- Curtir e descurtir
- Retweet
- Perfil com seguidores/seguindo e lista de posts
- Seguir e deixar de seguir
- Seed: `npm run db:seed` para criar perfis e posts de exemplo

Plano detalhado: [PLANO_CLONE_TWITTER.md](PLANO_CLONE_TWITTER.md)
