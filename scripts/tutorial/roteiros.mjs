// OS DOIS ROTEIROS.
//
// Regras que valem pros dois: fala de quem vende, não de quem programa; cada
// cena responde "pra que isso serve pra mim"; e nada de tela que o time não vai
// usar. O do gerente tem a parte que a Vivian pediu por nome — onde sobe
// produto novo e como edita.
const clic = (sel, n = 0) => `[...document.querySelectorAll(${JSON.stringify(sel)})][${n}]?.click()`;
const clicTexto = (sel, txt) => `[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>e.textContent.includes(${JSON.stringify(txt)}))?.click()`;

export const VENDEDOR = [
  { id: '01-abre', url: '/eleva', espera: 2600,
    fala: 'O Eleva coloca o produto na mão de quem vende: um vídeo curto, a resposta pronta para cada objeção, e a mensagem para mandar na hora. Vamos ver.' },
  { id: '02-hoje', foco: `[...document.querySelectorAll('*')].find(e=>/Primeiros passos/.test(e.textContent)&&e.children.length<6)`, url: '/eleva', espera: 1800,
    acao: `document.querySelector('.wp-hoje-passos, .wp-hj-passos, [class*=passos]')?.scrollIntoView({block:'center'})`,
    fala: 'A tela de início mostra o que fazer hoje: os primeiros passos, os carros novos e o seu lugar no ranking. Não é enfeite, é a sua sequência.' },
  { id: '03-catalogo', foco: `document.querySelector('.wp-card')`, url: '/eleva/catalogo', espera: 2200,
    fala: 'No Catálogo estão os carros e, embaixo deles, os acessórios. Toque num carro.' },
  { id: '04-carro', foco: `document.querySelector('.wp-reel')`, url: '/eleva/produto/omoda-5-shs-h', espera: 2600,
    fala: 'Dentro do carro você tem a pílula de trinta segundos, o que destacar, e o que responder quando o cliente travar.' },
  { id: '05-niveis', foco: `document.querySelector('.wp-niveis')`, url: '/eleva/produto/omoda-5-shs-h', espera: 1600,
    acao: `[...document.querySelectorAll('.wp-nivel')].find(b=>/Nível 3/.test(b.textContent))?.click(); await new Promise(r=>setTimeout(r,900)); document.querySelector('.wp-niveis')?.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'Os níveis vão do essencial até negociação difícil. Cada um abre depois que você acerta o quiz do anterior — é assim que você sobe de verdade, e não só assiste.' },
  { id: '06-versoes', foco: `document.querySelector('.wp-vers')`, url: '/eleva/produto/omoda-5-shs-h', espera: 1400,
    acao: `const v=document.querySelector('.wp-vers'); v?.scrollIntoView({block:'start'}); window.scrollBy(0,-70); await new Promise(r=>setTimeout(r,500)); [...v.querySelectorAll('.wp-vers-cab')][1]?.click(); await new Promise(r=>setTimeout(r,900)); v.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'Mais abaixo: como abordar, pra que cliente é, e a quebra de objeção já escrita. E ali em cima, Versões, que responde a pergunta que o cliente sempre faz: e a de cima, o que muda?' },
  { id: '07-ficha', foco: `(()=>{const a=[...document.querySelectorAll('*')].filter(e=>(e.textContent||'').trim().startsWith("Ficha técnica")); const el=a[a.length-1]; return (el&&el.getBoundingClientRect().height>6)?el:null;})()`, url: '/eleva/produto/omoda-5-shs-h', espera: 1800,
    acao: `const t=[...document.querySelectorAll('summary,button,.wp-vers-tit,[class*=ficha]')].find(e=>/^\\s*Ficha técnica/.test(e.textContent||'')); t?.click(); await new Promise(r=>setTimeout(r,900)); t?.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'A ficha técnica fica aqui, linha por linha, pra você achar um número em dois segundos com o cliente do lado. E o que vai pro WhatsApp dele é a folha oficial da montadora, em PDF, com o nome em caixa alta.' },
  { id: '08-acessorio', foco: `document.querySelector('.wp-acp-preco')?.parentElement`, url: '/eleva/acessorio/estribo-iluminado', espera: 2400,
    fala: 'Acessório tem tela própria: o que resolve pro cliente, a hora certa de oferecer, e o código pra pedir no sistema. Toque no código que ele copia.' },
  { id: '09-condicoes', foco: `document.querySelector('.wp-cond-portas')`, url: '/eleva/ofertas', espera: 2400,
    fala: 'Condições comerciais entram por três portas. Veículos, para a negociação do carro. Acessórios, para depois do sim. E campanhas da casa, que é o que você disputa.' },
  { id: '10-veiculos', foco: `document.querySelector('.wp-cond-val')`, url: '/eleva/ofertas', espera: 1600,
    acao: clicTexto('.wp-cond-porta', 'Veículos'),
    fala: 'Cada carta é uma folha. Confira a validade antes de falar número com o cliente — ela sai sozinha quando vence.' },
  { id: '11-folha', foco: `document.querySelector('.wp-cond-lb img')`, url: '/eleva/ofertas', espera: 2200,
    acao: `${clicTexto('.wp-cond-porta', 'Veículos')}; await new Promise(r=>setTimeout(r,1600)); const card=[...document.querySelectorAll('.wp-cond-card')].find(x=>/OMODA 5/.test(x.textContent)); card?.querySelector('.wp-cond-thumb')?.click()`,
    fala: 'A folha abre em tela cheia e amplia com dois dedos. Esta folha é interna: você passa o número pro cliente, nunca a folha.' },
  { id: '12-arte', foco: `document.querySelector('.wp-arte-btn-main')`, url: '/eleva/ofertas', espera: 2600,
    acao: `${clicTexto('.wp-cond-porta', 'Veículos')}; await new Promise(r=>setTimeout(r,1400)); const card=[...document.querySelectorAll('.wp-cond-card')].find(x=>/OMODA 5/.test(x.textContent)); card?.querySelector('.wp-cond-arte')?.click(); await new Promise(r=>setTimeout(r,1800))`,
    fala: 'O que vai pro cliente é isto: a arte da oferta, com o carro e a chamada aprovada. Um toque em enviar e ela vai no WhatsApp.' },
  { id: '13-ia', foco: `document.querySelector('.wp-ia-sug') || document.querySelector('.wp-ia-thread')`, url: '/eleva/assistente', espera: 2200,
    fala: 'O Tira-dúvida sabe tudo que está no app: os carros, os acessórios com preço, e as condições do mês com os números. Pergunte como você falaria com um colega.' },
  { id: '14-ia-resposta', foco: `document.querySelector('.wp-ia-retomada')`, url: '/eleva/assistente', espera: 2600,
    acao: `document.querySelector('.wp-ia-thread')?.scrollIntoView({block:'start'})`,
    fala: 'Ele responde com o que está publicado — o número da carta do mês, não um chute. E a conversa continua de onde você parou quando o cliente te interromper.' },
  { id: '15-noticias', foco: `document.querySelector('.wp-news-frentes')`, url: '/eleva/noticias', espera: 3000,
    fala: 'Em Notícias, repare nas abas de cima. Além de Tudo, tem Concorrência e Mercado — e arrastando para o lado, Lançamentos, Condições, e Elétricos e híbridos. São seis frentes.' },
  { id: '15b-concorrencia', url: '/eleva/noticias', espera: 3000,
    acao: `[...document.querySelectorAll('.wp-news-frentes button, .wp-news-frentes a')].find(b=>/Concorr/.test(b.textContent))?.click(); await new Promise(r=>setTimeout(r,3200)); window.scrollTo(0,0)`,
    foco: `document.querySelector('.wp-news-frentes')`,
    fala: 'Concorrência é a que muda uma conversa: traz o que o GWM, a BYD, o Compass e o Corolla Cross anunciaram. É com isso que o cliente chega comparando.' },
  // TRANSFORMAR EM APP. Os dois primeiros passos não são tela do app — são do
  // Safari — então vêm desenhados (ver ilustra.py). O terceiro mostra o ícone
  // real na tela de início.
  { id: '17-instalar', url: '/eleva/perfil', espera: 3200,
    // UA de iPhone: sem isso o cartão mostra o texto do Android ("Instalar
    // agora"), e o time é de iPhone. A instrução na tela tem que ser a que a
    // pessoa vai seguir.
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    acao: `await new Promise(r=>setTimeout(r,1200)); const el=document.querySelector(".wp-perfil-instalar"); el?.scrollIntoView({block:"center"}); await new Promise(r=>setTimeout(r,600))`,
    foco: `document.querySelector('.wp-perfil-instalar')`,
    fala: 'Antes de terminar: transforme o Eleva em aplicativo no seu celular. A instrução está dentro do app, em Perfil. São três passos, e leva dez segundos.' },
  { id: '18-instalar-1', ilustracao: 'ilustracoes/inst-1.png',
    fala: 'Passo um: no Safari, toque em Compartilhar. É o quadrado com a seta para cima, na barra de baixo do navegador.' },
  { id: '19-instalar-2', ilustracao: 'ilustracoes/inst-2.png',
    fala: 'Passo dois: desça a lista e escolha Adicionar à Tela de Início. Precisa ser pelo Safari — se você abriu por dentro do WhatsApp, essa opção não aparece.' },
  { id: '20-instalar-3', ilustracao: 'ilustracoes/inst-3.png',
    fala: 'Pronto. O Eleva vira um ícone na tela do seu celular e abre em tela cheia, sem você procurar a aba no meio das outras.' },

  { id: '16-fim', foco: `(()=>{const a=[...document.querySelectorAll('*')].filter(e=>(e.textContent||'').trim().startsWith("SEU WHATSAPP")); const el=a[a.length-1]; return (el&&el.getBoundingClientRect().height>6)?el:null;})()`, url: '/eleva/perfil', espera: 2200,
    fala: 'E no Perfil você confere a versão do app e instala ele na tela de início do celular. É isso: antes de cada atendimento, uma pílula, a condição do dia e a resposta pronta. Boa venda.' },
];

export const GERENTE = [
  { id: '01-abre', url: '/eleva/gestor', espera: 2600,
    fala: 'Este é o Painel do gestor. Daqui você vê o time, publica o conteúdo e mantém a tabela do mês. O que você publica aqui aparece no celular do time na hora.' },
  { id: '02-resultados', url: '/eleva/gestor', espera: 3200,
    // A ABA PRECISA APARECER SELECIONADA. Antes eu rolava direto pro ranking e
    // a barra de abas saía da tela: a voz dizia "a aba Resultados" e não havia
    // aba nenhuma no quadro — parecia que não tinha nada ali embaixo.
    acao: `[...document.querySelectorAll('.wp-gz-tab')].find(e=>/Resultados/.test(e.textContent))?.click(); await new Promise(r=>setTimeout(r,900)); document.querySelector('.wp-gz-tabs')?.scrollIntoView({block:'start'}); window.scrollBy(0,-80)`,
    foco: `document.querySelector('.wp-gz-tabs')`,
    fala: 'O Painel tem duas abas. A primeira, Resultados, mostra quantas pessoas usaram o app no mês, quantos vídeos o time assistiu e como isso evoluiu mês a mês.' },
  { id: '02b-ranking', url: '/eleva/gestor', espera: 3200,
    acao: `await new Promise(r=>setTimeout(r,1200)); [...document.querySelectorAll('.wp-gz-top-head')].find(e=>/dedica no mês/.test(e.textContent))?.closest('.wp-gz-top')?.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    foco: `[...document.querySelectorAll('.wp-gz-top-head')].find(e=>/dedica no mês/.test(e.textContent))?.closest('.wp-gz-top')`,
    fala: 'Descendo nessa mesma aba: quem mais se dedica no mês, quantas pílulas cada um assistiu e quantos carros já domina. É por aqui que você vê com quem sentar.' },
  { id: '03-conteudo', foco: `[...document.querySelectorAll('.wp-gz-tab')].find(e=>/Conteúdo/.test(e.textContent))`, url: '/eleva/gestor', espera: 2000,
    acao: clicTexto('.wp-gz-tab', 'Conteúdo'),
    fala: 'Na aba Conteúdo está o resto. Vamos pela ordem em que você vai usar.' },
  { id: '04-novo-carro', foco: `[...document.querySelectorAll('.wp-gz-add')].find(e=>/Novo item/.test(e.textContent))`, url: '/eleva/gestor', espera: 2400,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,800)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Carros \\(/.test(x.textContent)); b.scrollIntoView({block:'start'}); window.scrollBy(0,-70); b.querySelector('.wp-gz-add').click()`,
    fala: 'Carro novo entra aqui, em Novo item. Nome, o que trava a venda, o que é o carro, os pontos fortes e a frase de fechamento. O vídeo pode ser um MP4 ou o link de um reel.' },
  { id: '05-editar-carro', foco: `document.querySelector('.wp-videdit-toggle')`, url: '/eleva/produto/omoda-5-shs-h', espera: 2200,
    acao: `const t=document.querySelector('.wp-videdit-toggle'); t?.scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,500)); t?.click(); await new Promise(r=>setTimeout(r,1100)); t?.scrollIntoView({block:'start'}); window.scrollBy(0,-80)`,
    fala: 'Para editar um carro que já existe, abra ele e toque em Trocar o vídeo daqui. É onde ficam o vídeo padrão, o vídeo de cada público e a foto de capa.' },
  { id: '06-niveis-video', foco: `[...document.querySelectorAll('.wp-videdit-now')].find(e=>/cada nível/.test(e.textContent))`, url: '/eleva/produto/omoda-5-shs-h', espera: 2600,
    acao: `${clic('.wp-videdit-toggle')}; await new Promise(r=>setTimeout(r,900)); [...document.querySelectorAll('.wp-videdit-now')].find(e=>/cada nível/.test(e.textContent))?.scrollIntoView({block:'center'})`,
    fala: 'E aqui embaixo, o vídeo de cada nível da trilha. Cada carro tem seis episódios, e cada um tem o arquivo dele. O que ainda não foi gravado roda o roteiro animado daquele nível.' },
  { id: '07-acessorios', foco: `(()=>{const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Acessórios \\(/.test(x.textContent)); return b?.querySelector('.wp-gz-help')||null;})()`, url: '/eleva/gestor', espera: 2400,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,800)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Acessórios \\(/.test(x.textContent)); b.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'Os acessórios ficam aqui. No acesso de gerente de vendas esta lista é de consulta: quem mantém a tabela é o supervisor e o gerente de acessórios. Vale conhecer a tela deles, que vem agora.' },
  { id: '08-edita-acessorio', usuario: { uid: 's', name: 'Silmara Souza', email: 'silmara.ccrgerente@lincetoyota.com', role: 'gestor', brands: ['ramasa'], cargo: 'gerente-acessorios' }, foco: `document.querySelector('.wp-gz-acform')`, url: '/eleva/gestor', espera: 2600,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,800)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Acessórios \\(/.test(x.textContent)); b.querySelector('[title="Editar nome e textos"]').click(); await new Promise(r=>setTimeout(r,600)); b.querySelector('.wp-gz-acform').scrollIntoView({block:'center'})`,
    fala: 'Na tela de quem mantém a tabela, o lápis corrige o que o time lê: o nome, o que resolve pro cliente, como oferecer e de onde vem a peça. As setas arrumam a ordem da vitrine e a lixeira tira de cartaz sem apagar. O preço fica de fora daqui de propósito: ele tem um lugar só, no toque em cima do valor.' },
  { id: '09-novo-acessorio', usuario: { uid: 's', name: 'Silmara Souza', email: 'silmara.ccrgerente@lincetoyota.com', role: 'gestor', brands: ['ramasa'], cargo: 'gerente-acessorios' }, foco: `document.querySelector('.wp-gz-carros')`, url: '/eleva/gestor', espera: 2600,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,800)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Acessórios \\(/.test(x.textContent)); b.querySelector('.wp-gz-add').click(); await new Promise(r=>setTimeout(r,600)); b.querySelector('.wp-gz-acform').scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'E acessório novo entra em Novo acessório. Marque em quais carros ele entra: é isso que faz ele aparecer dentro do modelo, que é onde acessório se vende. Depois abra ele no catálogo e suba a foto.' },
  { id: '10-condicoes', foco: `[...document.querySelectorAll('.wp-gz-add')].find(e=>/Subir tabela/.test(e.textContent))`, url: '/eleva/gestor', espera: 2400,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,800)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Condições comerciais/.test(x.textContent)); b.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'A carta do mês sobe em Subir tabela. Você joga o PDF inteiro, e o app separa uma condição por página, com o título já sugerido pelo modelo.' },
  { id: '11-editar-cond', foco: `document.querySelector('.wp-gz-virada')`, url: '/eleva/gestor', espera: 2600,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,800)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Condições comerciais/.test(x.textContent)); b.querySelector('[title="Editar"]').click(); await new Promise(r=>setTimeout(r,700)); b.querySelector('.wp-gz-form').scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'No lápis você corrige sem apagar. E tem um botão que evita o esquecimento do mês: até a virada do mês marca o dia em que ela sai sozinha, pulando fim de semana e feriado.' },
  { id: '12-ia-le', foco: `[...document.querySelectorAll('.wp-gz-avancado')].find(e=>/IA lê/.test(e.textContent))`, url: '/eleva/gestor', espera: 2600,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,800)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Condições comerciais/.test(x.textContent)); b.querySelector('[title="Editar"]').click(); await new Promise(r=>setTimeout(r,700)); const d=[...document.querySelectorAll('.wp-gz-avancado')].find(x=>/IA lê/.test(x.textContent)); d.open=true; d.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'Esta parte é importante. A folha é imagem, e a inteligência artificial não enxerga imagem: ela responde a partir deste texto. Se o Tira-dúvida falar um número que não bate com a folha, é aqui que se corrige.' },
  { id: '13-arte', foco: `[...document.querySelectorAll('.wp-gz-avancado')].find(e=>/Arte para o cliente/.test(e.textContent))`, url: '/eleva/gestor', espera: 2600,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,900)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Condições comerciais/.test(x.textContent)); const alvo=[...b.querySelectorAll('.wp-gz-item')].find(x=>/OMODA 5/.test(x.textContent)); alvo.querySelector('[title="Editar"]').click(); await new Promise(r=>setTimeout(r,1000)); const d=[...document.querySelectorAll('.wp-gz-avancado')].find(x=>/Arte para o cliente/.test(x.textContent)); d.open=true; d.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'E aqui você libera a arte que o vendedor manda pro cliente. Você escreve uma vez a frase que pode ser anunciada, e o time inteiro manda a mesma coisa. Entrada, bônus de troca e rebate não entram nessa peça.' },
  { id: '14-documentos', foco: `[...document.querySelectorAll('.wp-gz-add')].find(e=>/Publicar/.test(e.textContent))`, url: '/eleva/gestor', espera: 2400,
    acao: `${clicTexto('.wp-gz-tab', 'Conteúdo')}; await new Promise(r=>setTimeout(r,800)); const b=[...document.querySelectorAll('.wp-gz-block')].find(x=>/Documentos da marca/.test(x.textContent)); b.scrollIntoView({block:'start'}); window.scrollBy(0,-70)`,
    fala: 'Em Documentos você sobe PDF novo e tira do ar o que venceu. O que está marcado como interno o app nunca oferece pra encaminhar.' },
  { id: '15-ver-como-time', foco: `[...document.querySelectorAll('.wp-nav-item')].find(e=>/Ver como time/.test(e.textContent))`, url: '/eleva/catalogo', espera: 2400,
    fala: 'E a aba Ver como time mostra o app exatamente como o vendedor vê. Antes de cobrar, confira aqui se o que você publicou chegou.' },
  // TRANSFORMAR EM APP. Os dois primeiros passos não são tela do app — são do
  // Safari — então vêm desenhados (ver ilustra.py). O terceiro mostra o ícone
  // real na tela de início.
  { id: '17-instalar', url: '/eleva/perfil', espera: 2400,
    // UA de iPhone: sem isso o cartão mostra o texto do Android ("Instalar
    // agora"), e o time é de iPhone. A instrução na tela tem que ser a que a
    // pessoa vai seguir.
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    acao: `const c=[...document.querySelectorAll('*')].find(e=>/Deixe o Eleva na tela do celular/.test(e.textContent||'')&&e.children.length<5); c?.closest('div')?.scrollIntoView({block:'center'})`,
    foco: `document.querySelector('.wp-perfil-instalar')`,
    fala: 'Antes de terminar: transforme o Eleva em aplicativo no seu celular. A instrução está dentro do app, em Perfil. São três passos, e leva dez segundos.' },
  { id: '18-instalar-1', ilustracao: 'ilustracoes/inst-1.png',
    fala: 'Passo um: no Safari, toque em Compartilhar. É o quadrado com a seta para cima, na barra de baixo do navegador.' },
  { id: '19-instalar-2', ilustracao: 'ilustracoes/inst-2.png',
    fala: 'Passo dois: desça a lista e escolha Adicionar à Tela de Início. Precisa ser pelo Safari — se você abriu por dentro do WhatsApp, essa opção não aparece.' },
  { id: '20-instalar-3', ilustracao: 'ilustracoes/inst-3.png',
    fala: 'Pronto. O Eleva vira um ícone na tela do seu celular e abre em tela cheia, sem você procurar a aba no meio das outras.' },

  { id: '16-fim', url: '/eleva/gestor', espera: 2200,
    fala: 'Resumo: carro e acessório novos entram na aba Conteúdo. Preço e texto se corrigem na linha. A carta do mês sobe inteira e sai sozinha. E o que a inteligência artificial responde, você confere e corrige.' },
];
