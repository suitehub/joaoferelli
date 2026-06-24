/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgendaItem, RecadoItem, MemoriaItem, CartinhaItem, ConversaRoom, ConteudoFile } from '../types';

export const initialAgenda: AgendaItem[] = [
  {
    id: 'a1',
    title: 'Preparar sermão de Domingo',
    date: '2026-06-25',
    time: '09:00',
    status: 'doing',
    priority: 'high',
    description: 'Tema: Graça e Redenção. Focar no livro de Romanos capítulo 5.'
  },
  {
    id: 'a2',
    title: 'Enviar relatório mensal de atividades',
    date: '2026-06-26',
    time: '14:00',
    status: 'todo',
    priority: 'medium',
    description: 'Reunir dados das reuniões de grupo e discipulado.'
  },
  {
    id: 'a3',
    title: 'Comprar presente da Kimberly',
    date: '2026-06-28',
    status: 'todo',
    priority: 'high',
    description: 'Procurar aquele livro ou um acessório bonito que ela comentou semana passada.'
  },
  {
    id: 'a4',
    title: 'Fazer orçamento de manutenção de som',
    date: '2026-06-24',
    time: '10:30',
    status: 'done',
    priority: 'low',
    description: 'Falar com fornecedores de cabos e microfones novos.'
  },
  {
    id: 'a5',
    title: 'Leitura diária e meditação',
    date: '2026-06-24',
    time: '07:00',
    status: 'done',
    priority: 'medium',
    description: 'Leitura de Salmos e oração matinal.'
  }
];

export const initialRecados: RecadoItem[] = [
  {
    id: 'r1',
    title: '💡 Ideia de Ilustração para Sermão',
    text: 'A analogia do "segundo cérebro" como uma extensão da nossa memória, onde guardamos o que é precioso para que possamos viver o presente em paz. Usar no próximo estudo bíblico!',
    color: 'yellow',
    priority: 'medium',
    isPinned: true,
    createdAt: '2026-06-24T08:30:00Z'
  },
  {
    id: 'r2',
    title: '🛒 Lista de mercado urgente',
    text: '- Café gourmet (especial)\n- Mel de abelhas puro\n- Pão artesanal de fermentação natural\n- Frutas frescas',
    color: 'pink',
    priority: 'medium',
    isPinned: false,
    createdAt: '2026-06-24T09:15:00Z'
  },
  {
    id: 'r3',
    title: '🚨 Lembrar de ligar para o Tio Marcos',
    text: 'Dar os parabéns pelo aniversário dele e perguntar como foi a viagem ao Sul.',
    color: 'blue',
    priority: 'high',
    isPinned: true,
    createdAt: '2026-06-23T18:00:00Z'
  },
  {
    id: 'r4',
    title: '📝 Citação que gostei muito',
    text: '"A nossa mente é para ter ideias, não para guardá-las." - David Allen',
    color: 'green',
    priority: 'low',
    isPinned: false,
    createdAt: '2026-06-22T14:20:00Z'
  },
  {
    id: 'r5',
    title: '🔑 Senha do Wi-Fi da Igreja (Admin)',
    text: 'Rede: IGREJA_ADM_5G\nSenha: GracaEVerdade2026#',
    color: 'purple',
    priority: 'low',
    isPinned: false,
    createdAt: '2026-06-21T11:00:00Z'
  }
];

export const initialMemorias: MemoriaItem[] = [
  {
    id: 'm1',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600',
    caption: 'Passeio no parque ao entardecer. O dia estava fresco e a mente tranquila.',
    date: '2026-06-24',
    expiration: 'permanent',
    createdAt: '2026-06-24T17:00:00Z',
    isShared: false
  },
  {
    id: 'm2',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=600',
    caption: 'Nascer do sol maravilhoso durante o retiro de jovens.',
    date: '2026-06-20',
    expiration: 'permanent',
    createdAt: '2026-06-20T06:15:00Z',
    isShared: true
  },
  {
    id: 'm3',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    caption: 'Uma caneca de café quente, o silêncio da manhã e as escrituras.',
    date: '2026-06-24',
    expiration: '24h',
    createdAt: '2026-06-24T06:30:00Z',
    isShared: false
  },
  {
    id: 'm4',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    caption: 'Trabalho focado no café local hoje. Rendeu bastante!',
    date: '2026-06-18',
    expiration: '7d',
    createdAt: '2026-06-18T15:00:00Z',
    isShared: false
  }
];

export const initialCartinhas: CartinhaItem[] = [
  {
    id: 'c1',
    title: 'Carta de Incentivo e Apoio',
    content: 'Querido João, estou passando aqui para dizer o quão orgulhosa estou de ver sua dedicação e carinho em tudo o que faz. Que Deus continue iluminando seus passos e dando sabedoria nas decisões cotidianas. Lembre-se de descansar quando for preciso!',
    sender: 'Mãe',
    recipient: 'João',
    date: '2026-06-22',
    deliverAt: '2026-06-22',
    stampType: 'floral',
    sealColor: 'burgundy',
    isOpened: true
  },
  {
    id: 'c2',
    title: 'Uma surpresa para você',
    content: 'Oi amor! Escrevi esta cartinha para te lembrar o quanto você é especial para mim. Mal posso esperar para nos encontrarmos no fim de semana. Reservei esta mensagem para chegar exatamente para te fazer sorrir no meio da semana corrida. Te amo!',
    sender: 'Kimberly',
    recipient: 'João',
    date: '2026-06-23',
    deliverAt: '2026-06-26', // scheduled for future (3 days from date or 2 days from local time)
    stampType: 'heart',
    sealColor: 'gold',
    isOpened: false
  },
  {
    id: 'c3',
    title: 'Agradecimento pelo Sermão',
    content: 'Prezado Pastor João, a mensagem de Domingo sobre esperança nos momentos difíceis tocou profundamente nossa família. Gostaríamos de expressar nossa profunda gratidão pela sua vida e conselhos.',
    sender: 'Família Souza',
    recipient: 'João',
    date: '2026-06-21',
    deliverAt: '2026-06-21',
    stampType: 'crown',
    sealColor: 'navy',
    isOpened: false
  }
];

export const initialConversas: ConversaRoom[] = [
  {
    id: 'familia',
    name: 'Grupo Família 🏡',
    avatarColor: 'bg-emerald-500',
    description: 'Conversas e atualizações de família',
    createdAt: '2026-06-01',
    personaPrompt: 'Você representa o Grupo Família do João. Quando o João enviar uma mensagem, responda simulando duas pessoas: a Mãe (super amorosa, preocupada com o jantar e que manda emojis fofos) ou o Pai (que fala pouco, diz "Que bom, meu filho" ou "Deus abençoe", e manda emojis de polegar 👍). Alterne as respostas para dar dinâmica de grupo.',
    messages: [
      {
        id: 'msg1',
        sender: 'guest',
        senderName: 'Mãe',
        text: 'Filho, lembra de vir jantar conosco na quinta-feira! Vou fazer aquela lasanha que você gosta.',
        timestamp: '10:15'
      },
      {
        id: 'msg2',
        sender: 'owner',
        senderName: 'João',
        text: 'Oi mãe! Pode deixar, já está anotado na minha agenda digital aqui!',
        timestamp: '10:30'
      },
      {
        id: 'msg3',
        sender: 'guest',
        senderName: 'Pai',
        text: 'Deus te abençoe, filho. 👍',
        timestamp: '11:02'
      }
    ]
  },
  {
    id: 'kimberly',
    name: 'Kimberly ❤️',
    avatarColor: 'bg-rose-500',
    description: 'Nosso espaço especial de conversa',
    createdAt: '2026-06-02',
    personaPrompt: 'Você é a Kimberly, namorada/noiva do João. Você é extremamente doce, inteligente, alegre e carinhosa com ele. Apoia muito o João nos projetos dele, gosta de perguntar sobre o dia dele, e usa termos carinhosos como "meu amor", "lindo", "amor". Dê respostas fofas, atenciosas e naturais baseadas na mensagem dele.',
    messages: [
      {
        id: 'msg4',
        sender: 'owner',
        senderName: 'João',
        text: 'Oi linda! Como está sendo seu dia de trabalho hoje?',
        timestamp: '09:12'
      },
      {
        id: 'msg5',
        sender: 'guest',
        senderName: 'Kimberly',
        text: 'Oi, meu amor! Está bem corrido por aqui, mas estou focada. E o seu? Conseguiu avançar com a preparação do sermão?',
        timestamp: '09:20'
      }
    ]
  },
  {
    id: 'estudos',
    name: 'Grupo de Estudos Bíblicos 📖',
    avatarColor: 'bg-indigo-500',
    description: 'Materiais, dúvidas e bate-papo teológico',
    createdAt: '2026-06-05',
    personaPrompt: 'Você representa os participantes do Grupo de Estudos Bíblicos. Quando o João interagir, responda como Mateus (um jovem teólogo que sempre faz perguntas profundas sobre grego original) ou Clara (super engajada na aplicação prática das lições). Responda com entusiasmo acadêmico e devocional.',
    messages: [
      {
        id: 'msg6',
        sender: 'guest',
        senderName: 'Mateus',
        text: 'João, você acha interessante abordarmos o significado de "Dikaiosyne" (justiça) no próximo estudo?',
        timestamp: '14:50'
      },
      {
        id: 'msg7',
        sender: 'owner',
        senderName: 'João',
        text: 'Sensacional, Mateus! Esse termo enriquece muito a compreensão de Romanos. Vou preparar um material de apoio para disponibilizar na aba de Conteúdos.',
        timestamp: '15:10'
      }
    ]
  }
];

export const initialConteudos: ConteudoFile[] = [
  {
    id: 'f1',
    name: 'Esboço_Romanos_5_Graça.txt',
    category: 'sermoes',
    size: '14 KB',
    uploadDate: '24/06/2026',
    author: 'João',
    content: `ESBOÇO DE SERMÃO: ROMANOS 5:1-5
TEMA: JUSTIFICADOS PELA FÉ E A PAZ COM DEUS

Introdução:
No mundo caótico em que vivemos, a paz parece ser um artigo de luxo. Mas a Palavra nos traz uma paz que excede o entendimento.

1. JUSTIFICADOS PELA FÉ (v. 1):
- A justificação é um ato legal e amoroso onde Deus nos declara justos em Cristo.
- Resultado: "Temos paz com Deus por meio de nosso Senhor Jesus Cristo."

2. O ACESSO À GRAÇA (v. 2):
- Pela fé fomos introduzidos nesta graça na qual agora estamos firmes.
- Gloriamo-nos na esperança da glória de Deus.

3. O PROPÓSITO DO SOFRIMENTO (v. 3-4):
- Gloriamo-nos nas próprias tribulações.
- Tribulação gera paciência/perseverança.
- Perseverança gera caráter aprovado.
- Caráter aprovado gera esperança.

Conclusão:
"A esperança não nos decepciona, porque Deus derramou seu amor em nossos corações..."
Aplicação: Confiar na soberania divina mesmo sob pressão.`
  },
  {
    id: 'f2',
    name: 'Estudo_Teologia_da_Alianca.pdf',
    category: 'estudos',
    size: '1.2 MB',
    uploadDate: '15/06/2026',
    author: 'Seminário de Teologia',
    content: 'Documento PDF: Uma análise aprofundada dos pactos divinos nas Escrituras (Pacto da Redenção, Obras e Graça) e a progressão da Revelação divina no Antigo e Novo Testamento.'
  },
  {
    id: 'f3',
    name: 'Aula_Hermeneutica_Biblica_01.txt',
    category: 'aulas',
    size: '8 KB',
    uploadDate: '10/06/2026',
    author: 'João',
    content: 'Hermeneutica Bíblica - Aula 1\nRegras Básicas de Interpretação:\n1. O texto não pode significar o que nunca significou para o seu autor ou leitores originais.\n2. Sempre ler em contexto (versículo, capítulo, livro, contexto histórico-cultural).\n3. Interpretar as passagens obscuras à luz das passagens claras.'
  },
  {
    id: 'f4',
    name: 'Ficha_de_Acompanhamento_Discipulado.docx',
    category: 'documentos',
    size: '45 KB',
    uploadDate: '20/06/2026',
    author: 'João',
    content: 'Ficha cadastral e de acompanhamento dos novos convertidos, tópicos de oração semanais, metas de leitura compartilhada e diário de crescimento espiritual.'
  }
];
