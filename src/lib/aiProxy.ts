/**
 * aiProxy — substituto do SDK @google/generative-ai no CLIENTE.
 *
 * Expõe a mesma interface que o código já usava (getGenerativeModel →
 * generateContent / startChat → sendMessage), mas as chamadas vão para
 * /api/ai-proxy, onde a chave do Gemini vive no servidor.
 *
 * Uso (troca de 1 linha nas páginas):
 *   - antes:  const genAI = new GoogleGenerativeAI(API_KEY);
 *   - agora:  const genAI = createAI();
 */

type Part = { text?: string; inlineData?: { mimeType: string; data: string } };
type Content = { role?: string; parts: Part[] };
type PromptInput = string | Part[] | Content[];

interface ModelOptions {
    model: string;
    systemInstruction?: string | { parts: Part[] };
    generationConfig?: Record<string, unknown>;
    tools?: unknown[];
}

interface AIResponse {
    response: {
        text: () => string;
        /** Resposta crua do Gemini, para casos que precisam de mais que texto. */
        raw?: unknown;
    };
}

/** Normaliza string | Part[] | Content[] para o formato `contents` da API REST. */
function toContents(input: PromptInput): Content[] {
    if (typeof input === 'string') return [{ role: 'user', parts: [{ text: input }] }];
    if (!Array.isArray(input) || input.length === 0) return [{ role: 'user', parts: [] }];
    // Já é Content[] (tem `parts`)?
    if (typeof input[0] === 'object' && input[0] !== null && 'parts' in (input[0] as object)) {
        return input as Content[];
    }
    // É Part[] → embrulha numa mensagem de usuário
    return [{ role: 'user', parts: input as Part[] }];
}

async function callProxy(body: Record<string, unknown>): Promise<AIResponse> {
    const res = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Falha na chamada da IA');
    const text: string = data.text || '';
    return { response: { text: () => text, raw: data.raw } };
}

export function createAI() {
    return {
        getGenerativeModel(opts: ModelOptions) {
            const { model, systemInstruction, generationConfig, tools } = opts;

            return {
                async generateContent(input: PromptInput): Promise<AIResponse> {
                    return callProxy({
                        model,
                        contents: toContents(input),
                        systemInstruction,
                        generationConfig,
                        tools,
                    });
                },

                /** Chat com histórico mantido no cliente (enviado a cada mensagem). */
                startChat(cfg?: { history?: Content[] }) {
                    const history: Content[] = [...(cfg?.history || [])];
                    return {
                        async sendMessage(input: PromptInput): Promise<AIResponse> {
                            const userTurn: Content = { role: 'user', parts: toContents(input)[0].parts };
                            const contents = [...history, userTurn];

                            const result = await callProxy({
                                model,
                                contents,
                                systemInstruction,
                                generationConfig,
                                tools,
                            });

                            // mantém o histórico coerente para a próxima mensagem
                            history.push(userTurn);
                            history.push({ role: 'model', parts: [{ text: result.response.text() }] });

                            return result;
                        },
                        getHistory: () => history,
                    };
                },
            };
        },
    };
}

export default createAI;
