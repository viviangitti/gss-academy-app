// A CARTA COMERCIAL VIRA UMA FOLHA POR MODELO, SOZINHA.
//
// A carta da Omoda & Jaecoo chega uma vez por mês, com oito páginas: uma por
// linha de produto, mais o upgrade e as regras gerais. Publicar isso como um
// PDF único obriga o vendedor a rolar oito páginas com o cliente esperando —
// e publicar página por página obriga a gerência a recortar, exportar e subir
// sete vezes. Ninguém faz isso todo mês. Na terceira vez sobe o PDF inteiro.
//
// Então o app faz o corte: lê o PDF, transforma cada página numa folha e
// sugere o título a partir do que está escrito nela ("LINHA OMODA 5"). Quem
// publica confere e ajusta antes de mandar — o corte é automático, a decisão
// não é.
//
// E TAPA O REBATE DA REDE.
//
// A folha original mostra, embaixo de cada opção, quanto a concessionária
// ganha nela. Isso não pode estar na tela de quem está em pé ao lado do
// cliente: basta ele olhar o celular junto. O rebate é apagado da IMAGEM aqui,
// pelas coordenadas do próprio PDF — nenhum número é redigitado, e por isso
// nenhum número pode sair errado. O que este arquivo faz é esconder, nunca
// reescrever.
import type { BrandId } from './brands';

export interface PaginaCarta {
  n: number;
  titulo: string;
  categoria: 'veiculo' | 'acessorio';
  arquivo: string;
  bytes: number;
  /** Quantos blocos de rebate foram cobertos — a tela mostra pra dar confiança. */
  rebates: number;
  incluir: boolean;
}

// Até onde procurar o valor do rebate abaixo do rótulo, em pontos de PDF.
// Na carta VEN062/2026 ele cai 60 pontos; 160 dá folga sem alcançar o bloco de
// baixo, que está a 250.
const ALCANCE_REBATE = 160;
const ACIMA_REBATE = 26;   // sobe o suficiente pra cobrir o próprio rótulo
const SOBRA_REBATE = 12;   // desce um pouco além da última cifra

/**
 * O "R$" sozinho — é ele que diz até onde o bloco de rebate desce.
 *
 * Ancorar em qualquer número não funciona, e não por pouco: o "7" de
 * "OMODA 7 PRESTIGE" caía dentro da janela de busca e esticava a faixa até o
 * título do bloco seguinte, apagando o nome da versão. O "+" fazia pior — ele
 * também aparece em "BÔNUS VAREJO R$ 10.000 + OPÇÕES", e a faixa comia o bônus
 * varejo, que é justamente o número que o vendedor PRECISA ver.
 *
 * Na folha da montadora todo valor de rebate vem com "R$" na frente, e "R$" não
 * aparece em título de versão. O número fica na mesma linha do "R$", então
 * cobrir a linha cobre os dois.
 */
const CIFRA = /^R\$$/;

/** Distância máxima entre duas cifras do MESMO bloco, em pontos de PDF. */
const PULO_MAXIMO = 60;

const MODELOS: Array<[RegExp, string]> = [
  [/LINHA\s+OMODA\s*E\s*5|OMODA\s*E5/i, 'Omoda E5'],
  [/LINHA\s+OMODA\s*7|OMODA\s*7\s+(LUXURY|PRESTIGE)/i, 'Omoda 7'],
  [/LINHA\s+OMODA\s*5|OMODA\s*5\s+(LUXURY|PRESTIGE)/i, 'Omoda 5'],
  [/LINHA\s+JAECOO\s*7|JAECOO\s*7\s+(ELITE|LUXURY|PRESTIGE)/i, 'Jaecoo 7'],
];

/**
 * O vocabulário de acessório — o que separa a folha do carro da arte do kit.
 *
 * Fica aqui e é exportado porque as DUAS portas de publicação usam o mesmo
 * julgamento: a carta de várias páginas lê o texto de cada página, e o print
 * solto (que é como a arte de kit chega, sem camada de texto) é julgado pelo
 * título e pelo nome do arquivo. Duas listas diferentes de palavras seria a
 * mesma peça caindo em prateleiras diferentes conforme o caminho.
 */
const ACESSORIO = /kit\b|pel[íi]cula|vitrifica|PPF|acess[óo]rio|insulfilm|engate|som\b|protec|prote[çc][ãa]o|estribo|calha|tapete|rack|capa\b/i;

/** Linha de produto da montadora — carro, não acessório. */
const LINHA_CARRO = /LINHA\s+(OMODA|JAECOO)/i;

/**
 * Isto aqui é condição de acessório?
 *
 * Devolve `false` na dúvida: cair em Veículos não esconde nada de ninguém, e a
 * lista do carro é a que o vendedor abre primeiro. Quem publica confirma na
 * tela antes de mandar.
 */
export function pareceAcessorio(...textos: Array<string | undefined>): boolean {
  const t = textos.filter(Boolean).join(' ');
  return ACESSORIO.test(t) && !LINHA_CARRO.test(t);
}

/** O título que a folha ganha se ninguém mexer. */
function tituloDaPagina(texto: string, n: number): string {
  // Duas páginas confundem, e cada uma engana pra um lado:
  //
  //   · a do E5 traz "Regras e Condições da opção bônus de emplacamento" no
  //     meio, e uma regra genérica de "regras" roubava o título dela;
  //   · a de condições gerais CITA todos os modelos ("trade-in para Omoda 7
  //     LUXURY e PRESTIGE, Jaecoo 7...") e virava folha do primeiro da lista.
  //
  // Então: o que identifica a página de regras é a assinatura dela — "condições
  // gerais para utilização", "boas vendas" — ou falar de três modelos ao mesmo
  // tempo, que só a página de regras faz.
  const modelosCitados = MODELOS.filter(([re]) => re.test(texto));
  const ehRegras = /CONDI[ÇC][ÕO]ES\s+GERAIS\s+PARA\s+UTILIZA|BOAS\s+VENDAS|COUNTRY\s+DIRECTOR/i.test(texto)
    || modelosCitados.length >= 3;
  if (ehRegras) return 'Regras do trade-in, prazos e condições gerais';

  const modelo = modelosCitados[0];

  if (/UPGRADE/i.test(texto)) {
    const m = texto.match(/(ELITE|LUXURY|PRESTIGE)\s*(?:→|->|»)\s*(?:(?:OMODA|JAECOO)[^A-Za-z]*\d*\s*)?(ELITE|LUXURY|PRESTIGE)/i);
    const carro = modelo ? `${modelo[1]} ` : '';
    return m ? `Upgrade · ${carro}${m[1].toUpperCase()} → ${m[2].toUpperCase()}` : 'Oportunidade de upgrade';
  }

  if (modelo) {
    const nome = modelo[1];
    const versoes = ['ELITE', 'LUXURY', 'PRESTIGE'].filter((v) =>
      new RegExp(`${nome.replace(/\s/g, '\\s*')}\\s+${v}`, 'i').test(texto));
    return versoes.length ? `${nome} — ${versoes.join(' e ')}` : nome;
  }

  return `Página ${n}`;
}

/**
 * Corta o PDF em folhas.
 *
 * Devolve lista vazia quando não é PDF ou quando o arquivo não abre — quem
 * chama volta pro caminho normal, de uma condição só.
 */
export async function lerCarta(f: File, _brand?: BrandId): Promise<PaginaCarta[]> {
  const ehPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
  if (!ehPdf) return [];

  // pdf.js só entra na tela de quem publica, e só quando o arquivo é PDF: são
  // mais de 1 MB de biblioteca, e o vendedor no showroom não pode pagar por
  // isso no carregamento do app.
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const doc = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
  const paginas: PaginaCarta[] = [];

  for (let n = 1; n <= doc.numPages; n += 1) {
    const pg = await doc.getPage(n);
    const base = pg.getViewport({ scale: 1 });
    // 1080 px de largura: é o que a tela do celular usa com zoom, e o que
    // mantém a folha abaixo do teto de 1 MB do Firestore.
    const escala = 1080 / base.width;
    const vp = pg.getViewport({ scale: escala });

    const cv = document.createElement('canvas');
    cv.width = Math.round(vp.width);
    cv.height = Math.round(vp.height);
    const ctx = cv.getContext('2d');
    if (!ctx) continue;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const tarefa = pg.render({ canvas: cv, canvasContext: ctx, viewport: vp });
    // O pdf.js desenha em pedaços e agenda cada pedaço com requestAnimationFrame.
    // rAF NÃO DISPARA em aba escondida — e o gestor sobe a carta pelo celular,
    // onde sair do app pra ver uma mensagem é o normal. Sem isto, o trabalho
    // congela em 0% e volta só quando a pessoa reabre o app; com oito páginas,
    // ela desiste antes. Desligado, a mesma página desenha em 28 ms.
    //
    // É campo interno do pdf.js, então mexo com cuidado: se um dia sumir, o
    // caminho normal continua funcionando com a aba aberta.
    const interno = (tarefa as unknown as { _internalRenderTask?: { _useRequestAnimationFrame?: boolean } })._internalRenderTask;
    if (interno && '_useRequestAnimationFrame' in interno) interno._useRequestAnimationFrame = false;
    await tarefa.promise;

    // ---- texto: título sugerido e onde está o rebate ----
    let texto = '';
    // Cada item com a linha de base já convertida pra pixel do canvas.
    const itens: Array<{ s: string; y: number }> = [];
    try {
      const tc = await pg.getTextContent();
      for (const it of tc.items as Array<{ str?: string; transform?: number[] }>) {
        const str = it.str || '';
        texto += str + ' ';
        if (it.transform) itens.push({ s: str.trim(), y: cv.height - it.transform[5] * escala });
      }
    } catch {
      /* PDF sem camada de texto (print escaneado): segue sem título nem tapa */
    }

    // ---- onde está o rebate ----
    //
    // Não basta achar a palavra: na página de regras gerais ela aparece no meio
    // de um parágrafo ("Obs.: O Rebate Rede do plano de financiamento subsidiado
    // é fixo..."), e tapar ali apagaria um parágrafo inteiro das regras. O que
    // define o BLOCO é ter cifra logo abaixo do rótulo.
    //
    // E a faixa termina na última cifra do bloco, não numa altura fixa: na
    // página do E5 o "OU" da segunda oferta começa 8 pontos depois do fim do
    // rebate, e uma faixa de altura fixa comia ele.
    const faixas: Array<{ topo: number; alt: number }> = [];
    for (const it of itens) {
      if (!/rebate/i.test(it.s)) continue;
      if (faixas.some((f) => Math.abs(f.topo + ACIMA_REBATE * escala - it.y) < 6 * escala)) continue;
      const cifras = itens.filter(
        (o) => o.y > it.y + 2 * escala && o.y <= it.y + ALCANCE_REBATE * escala && CIFRA.test(o.s),
      );
      if (!cifras.length) continue; // é a palavra no meio de um texto, não o bloco
      // Desce cifra por cifra e para no primeiro buraco: a faixa termina onde o
      // bloco termina, não onde está o número mais baixo que por acaso caiu na
      // janela de busca.
      let fim = 0;
      for (const y of cifras.map((o) => o.y).sort((a, b) => a - b)) {
        if (fim && y - fim > PULO_MAXIMO * escala) break;
        fim = y;
      }
      const fundo = fim + SOBRA_REBATE * escala;
      const topo = Math.max(0, it.y - ACIMA_REBATE * escala);
      faixas.push({ topo, alt: Math.min(cv.height - topo, fundo - topo) });
    }

    // ---- tapa ----
    // Faixa de largura inteira: na carta as três opções trazem o rebate na
    // MESMA altura, então uma faixa resolve as três de uma vez e não depende de
    // acertar a coluna.
    for (const f of faixas) {
      ctx.fillStyle = '#eef1f3';
      ctx.fillRect(0, f.topo, cv.width, f.alt);
      ctx.fillStyle = '#8f989f';
      ctx.font = `600 ${Math.round(15 * escala)}px "Public Sans", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('rebate da rede — oculto no app', cv.width / 2, f.topo + f.alt / 2);
      ctx.textAlign = 'start';
    }

    let arquivo = '';
    for (const q of [0.9, 0.84, 0.76, 0.68, 0.58]) {
      arquivo = cv.toDataURL('image/jpeg', q);
      if (arquivo.length <= 900 * 1024) break;
    }

    paginas.push({
      n,
      titulo: tituloDaPagina(texto, n),
      categoria: pareceAcessorio(texto) ? 'acessorio' : 'veiculo',
      arquivo,
      bytes: arquivo.length,
      rebates: faixas.length,
      // Página sem modelo reconhecido quase sempre é capa ou verso: entra
      // desmarcada, pra ninguém publicar sete folhas e uma capa em branco.
      incluir: !/^Página \d+$/.test(tituloDaPagina(texto, n)),
    });
  }
  return paginas;
}
