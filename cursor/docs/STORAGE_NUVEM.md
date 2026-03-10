# Storage em nuvem (opcional)

Por padrão, avatares e imagens de posts são salvos em `public/uploads/`. Para produção ou múltiplos servidores, convém usar um provedor na nuvem.

## Opções

- **AWS S3**: variáveis `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`. Usar SDK `@aws-sdk/client-s3` e gerar URLs públicas ou signed.
- **Cloudinary**: variáveis `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Usar SDK `cloudinary` no upload e retornar `secure_url`.

## Onde alterar no projeto

- `src/app/api/upload/avatar/route.ts` – hoje grava em `public/uploads/avatars/`. Trocar por chamada ao S3/Cloudinary e retornar a URL pública.
- `src/app/api/upload/post/route.ts` – mesmo padrão para `public/uploads/posts/`.

Você pode criar um módulo `src/lib/upload.ts` que, conforme `process.env.UPLOAD_PROVIDER` (`local` | `s3` | `cloudinary`), decide onde gravar e devolve a URL.
