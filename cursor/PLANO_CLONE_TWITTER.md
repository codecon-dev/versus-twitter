# Plano: Clone do Twitter

Documento de referência para implementação.

## 1. Escopo e requisitos

- **Feed com posts**: timeline com tweets (texto + mídia opcional).
- **Curtir**: like em posts com contagem e estado (curti/não curti).
- **Retweet**: repost (com ou sem comentário).
- **Perfil de usuário**: bio, foto, nome, @username, lista de posts do usuário.
- **Seguir pessoas**: relação seguidor/seguido; feed baseado em quem se segue.
- **Algoritmo de feed**: ordenação cronológica no MVP (score opcional depois).

## 2. Stack utilizada

- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco**: PostgreSQL + Prisma
- **Auth**: JWT em cookie httpOnly

## 3. Modelo de dados

- **users**: id, email, password_hash, username, display_name, avatar_url, bio, created_at
- **posts**: id, author_id, retweet_of_id (opcional), content, media_url, created_at
- **likes**: user_id, post_id (PK composta)
- **follows**: follower_id, followed_id (PK composta)

## 4. APIs implementadas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Registro |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/users/me | Perfil do logado |
| PATCH | /api/users/me | Atualizar perfil |
| GET | /api/users/:username | Perfil público |
| GET | /api/users/:username/posts | Posts do perfil |
| POST | /api/users/:id/follow | Seguir |
| DELETE | /api/users/:id/follow | Deixar de seguir |
| GET | /api/feed | Feed cronológico (paginado) |
| POST | /api/posts | Criar post |
| DELETE | /api/posts/:id | Deletar post |
| POST | /api/posts/:id/like | Curtir |
| DELETE | /api/posts/:id/like | Descurtir |
| POST | /api/posts/:id/retweet | Retweet |

## 5. Como rodar

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `JWT_SECRET`.
2. `npm install`
3. `npm run db:push` (cria as tabelas no banco)
4. `npm run dev`

Acesse http://localhost:3000 — cadastre-se em /register e use /login para entrar.
