# O que falta implementar

Resumo do que já foi feito e do que ainda pode ser implementado.

## Já implementado

- **Feed com "Carregar mais"** – Paginação por cursor no feed; botão "Carregar mais" no final da lista.
- **Editar perfil** – Página `/perfil/editar` com nome, bio, URL da foto e **upload de arquivo** para avatar.
- **Deletar post** – Botão "Deletar" no card do post, visível só para o autor.
- **Algoritmo de recomendação** – Aba "Para você" no feed com score `(likes*2 + retweets*3) / (1 + horas)`; aba "Seguindo" cronológica.
- **Upload de avatar** – API `POST /api/upload/avatar`, salva em `public/uploads/avatars/`.
- **Upload de mídia em posts** – API `POST /api/upload/post`, salva em `public/uploads/posts/`; composer do feed com botão de imagem.
- **Quote tweet** – Modal ao clicar em Retweet com comentário opcional; "Só retweetar" ou "Retweetar com comentário".
- **Paginação no perfil** – Botão "Carregar mais" em `/users/:username` usando `nextCursor`.
- **Polish** – Contador 280 no post, 160 na bio; mensagens de erro em post e edição de perfil.

## Implementado nesta rodada

- **Responsividade** – Menu hambúrguer no mobile; sidebar esquerda como drawer que abre/fecha; header fixo no topo em telas pequenas.
- **Algoritmo mais rico** – No "Para você": boost por recência (fator de meia-vida 24h), boost por interação (autores que você mais curte/retweeta sobem no feed).
- **Preparação para storage em nuvem** – `.env.example` e `docs/STORAGE_NUVEM.md` com instruções para S3/Cloudinary.
- **Seed de dados** – `npm run db:seed` cria 12 perfis fictícios e 30 publicações criativas (senha dos usuários: `password123`). Ver `scripts/seed.js`.

## Próximos passos opcionais

- **Storage em nuvem** – Trocar `public/uploads/` por S3 ou Cloudinary (ver `docs/STORAGE_NUVEM.md`).
- **Busca** – Buscar usuários e posts por texto.
- **Notificações / DMs / Bookmarks** – Conforme evolução do produto.
