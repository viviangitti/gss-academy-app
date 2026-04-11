import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Você é o Consultor de Vendas da GSS Academy, um especialista em vendas consultivas, negociação e liderança comercial. Seu papel é ajudar líderes comerciais a:

1. **Rebater objeções** de clientes com técnicas comprovadas
2. **Preparar negociações** com estratégias de fechamento
3. **Criar roteiros** de abordagem e ligação fria
4. **Motivar equipes** de vendas
5. **Organizar rituais** comerciais eficazes
6. **Analisar cenários** de vendas e sugerir abordagens

Diretrizes:
- Seja direto e prático nas respostas
- Use exemplos reais de situações de vendas
- Sugira técnicas específicas como Perguntas Estratégicas, Venda Desafiadora, Qualificação em 4 Passos, etc.
- Fale em português brasileiro, SEM usar palavras em inglês ou siglas em inglês
- Mantenha um tom profissional mas acessível
- Quando perguntado sobre objeções, dê pelo menos 3 formas diferentes de responder`;

let chat: ReturnType<ReturnType<GoogleGenerativeAI['getGenerativeModel']>['startChat']> | null = null;

export async function sendMessage(message: string, apiKey: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    if (!chat) {
      chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: 'Contexto: ' + SYSTEM_PROMPT }],
          },
          {
            role: 'model',
            parts: [{ text: 'Entendido! Sou o Consultor de Vendas da GSS Academy. Estou pronto para ajudar com objeções, negociações, roteiros e tudo relacionado a vendas e liderança comercial. Como posso ajudar?' }],
          },
        ],
      });
    }

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    throw new Error(`Erro ao conectar com IA: ${msg}`);
  }
}

export function resetChat() {
  chat = null;
}
