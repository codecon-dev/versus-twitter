# Claude Code vs. Cursor vs. Copilot: Clone do Twitter 🐦
> *Três IAs. Três devs. Duas horas. Um clone do Twitter.*

## Sobre o Projeto

Qual ferramenta de IA realmente entrega na prática? Não em benchmark, não em opinião — em código rodando ao vivo, sob pressão, com prazo.

A gente colocou **Claude Code**, **Cursor** e **Copilot** pra competir de verdade: cada dev usando somente a ferramenta atribuída, duas horas no relógio, e no final uma comparação lado a lado dos três clones do Twitter.

O projeto foi criado durante um desafio ao vivo no canal da [Codecon](https://youtube.com/codecondev), com João Vitor (Cursor), Luis Silveira (Claude Code) e Ricardo Campos (Copilot).

## O Desafio

Stack livre, linguagem livre, framework livre. O clone do Twitter precisava ter obrigatoriamente:

- **Feed com posts** — Timeline funcionando
- **Curtir e retweet** — Interações básicas implementadas
- **Perfil do usuário** — Página de perfil com dados
- **Seguir pessoas** — Sistema de follow/unfollow
- **Algoritmo de feed** — Lógica de ordenação que faça sentido

## 📁 Estrutura do Repositório

```
/
├── cursor/          # João Vitor — Cursor
│   └── README.md
├── claude-code/     # Luis Silveira — Claude Code
│   └── README.md
├── copilot/         # Ricardo Campos — Copilot
│   └── README.md
└── README.md
```

Cada pasta contém a implementação completa do participante com sua stack, decisões técnicas e experiência com a ferramenta.

## Rodando Localmente

Acesse a pasta da implementação que quiser testar e siga o README específico de cada uma.

## Participe Você Também!

**Acha que você e sua IA favorita fariam melhor em 2 horas?**

1. **Fork** este repositório
2. Crie uma pasta com seu nome/username e a IA que usou
3. Implemente o clone do Twitter com as funcionalidades obrigatórias
4. Documente no README: stack escolhida, primeiros prompts, o que a IA acertou, o que ela errou e o que você aprendeu
5. Abra um **Pull Request**

## Conceitos-Chave

- **Prompt Engineering** — Como você pede o código importa tanto quanto o que você pede. Qual foi o prompt que mais fez diferença?
- **Debugging com IA** — Deixar a IA gerar o erro e corrigir o próprio erro é uma habilidade separada de escrever código com ela
- **Algoritmo de feed** — Cronológico, por relevância, por engajamento? Cada abordagem tem trade-offs reais de implementação
- **Velocidade vs. qualidade** — Sob pressão de tempo, o que você sacrifica primeiro?
- **Contexto da IA** — Quanto contexto do projeto você precisa dar pra IA antes de pedir código? Quando ela se perde?

## Licença

MIT

---

*Projeto desenvolvido para o canal da [Codecon](https://youtube.com/codecondev)*
