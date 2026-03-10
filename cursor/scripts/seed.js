require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SEED_PASSWORD = "password123";

const SEED_USERS = [
  { email: "luna.dev@email.com", username: "lunadev", displayName: "Luna Dev", bio: "Desenvolvedora de noite, mãe de gatos de dia. TypeScript > tudo." },
  { email: "carlos.tech@email.com", username: "carlostech", displayName: "Carlos Tech", bio: "CTO em formação. Café e código." },
  { email: "ana.codes@email.com", username: "anacodes", displayName: "Ana Codes", bio: "Front-end enthusiast • React • Next.js • Design systems" },
  { email: "pedro.startup@email.com", username: "pedrostartup", displayName: "Pedro Startup", bio: "Construindo coisas. Falando de produto e growth." },
  { email: "maria.ux@email.com", username: "mariaux", displayName: "Maria UX", bio: "UX Researcher. O usuário sempre em primeiro lugar." },
  { email: "rafa.data@email.com", username: "rafadata", displayName: "Rafa Data", bio: "Dados, ML e um pouco de caos. Python lover." },
  { email: "julia.creativa@email.com", username: "juliacriativa", displayName: "Julia Criativa", bio: "Ilustradora e designer. Arte no dia a dia." },
  { email: "bruno.games@email.com", username: "brunogames", displayName: "Bruno Games", bio: "Game dev nas horas vagas. Indie forever." },
  { email: "fernanda.books@email.com", username: "fernandabooks", displayName: "Fernanda Books", bio: "Leitura e café. Autora de um dia." },
  { email: "leo.memes@email.com", username: "leomemes", displayName: "Leo Memes", bio: "Só memes e verdades. Nada mais." },
  { email: "clara.viagens@email.com", username: "claraviagens", displayName: "Clara Viagens", bio: "Nômade digital. Próxima parada: sempre incerta." },
  { email: "diego.music@email.com", username: "diegomusic", displayName: "Diego Music", bio: "Produção musical e sintetizadores. Beats 24/7." },
];

const SEED_POSTS = [
  { content: "Debugging é tipo procurar uma agulha no palheiro, mas o palheiro está em chamas e a agulha é um bug de race condition." },
  { content: "Alguém mais acha que o melhor momento do dia é quando o build passa no primeiro try? Só eu? Ok." },
  { content: "Documentação: aquele lugar onde a gente escreve o que o código deveria fazer e nunca mais olha. 📚" },
  { content: "Hoje aprendi que 'só mais um commit' são na verdade 47 commits. Obrigado, hiperfoco." },
  { content: "Produto bom é produto que resolve um problema real. O resto é feature creep com café." },
  { content: "Pesquisa de usuário é como terapia: todo mundo acha que não precisa até fazer a primeira sessão." },
  { content: "Se os dados estão bagunçados, o modelo vai refletir isso. Garbage in, garbage out (e muito café)." },
  { content: "Ilustração do dia: um dev olhando para o monitor às 23h perguntando 'quem escreveu isso?' (era ele em 2019)." },
  { content: "Indie game dev = 10% criar jogos, 90% aprender que marketing é difícil pra caramba." },
  { content: "Livro do mês: aquele que você comprou e ainda não abriu. A pilha cresce. A culpa também." },
  { content: "Memes são a linguagem universal. Change my mind." },
  { content: "Trabalhar de qualquer lugar soa ótimo até você perceber que 'qualquer lugar' vira 'mesma cafeteria de sempre'." },
  { content: "Novo beat no forno. 120 BPM, vibes de domingo à noite. Em breve." },
  { content: "Code review alheio: 'isso poderia ser mais simples'. Meu código: 400 linhas de ternários aninhados." },
  { content: "Reunião que poderia ter sido um email: a trilogia. Parte 1 - O convite. Parte 2 - A espera. Parte 3 - O 'vamos alinhar de novo'." },
  { content: "Design system é amor. Design system é vida. Até alguém pedir 'só uma exceção' pela 47ª vez." },
  { content: "Python: 'import antigravity'. Ainda funciona. Ainda rio." },
  { content: "Pergunta genuína: quem mais abre o LinkedIn só para fechar em 3 segundos?" },
  { content: "Fim de sprint = momento de olhar o backlog e fingir que na próxima a gente entrega tudo. Spoiler: não entregamos." },
  { content: "A melhor ferramenta de produtividade é desligar as notificações. Fight me." },
  { content: "Hoje o algoritmo me recomendou 'como acordar às 5h'. Eu que recomendo: não acordar às 5h." },
  { content: "Arte bloqueada é quando você tem 10 ideias e nenhuma sai do papel. Amanhã tentamos de novo." },
  { content: "Retrospectiva da semana: funcionou? Quase. Quebrou? Só um pouco. Aprendemos? Talvez." },
  { content: "Café número 4. Sim, são 10h. Não, não estou bem." },
  { content: "Deploy na sexta às 18h. O que pode dar errado? Tudo. Tudo pode dar errado." },
  { content: "UX writing: cada palavra importa. Também por isso reviso esse tweet há 20 minutos." },
  { content: "Dados abertos são o futuro. Também são um trabalho enorme de limpeza. Vale a pena." },
  { content: "Música de concentração: lo-fi, synthwave ou silêncio absoluto. Não existe meio-termo." },
  { content: "Build quebrou. Culpa: 'alguém'. Git blame: eu, 3 meses atrás. Clássico." },
  { content: "Férias de verdade = sem Slack, sem email, sem 'só uma pergunta rápida'. Sonho distante." },
];

async function main() {
  const hash = await bcrypt.hash(SEED_PASSWORD, 10);

  const created = [];
  for (const u of SEED_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      created.push(existing);
      continue;
    }
    const user = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        displayName: u.displayName,
        bio: u.bio,
        passwordHash: hash,
      },
    });
    created.push(user);
  }

  if (created.length === 0 && (await prisma.user.count()) > 0) {
    const users = await prisma.user.findMany({ take: Math.min(12, await prisma.user.count()) });
    for (let i = 0; i < users.length; i++) created.push(users[i]);
  }

  const authors = created.slice(0, SEED_USERS.length);
  let added = 0;
  for (const post of SEED_POSTS) {
    const author = authors[Math.floor(Math.random() * authors.length)];
    if (!author) continue;
    await prisma.post.create({
      data: {
        authorId: author.id,
        content: post.content,
      },
    });
    added++;
  }

  console.log(`Seed concluído: ${created.length} usuários, ${added} posts.`);
  console.log(`Senha dos usuários de seed: ${SEED_PASSWORD}`);

  // Opcional: fazer um usuário seguir todos os da lista de seed
  const followForUsername = process.env.SEED_FOLLOW_FOR_USER;
  if (followForUsername) {
    const mainUser = await prisma.user.findUnique({ where: { username: followForUsername } });
    if (!mainUser) {
      console.log(`AVISO: SEED_FOLLOW_FOR_USER="${followForUsername}" não encontrado. Defina no .env o username que deve seguir todos.`);
    } else {
      const seedUsernames = SEED_USERS.map((u) => u.username);
      const seedUsers = await prisma.user.findMany({ where: { username: { in: seedUsernames } } });
      let follows = 0;
      for (const seedUser of seedUsers) {
        if (seedUser.id === mainUser.id) continue;
        await prisma.follow.upsert({
          where: {
            followerId_followedId: { followerId: mainUser.id, followedId: seedUser.id },
          },
          create: { followerId: mainUser.id, followedId: seedUser.id },
          update: {},
        });
        follows++;
      }
      console.log(`@${followForUsername} agora segue ${follows} usuários da lista de seed.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
