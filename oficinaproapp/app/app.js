/* Oficina Pro — MVP funcional
   Persistência local (localStorage). Sem backend nesta versão.
   FISCAL: emissão de NFS-e é SIMULADA — integração real exige Emissor Nacional + certificado digital.
   CATÁLOGO: dados de exemplo — integração real (Fraga) é comercial.
   MULTIAPARELHO: dados vivem só neste navegador — precisa de backend para sincronizar. */

'use strict';

// ---------- ícones ----------
const ICON = {
  wrench: '<svg viewBox="0 0 512 512"><path d="M507 210a12 12 0 00-20-5l-74 73-59-10-10-59 74-74a12 12 0 00-5-20c-64-17-131 1-171 55a139 139 0 00-20 122L18 425a45 45 0 000 64 45 45 0 0064 0l133-133a139 139 0 00122-20c54-40 72-107 55-171z"/></svg>',
  home: '<svg viewBox="0 0 576 512"><path d="M280 5L8 224a16 16 0 0020 25l36-29v212a32 32 0 0032 32h96V352h96v112h96a32 32 0 0032-32V220l36 29a16 16 0 0020-25L296 5a16 16 0 00-16 0z"/></svg>',
  list: '<svg viewBox="0 0 512 512"><path d="M96 96a32 32 0 11-64 0 32 32 0 0164 0zm0 160a32 32 0 11-64 0 32 32 0 0164 0zM64 448a32 32 0 110-64 32 32 0 010 64zM480 80a24 24 0 010 48H176a24 24 0 010-48h304zm0 160a24 24 0 010 48H176a24 24 0 010-48h304zm0 160a24 24 0 010 48H176a24 24 0 010-48h304z"/></svg>',
  plate: '<svg viewBox="0 0 640 512"><path d="M64 96h512a32 32 0 0132 32v256a32 32 0 01-32 32H64a32 32 0 01-32-32V128a32 32 0 0132-32zm40 96v128h48V192h-48zm112 0v128h48V192h-48zm112 0v128h160v-40H400v-16h96v-32h-96v-16h136v-24H328z"/></svg>',
  plus: '<svg viewBox="0 0 448 512"><path d="M256 80a32 32 0 00-64 0v144H48a32 32 0 000 64h144v144a32 32 0 0064 0V288h144a32 32 0 000-64H256V80z"/></svg>',
  wpp: '<svg viewBox="0 0 448 512"><path d="M380 97A221 221 0 0057 365L26 480l118-31a222 222 0 00106 27h1c122 0 224-100 224-222a220 220 0 00-95-157zM224 442a184 184 0 01-94-26l-7-4-70 18 19-68-4-7a184 184 0 01285-228 183 183 0 01-129 315zm101-138c-5-3-33-16-38-18s-9-3-13 3-15 18-18 22-7 4-12 1a151 151 0 01-75-65c-6-10 6-9 16-31 2-3 1-6 0-9s-13-31-18-42-9-9-13-10h-11a21 21 0 00-15 7c-5 6-20 19-20 47s20 54 23 58 40 61 96 85c48 21 58 17 68 16s33-13 37-27 5-25 4-27-4-4-9-6z"/></svg>',
  check: '<svg viewBox="0 0 512 512"><path d="M470 75a32 32 0 010 46L204 387a32 32 0 01-45 0L41 269a32 32 0 0146-45l95 95L425 75a32 32 0 0145 0z"/></svg>',
  checkc: '<svg viewBox="0 0 512 512"><path d="M256 8a248 248 0 100 496 248 248 0 000-496zm137 176L235 342a24 24 0 01-34 0l-79-79a24 24 0 0134-34l62 62 141-141a24 24 0 0134 34z"/></svg>',
  invoice: '<svg viewBox="0 0 384 512"><path d="M64 0a64 64 0 00-64 64v384a64 64 0 0064 64h256a64 64 0 0064-64V160H256a32 32 0 01-32-32V0H64zm192 0v128h128L256 0zM120 240h144a16 16 0 010 32H120a16 16 0 010-32zm0 64h144a16 16 0 010 32H120a16 16 0 010-32z"/></svg>',
  car: '<svg viewBox="0 0 512 512"><path d="M135 117a48 48 0 0145-32h152a48 48 0 0145 32l24 68a64 64 0 0143 60v96a24 24 0 01-24 24h-16a24 24 0 01-24-24v-16H128v16a24 24 0 01-24 24H88a24 24 0 01-24-24v-96a64 64 0 0143-60l28-68zm45 16l-20 55h192l-20-55H180zm-28 143a24 24 0 100-48 24 24 0 000 48zm208 0a24 24 0 100-48 24 24 0 000 48z"/></svg>',
  clock: '<svg viewBox="0 0 512 512"><path d="M256 8a248 248 0 100 496 248 248 0 000-496zm24 248a24 24 0 01-11 20l-80 52a24 24 0 11-26-40l68-44V120a24 24 0 0148 0v136z"/></svg>',
  trash: '<svg viewBox="0 0 448 512"><path d="M135 21a32 32 0 0129-21h72a32 32 0 0129 21l6 11h74a24 24 0 010 48H24a24 24 0 010-48h74l6-11zM32 128h384l-21 320a48 48 0 01-48 45H101a48 48 0 01-48-45L32 128z"/></svg>',
  box: '<svg viewBox="0 0 512 512"><path d="M50 129l190 68V456L58 388a32 32 0 01-20-30V163a55 55 0 0112-34zm412 0a55 55 0 0112 34v195a32 32 0 01-20 30l-182 68V197l190-68zM256 32a55 55 0 0119 3l161 58-84 30-183-66 68-25a55 55 0 0119-0zM73 100l183 66-70 25L36 121z"/></svg>',
  chart: '<svg viewBox="0 0 512 512"><path d="M32 32a16 16 0 0116 16v368h432a16 16 0 010 32H48a48 48 0 01-48-48V48a16 16 0 0116-16zm120 224a24 24 0 0148 0v96a24 24 0 01-48 0v-96zm96-96a24 24 0 0148 0v192a24 24 0 01-48 0V160zm96-64a24 24 0 0148 0v256a24 24 0 01-48 0V96z"/></svg>',
  calendar: '<svg viewBox="0 0 448 512"><path d="M128 0a24 24 0 0124 24v40h144V24a24 24 0 0148 0v40h40a64 64 0 0164 64v320a64 64 0 01-64 64H64a64 64 0 01-64-64V128a64 64 0 0164-64h40V24a24 24 0 0124-24zM48 192v256h352V192H48z"/></svg>',
  cog: '<svg viewBox="0 0 512 512"><path d="M256 0c14 0 27 10 30 24l7 37a176 176 0 0142 24l35-13c14-5 29 1 36 13l32 55c7 12 4 28-7 37l-29 24a178 178 0 010 48l29 24c11 9 14 25 7 37l-32 55c-7 12-22 18-36 13l-35-13a176 176 0 01-42 24l-7 37c-3 14-16 24-30 24h-64c-14 0-27-10-30-24l-7-37a176 176 0 01-42-24l-35 13c-14 5-29-1-36-13L9 336c-7-12-4-28 7-37l29-24a178 178 0 010-48l-29-24c-11-9-14-25-7-37l32-55c7-12 22-18 36-13l35 13a176 176 0 0142-24l7-37c3-14 16-24 30-24h64zM256 176a80 80 0 100 160 80 80 0 000-160z"/></svg>',
  help: '<svg viewBox="0 0 512 512"><path d="M256 8a248 248 0 100 496 248 248 0 000-496zm0 384a28 28 0 110-56 28 28 0 010 56zm44-158c-20 15-28 24-28 42a20 20 0 01-40 0c0-38 24-58 42-71 14-11 20-17 20-31 0-19-16-32-38-32-18 0-30 7-42 22a20 20 0 01-32-24c19-25 42-38 74-38 44 0 78 30 78 72 0 34-22 51-34 60z"/></svg>',
  camera: '<svg viewBox="0 0 512 512"><path d="M149 64a32 32 0 00-27 15l-17 33H48a48 48 0 00-48 48v240a48 48 0 0048 48h416a48 48 0 0048-48V160a48 48 0 00-48-48h-57l-17-33a32 32 0 00-27-15H149zm107 112a112 112 0 110 224 112 112 0 010-224zm0 48a64 64 0 100 128 64 64 0 000-128z"/></svg>',
  dots: '<svg viewBox="0 0 448 512"><path d="M224 160a48 48 0 110 96 48 48 0 010-96zM80 160a48 48 0 110 96 48 48 0 010-96zm288 0a48 48 0 110 96 48 48 0 010-96z"/></svg>',
  money: '<svg viewBox="0 0 512 512"><path d="M0 128a64 64 0 0164-64h384a64 64 0 0164 64v256a64 64 0 01-64 64H64a64 64 0 01-64-64V128zm256 48a80 80 0 100 160 80 80 0 000-160zM96 160a32 32 0 01-32 32v128a32 32 0 0132 32h320a32 32 0 0132-32V192a32 32 0 01-32-32H96z"/></svg>',
  search: '<svg viewBox="0 0 512 512"><path d="M208 48a160 160 0 100 320 160 160 0 000-320zM0 208a208 208 0 11370 130l134 134a24 24 0 01-34 34L336 372A208 208 0 010 208z"/></svg>',
  print: '<svg viewBox="0 0 512 512"><path d="M128 0h256v96H128V0zM96 128h320a96 96 0 0196 96v112a32 32 0 01-32 32h-64v112a32 32 0 01-32 32H128a32 32 0 01-32-32V368H32a32 32 0 01-32-32V224a96 96 0 0196-96zm320 80a24 24 0 100 48 24 24 0 000-48zM144 336v112h224V336H144z"/></svg>',
  edit: '<svg viewBox="0 0 512 512"><path d="M410 30l72 72a24 24 0 010 34L182 436l-108 24a24 24 0 01-29-29l24-108L369 23a24 24 0 0141 7zM120 350l-14 62 62-14 226-226-48-48L120 350z"/></svg>',
  download: '<svg viewBox="0 0 512 512"><path d="M280 24a24 24 0 00-48 0v246l-71-71a24 24 0 00-34 34l112 112a24 24 0 0034 0l112-112a24 24 0 00-34-34l-71 71V24zM64 400a24 24 0 000 48h384a24 24 0 000-48H64z"/></svg>',
  reopen: '<svg viewBox="0 0 512 512"><path d="M48 80a24 24 0 0148 0v54a208 208 0 11-19 148 24 24 0 0145-16 160 160 0 10 14-124H176a24 24 0 010 48H72a24 24 0 01-24-24V80z"/></svg>',
  eye: '<svg viewBox="0 0 576 512"><path d="M288 80c-121 0-215 82-262 176 47 94 141 176 262 176s215-82 262-176C503 162 409 80 288 80zm0 288a112 112 0 110-224 112 112 0 010 224zm0-176a64 64 0 100 128 64 64 0 000-128z"/></svg>',
  eyeOff: '<svg viewBox="0 0 640 512"><path d="M38 5a24 24 0 00-34 34l90 71C56 141 26 178 6 214a48 48 0 000 42c47 94 141 176 262 176 47 0 90-12 128-32l106 83a24 24 0 0034-34L38 5zM320 368a112 112 0 01-108-142l37 29a64 64 0 0074 74l37 29a111 111 0 01-40 10zm300-112c-25-49-64-90-111-119l-70 55a112 112 0 01-118 118l-45 35c14 4 29 6 44 6 121 0 215-82 262-176a48 48 0 000-19z"/></svg>',
  users: '<svg viewBox="0 0 640 512"><path d="M224 256a128 128 0 100-256 128 128 0 000 256zm-45 48A179 179 0 000 483a29 29 0 0029 29h390a29 29 0 0029-29 179 179 0 00-179-179h-90zm275-48a112 112 0 100-224 112 112 0 000 224zm-30 48c-9 0-18 1-26 4a205 205 0 0164 147 60 60 0 01-3 19h146a29 29 0 0029-29 141 141 0 00-141-141h-69z"/></svg>',
  mapPin: '<svg viewBox="0 0 384 512"><path d="M192 0a192 192 0 00-192 192c0 87 28 113 160 302a39 39 0 0064 0c132-189 160-215 160-302A192 192 0 00192 0zm0 272a80 80 0 110-160 80 80 0 010 160z"/></svg>',
};

const KEY = 'oficinapro.v4';
const money = n => 'R$ ' + (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const uid = p => (p||'id') + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);

const CHECKLIST_ITENS = [
  'Nível de óleo do motor', 'Fluido de freio', 'Água do radiador', 'Pastilhas e discos',
  'Pneus e calibragem', 'Suspensão dianteira', 'Bateria e alternador', 'Correia / tensor',
  'Filtros (ar / óleo / cabine)', 'Luzes e lanternas', 'Folga na direção', 'Vazamentos aparentes',
];

// catálogo de fornecedores (dados de exemplo — no produto real vem do catálogo eletrônico do setor)
const CATALOGO = {
  'Pastilha de freio dianteira (par)': [{ forn: 'Bosch · original', valor: 189, prazo: 'hoje', best: true }, { forn: 'Fras-le · similar', valor: 142, prazo: 'amanhã' }, { forn: 'Cobreq · similar', valor: 118, prazo: '3 dias' }],
  'Disco de freio ventilado': [{ forn: 'Fremax · original', valor: 320, prazo: 'amanhã', best: true }, { forn: 'Hipper · similar', valor: 248, prazo: '2 dias' }],
  'Filtro de óleo': [{ forn: 'Tecfil', valor: 34, prazo: 'hoje', best: true }, { forn: 'Mann', valor: 52, prazo: 'amanhã' }],
  'Óleo motor 5W30 sintético (litro)': [{ forn: 'Petronas', valor: 48, prazo: 'hoje', best: true }, { forn: 'Mobil', valor: 61, prazo: 'hoje' }],
  'Kit correia dentada': [{ forn: 'Gates', valor: 410, prazo: '2 dias', best: true }, { forn: 'Contitech', valor: 380, prazo: '3 dias' }],
  'Amortecedor dianteiro (par)': [{ forn: 'Cofap · original', valor: 540, prazo: 'amanhã', best: true }, { forn: 'Nakata', valor: 470, prazo: '2 dias' }],
};
const SERVICOS = [
  { desc: 'Mão de obra — troca de pastilha', valor: 150 }, { desc: 'Mão de obra — troca de óleo e filtro', valor: 80 },
  { desc: 'Mão de obra — correia dentada', valor: 420 }, { desc: 'Mão de obra — suspensão dianteira', valor: 320 },
  { desc: 'Alinhamento e balanceamento', valor: 120 }, { desc: 'Diagnóstico eletrônico (scanner)', valor: 90 },
];
const PLACAS = {
  RQP4C18: { marca: 'VW', modelo: 'Gol 1.6', ano: 2014 }, FLA2D33: { marca: 'Fiat', modelo: 'Argo Drive', ano: 2021 },
  BRA2E19: { marca: 'Chevrolet', modelo: 'Onix LT', ano: 2019 }, GMC7H01: { marca: 'Hyundai', modelo: 'HB20 Comfort', ano: 2018 },
};

// ---------- persistência ----------
function load() { try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {} return null; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('Armazenamento cheio — remova fotos antigas'); } }

function seed() {
  const now = Date.now(), day = 86400000;
  const clientes = [
    { id: 'cli_marcos', nome: 'Marcos Silva', telefone: '5519999990001', cpfCnpj: '409.357.928-80', cep: '13010-111', endereco: { rua: 'Rua Barão de Jaguara', numero: '120', bairro: 'Centro', cidade: 'Campinas', uf: 'SP' },
      veiculos: [ { id: 'v_gol', placa: 'RQP4C18', marca: 'VW', modelo: 'Gol 1.6', ano: 2014, km: 128400 }, { id: 'v_hb20', placa: 'GMC7H01', marca: 'Hyundai', modelo: 'HB20 Comfort', ano: 2018, km: 54200 } ] },
    { id: 'cli_ana', nome: 'Ana Souza', telefone: '5519999990002', cpfCnpj: '327.114.560-09', cep: '13024-020', endereco: { rua: 'Av. Andrade Neves', numero: '888', bairro: 'Botafogo', cidade: 'Campinas', uf: 'SP' },
      veiculos: [ { id: 'v_onix', placa: 'BRA2E19', marca: 'Chevrolet', modelo: 'Onix LT', ano: 2019, km: 62100 } ] },
    { id: 'cli_ju', nome: 'Juliana Reis', telefone: '5519999990003', cpfCnpj: '', cep: '', endereco: {},
      veiculos: [ { id: 'v_argo', placa: 'FLA2D33', marca: 'Fiat', modelo: 'Argo Drive', ano: 2021, km: 41800 } ] },
    { id: 'cli_pedro', nome: 'Pedro Alves', telefone: '5519999990004', cpfCnpj: '', cep: '', endereco: {},
      veiculos: [ { id: 'v_corolla', placa: 'PDR1A23', marca: 'Toyota', modelo: 'Corolla XEi', ano: 2020, km: 78300 } ] },
  ];
  const base = {
    onboarded: false, despesasMensais: 1800, ocultar: false,
    oficina: { nome: 'Auto Center do Zé', cidade: 'Campinas · SP', telefone: '5519998887766', cnpj: '08.095.122/0001-10', endereco: 'Rua Dr. Emílio Casasco, 225 · Campinas/SP', email: 'contato@autocenterdoze.com.br', tecnico: 'Júnior', logo: '' },
    clientes,
    estoque: [
      { id: uid('e'), nome: 'Pastilha de freio dianteira (par)', qtd: 4, min: 2, custo: 120, preco: 189 },
      { id: uid('e'), nome: 'Disco de freio ventilado', qtd: 1, min: 2, custo: 210, preco: 320 },
      { id: uid('e'), nome: 'Filtro de óleo', qtd: 12, min: 5, custo: 20, preco: 34 },
      { id: uid('e'), nome: 'Óleo motor 5W30 sintético (litro)', qtd: 18, min: 8, custo: 30, preco: 48 },
      { id: uid('e'), nome: 'Kit correia dentada', qtd: 0, min: 1, custo: 280, preco: 410 },
      { id: uid('e'), nome: 'Amortecedor dianteiro (par)', qtd: 2, min: 1, custo: 360, preco: 540 },
    ],
    os: [],
  };
  const mkOS = (cli, vei, itens, extra) => Object.assign({
    id: uid('os'), clienteId: cli.id, cliente: cli.nome, telefone: cli.telefone, cpfCnpj: cli.cpfCnpj, endereco: enderecoStr(cli.endereco, cli.cep), tecnico: base.oficina.tecnico,
    veiculoId: vei.id, placa: vei.placa, veiculo: { marca: vei.marca, modelo: vei.modelo, ano: vei.ano, km: vei.km },
    itens, fotos: [], checklist: {}, obs: '', desconto: 0, status: 'orcamento', createdAt: now, aprovadoAt: null, entregueAt: null,
  }, extra || {});
  // OS ativas
  base.os.push(mkOS(clientes[0], clientes[0].veiculos[0], [{ tipo: 'peca', desc: 'Pastilha de freio dianteira (par)', qtd: 1, valor: 189, custo: 120 }, { tipo: 'peca', desc: 'Disco de freio ventilado', qtd: 2, valor: 320, custo: 210 }, { tipo: 'servico', desc: 'Mão de obra — troca de pastilha', qtd: 1, valor: 150, custo: 0 }], { status: 'execucao', createdAt: now - 2 * 3600000, aprovadoAt: now - 1.5 * 3600000 }));
  base.os.push(mkOS(clientes[1], clientes[1].veiculos[0], [{ tipo: 'peca', desc: 'Filtro de óleo', qtd: 1, valor: 34, custo: 20 }, { tipo: 'peca', desc: 'Óleo motor 5W30 sintético (litro)', qtd: 4, valor: 48, custo: 30 }, { tipo: 'servico', desc: 'Mão de obra — troca de óleo e filtro', qtd: 1, valor: 80, custo: 0 }], { status: 'orcamento', createdAt: now - 40 * 60000 }));

  // histórico de entregas espalhado pelos últimos meses (para o painel financeiro ter dados)
  const hoje = new Date(now);
  const combos = [
    [{ tipo: 'peca', desc: 'Filtro de óleo', qtd: 1, valor: 34, custo: 20 }, { tipo: 'peca', desc: 'Óleo motor 5W30 sintético (litro)', qtd: 4, valor: 48, custo: 30 }, { tipo: 'servico', desc: 'Mão de obra — troca de óleo e filtro', qtd: 1, valor: 80, custo: 0 }],
    [{ tipo: 'peca', desc: 'Pastilha de freio dianteira (par)', qtd: 1, valor: 189, custo: 120 }, { tipo: 'servico', desc: 'Mão de obra — troca de pastilha', qtd: 1, valor: 150, custo: 0 }],
    [{ tipo: 'servico', desc: 'Alinhamento e balanceamento', qtd: 1, valor: 120, custo: 0 }, { tipo: 'servico', desc: 'Diagnóstico eletrônico (scanner)', qtd: 1, valor: 90, custo: 0 }],
    [{ tipo: 'peca', desc: 'Amortecedor dianteiro (par)', qtd: 1, valor: 540, custo: 360 }, { tipo: 'servico', desc: 'Mão de obra — suspensão dianteira', qtd: 1, valor: 320, custo: 0 }],
  ];
  let seq = 0;
  const pushEntrega = (ts, k) => {
    const cli = clientes[k % clientes.length];
    const vei = cli.veiculos[k % cli.veiculos.length];
    const itens = combos[k % combos.length].map(x => ({ ...x }));
    base.os.push(mkOS(cli, vei, itens, { status: 'entregue', createdAt: ts, aprovadoAt: ts, entregueAt: ts + 3 * 3600000, nota: 'NFS-e ' + (340000 + seq) }));
    seq++;
  };
  for (let m = 1; m <= 5; m++) {
    const qtd = 11 + (m % 4);
    for (let j = 0; j < qtd; j++) pushEntrega(new Date(hoje.getFullYear(), hoje.getMonth() - m, 2 + ((m * 5 + j * 3) % 25), 14, 0).getTime(), m + j);
  }
  const diaHoje = hoje.getDate();
  const nEsteMes = Math.max(4, Math.min(12, diaHoje - 1));
  for (let j = 0; j < nEsteMes; j++) pushEntrega(now - (j * 0.6 + 0.4) * day - 3 * 3600000, j);
  return base;
}

let state = load() || seed();
if (!load()) save();

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const el = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
const osTotal = os => os.itens.reduce((s, i) => s + i.valor * i.qtd, 0);
const osFinal = os => Math.max(0, osTotal(os) - (os.desconto || 0));
// versão do valor que respeita o "olhinho" (ocultar valores na tela)
const moneyV = n => state.ocultar ? 'R$ ••••' : money(n);
const osCusto = os => os.itens.reduce((s, i) => s + (i.custo || 0) * i.qtd, 0);
// máscaras
function parseMoneyBR(str) { return (parseInt(String(str).replace(/\D/g, '') || '0', 10)) / 100; }
function maskMoney(input) { input.addEventListener('input', () => { input.value = parseMoneyBR(input.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 }); }); }
function maskPhone(input) { input.addEventListener('input', () => { let v = input.value.replace(/\D/g, '').slice(0, 11); if (v.length > 7) input.value = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/[-\s]+$/, ''); else if (v.length > 2) input.value = v.replace(/(\d{2})(\d{0,5})/, '($1) $2'); else input.value = v; }); }
function clientesConhecidos() { const m = {}; state.os.forEach(o => { const k = o.telefone || o.cliente; if (!m[k]) m[k] = { cliente: o.cliente, telefone: o.telefone }; }); return Object.values(m); }
const STATUS = { orcamento: { label: 'Orçamento', cls: 'orcamento' }, aprovado: { label: 'Aprovado', cls: 'aprovado' }, execucao: { label: 'Em execução', cls: 'execucao' }, entregue: { label: 'Entregue', cls: 'entregue' } };
function timeAgo(ts) { const d = Date.now() - ts, m = d / 60000, h = m / 60, days = h / 24; if (m < 60) return `há ${Math.max(1, Math.round(m))} min`; if (h < 24) return `há ${Math.round(h)} h`; if (days < 30) return `há ${Math.round(days)} d`; return `há ${Math.round(days / 30)} meses`; }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2200); }
function fmtPlaca(raw) { const r = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7); return r.length <= 3 ? r : r.slice(0, 3) + '-' + r.slice(3); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function estoqueByNome(nome) { return state.estoque.find(e => e.nome === nome); }
function clienteById(id) { return (state.clientes || []).find(c => c.id === id); }
function enderecoStr(end, cep) { if (!end || !end.rua) return cep ? 'CEP ' + cep : ''; return `${end.rua}${end.numero ? ', Nº ' + end.numero : ''}${end.bairro ? ', ' + end.bairro : ''}${end.cidade ? ', ' + end.cidade + (end.uf ? '/' + end.uf : '') : ''}${cep ? ', CEP ' + cep : ''}`; }
function maskCpfCnpj(input) { input.addEventListener('input', () => { let v = input.value.replace(/\D/g, '').slice(0, 14); if (v.length <= 11) input.value = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'); else input.value = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2'); }); }
function maskCep(input) { input.addEventListener('input', () => { let v = input.value.replace(/\D/g, '').slice(0, 8); input.value = v.length > 5 ? v.replace(/(\d{5})(\d)/, '$1-$2') : v; }); }
async function buscaCep(cep) { const c = String(cep).replace(/\D/g, ''); if (c.length !== 8) return null; try { const r = await fetch('https://viacep.com.br/ws/' + c + '/json/'); const j = await r.json(); if (j.erro) return null; return { rua: j.logradouro || '', bairro: j.bairro || '', cidade: j.localidade || '', uf: j.uf || '' }; } catch (e) { return null; } }

// ---------- router ----------
let route = { name: 'baia', param: null, _from: null };
let draft = null;
function go(name, param) { route = { name, param, _from: route.name }; render(); $('#screen').scrollTop = 0; }

// ---------- topbar ----------
function topbar() {
  const bar = $('#topbar');
  const titles = { nova: 'Nova ordem de serviço', detalhe: 'Ordem de serviço', estoque: 'Estoque de peças', financeiro: 'Financeiro', retornos: 'Retorno de clientes', config: 'Minha oficina', ajuda: 'Como funciona', mais: 'Mais', placa: 'Histórico por placa', os: 'Ordens de serviço', clientes: 'Clientes', cliente: 'Cliente' };
  const desktop = window.innerWidth >= 900;
  const sidebarScreens = ['financeiro', 'retornos', 'placa', 'config', 'ajuda', 'estoque', 'clientes'];
  const withBack = ['nova', 'detalhe', 'financeiro', 'retornos', 'config', 'ajuda', 'placa', 'cliente'].filter(n => !(desktop && sidebarScreens.includes(n)));
  if (route.name === 'baia') {
    bar.innerHTML = `<div class="brand"><div class="logo">${ICON.wrench}</div><div class="title">Oficina Pro</div></div><div class="spacer"></div><div class="sub">${state.oficina.cidade}</div>`;
  } else if (withBack.includes(route.name)) {
    bar.innerHTML = `<button class="back" data-back>‹</button><div class="title">${titles[route.name]}</div><div class="spacer"></div>`;
  } else {
    bar.innerHTML = `<div class="brand"><div class="logo">${ICON.wrench}</div><div class="title">${titles[route.name] || 'Oficina Pro'}</div></div>`;
  }
  const b = bar.querySelector('[data-back]');
  if (b) b.onclick = () => go(route._from && route._from !== route.name ? route._from : 'baia');
  // olhinho: oculta/mostra os valores
  const eye = el(`<button class="eye-btn" title="${state.ocultar ? 'Mostrar valores' : 'Ocultar valores'}">${state.ocultar ? ICON.eyeOff : ICON.eye}</button>`);
  eye.onclick = () => { state.ocultar = !state.ocultar; save(); render(); };
  bar.append(el(`<div class="spacer"></div>`), eye);
}

// ---------- tab bar ----------
function tabbar() {
  const t = $('#tabbar');
  const tab = (name, icon, label) => `<button class="tab ${route.name === name ? 'active' : ''}" data-tab="${name}">${icon}<span>${label}</span></button>`;
  t.innerHTML = tab('baia', ICON.home, 'Baia') + tab('os', ICON.list, 'OS') + `<button class="tab mid"></button>` + tab('estoque', ICON.box, 'Estoque') + tab('mais', ICON.dots, 'Mais') + `<div class="fab" data-fab>${ICON.plus}</div>`;
  t.querySelectorAll('[data-tab]').forEach(btn => btn.onclick = () => go(btn.dataset.tab));
  t.querySelector('[data-fab]').onclick = () => startNova();
}

// ---------- render ----------
const SCREENS = { baia: scrBaia, os: scrOS, nova: scrNova, detalhe: scrDetalhe, placa: scrPlaca, estoque: scrEstoque, financeiro: scrFinanceiro, retornos: scrRetornos, config: scrConfig, ajuda: scrAjuda, mais: scrMais, clientes: scrClientes, cliente: scrCliente };
function render() {
  topbar(); tabbar(); sidebar();
  const s = $('#screen'); s.innerHTML = '';
  const inner = el(`<div class="screen-inner"></div>`);
  s.append(inner);
  (SCREENS[route.name] || scrBaia)(inner);
  s.classList.remove('anim'); void s.offsetWidth; s.classList.add('anim');
}

// ---------- sidebar (desktop) ----------
function sidebar() {
  const sb = $('#sidebar'); if (!sb) return;
  const activeMap = { baia: 'baia', os: 'os', nova: 'os', detalhe: 'os', estoque: 'estoque', financeiro: 'financeiro', retornos: 'retornos', placa: 'placa', config: 'config', ajuda: 'ajuda', clientes: 'clientes', cliente: 'clientes' };
  const act = activeMap[route.name] || '';
  const item = (r, ic, label) => `<button class="side-item ${act === r ? 'active' : ''}" data-side="${r}">${ic}<span>${label}</span></button>`;
  sb.innerHTML = `
    <div class="side-brand"><div class="side-logo">${state.oficina.logo ? `<img src="${state.oficina.logo}" style="width:100%;height:100%;object-fit:cover;border-radius:11px">` : ICON.wrench}</div><div><div class="sb-name">Oficina Pro</div><div class="sb-sub">${state.oficina.nome || ''}</div></div></div>
    <button class="side-nova" data-side-nova>${ICON.plus} Nova OS</button>
    <nav class="side-nav">
      ${item('baia', ICON.home, 'Baia')}
      ${item('os', ICON.list, 'Ordens de serviço')}
      ${item('clientes', ICON.users, 'Clientes')}
      ${item('estoque', ICON.box, 'Estoque')}
      ${item('financeiro', ICON.chart, 'Financeiro')}
      ${item('retornos', ICON.calendar, 'Retornos')}
      ${item('placa', ICON.plate, 'Histórico por placa')}
    </nav>
    <div class="side-bottom">
      ${item('config', ICON.cog, 'Minha oficina')}
      ${item('ajuda', ICON.help, 'Como funciona')}
    </div>`;
  sb.querySelectorAll('[data-side]').forEach(b => b.onclick = () => go(b.dataset.side));
  sb.querySelector('[data-side-nova]').onclick = () => startNova();
}

// ---------- Baia (painel) ----------
function scrBaia(s) {
  const now = new Date();
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const receitaMes = state.os.filter(o => o.entregueAt && o.entregueAt >= mStart).reduce((a, o) => a + osFinal(o), 0);
  const naBaia = state.os.filter(o => o.status === 'aprovado' || o.status === 'execucao');
  const aguardando = state.os.filter(o => o.status === 'orcamento');
  const semEstoque = state.estoque.filter(e => e.qtd <= e.min);

  s.append(el(`<div class="section-label">Hoje na oficina</div>`));
  const grid = el(`<div class="stat-grid"></div>`);
  grid.append(
    el(`<div class="stat dark"><div class="big">${naBaia.length}</div><div class="lbl">carros na baia</div></div>`),
    el(`<div class="stat accent"><div class="big">${moneyV(receitaMes)}</div><div class="lbl">faturamento do mês</div></div>`),
    el(`<div class="stat"><div class="big">${aguardando.length}</div><div class="lbl">aguardando aprovação</div></div>`),
    el(`<div class="stat"><div class="big">${state.os.filter(o => o.status !== 'entregue').length}</div><div class="lbl">OS abertas</div></div>`),
  );
  s.append(grid);

  if (semEstoque.length) {
    const alert = el(`<div class="menu-row" style="margin-top:14px"><div class="mi">${ICON.box}</div><div class="mt"><b>${semEstoque.length} ${semEstoque.length > 1 ? 'peças abaixo do mínimo' : 'peça abaixo do mínimo'}</b><small>toque para ver o estoque</small></div><div class="arrow">›</div></div>`);
    alert.onclick = () => go('estoque'); s.append(alert);
  }

  s.append(el(`<div class="section-label mt">Precisam de você</div>`));
  const pend = [...aguardando, ...naBaia].slice(0, 6);
  if (!pend.length) s.append(emptyState('Tudo em dia. Nenhuma OS aberta.'));
  pend.forEach(o => s.append(osCard(o)));
}

let osQuery = '';
function scrOS(s) {
  const bar = el(`<div class="searchbar"><span class="si">${ICON.search}</span><input id="os-q" placeholder="Buscar por placa, cliente ou carro" value="${osQuery}"></div>`);
  s.append(bar);
  const results = el(`<div id="os-results"></div>`);
  s.append(results);
  const draw = () => {
    results.innerHTML = '';
    const q = osQuery.trim().toLowerCase();
    const match = o => !q || [o.placa, o.cliente, o.veiculo.marca, o.veiculo.modelo].join(' ').toLowerCase().includes(q);
    const ordered = [...state.os].filter(match).sort((a, b) => b.createdAt - a.createdAt);
    [['Abertas', ordered.filter(o => o.status !== 'entregue')], ['Entregues', ordered.filter(o => o.status === 'entregue')]].forEach(([label, arr]) => {
      if (!arr.length) return;
      results.append(el(`<div class="section-label">${label} · ${arr.length}</div>`));
      arr.forEach(o => results.append(osCard(o)));
    });
    if (!ordered.length) results.append(emptyState(state.os.length ? 'Nada encontrado para essa busca.' : 'Nenhuma OS ainda. Toque no + para criar.'));
  };
  bar.querySelector('#os-q').addEventListener('input', e => { osQuery = e.target.value; draw(); });
  draw();
}

function osCard(o) {
  const st = STATUS[o.status];
  const c = el(`<div class="os-card"><div class="plate">${fmtPlaca(o.placa)}</div><div class="info"><div class="veic">${o.veiculo.marca} ${o.veiculo.modelo}</div><div class="meta">${o.cliente} · ${timeAgo(o.createdAt)}</div></div><div class="right"><div class="val">${moneyV(osFinal(o))}</div><span class="chip ${st.cls}">${st.label}</span></div></div>`);
  c.onclick = () => go('detalhe', o.id);
  return c;
}
function emptyState(msg) { return el(`<div class="empty">${ICON.car}<div>${msg}</div></div>`); }

// ---------- detalhe da OS ----------
function scrDetalhe(s) {
  const o = state.os.find(x => x.id === route.param);
  if (!o) { go('os'); return; }
  const st = STATUS[o.status];
  const editable = o.status === 'orcamento';

  const head = el(`<div class="detail-head"><div class="row1"><div class="plate-lg">${fmtPlaca(o.placa)}</div><div style="display:flex;align-items:center;gap:10px"><span class="chip ${st.cls}">${st.label}</span><button class="head-edit">${ICON.edit}</button></div></div><div class="veic-lg">${o.veiculo.marca} ${o.veiculo.modelo} · ${o.veiculo.ano || ''} · ${(o.veiculo.km || 0).toLocaleString('pt-BR')} km</div><div class="cli">${o.cliente}${o.telefone ? ' · ' + fmtTelefone(o.telefone) : ''}</div></div>`);
  head.querySelector('.head-edit').onclick = () => editHeaderSheet(o);
  s.append(head);

  // fotos
  const doneChk = Object.values(o.checklist || {}).filter(Boolean).length;
  const chkBlock = el(`<div class="menu-row"><div class="mi">${ICON.checkc}</div><div class="mt"><b>Checklist de vistoria</b><small>${doneChk} de ${CHECKLIST_ITENS.length} itens conferidos</small></div><div class="arrow">›</div></div>`);
  chkBlock.onclick = () => openChecklist(o);
  s.append(chkBlock);

  s.append(el(`<div class="section-label">Fotos do serviço</div>`));
  const strip = el(`<div class="photo-strip"></div>`);
  (o.fotos || []).forEach((src, i) => {
    const img = el(`<img class="photo-thumb" src="${src}">`);
    if (editable || o.status === 'execucao') img.onclick = () => { if (confirm('Remover esta foto?')) { o.fotos.splice(i, 1); save(); render(); } };
    strip.append(img);
  });
  if ((editable || o.status === 'execucao') && (o.fotos || []).length < 4) {
    const add = el(`<button class="photo-add">${ICON.camera}</button>`);
    add.onclick = () => addPhoto(o);
    strip.append(add);
  }
  if (!(o.fotos || []).length && !(editable || o.status === 'execucao')) strip.append(el(`<div class="hint-line">Nenhuma foto anexada.</div>`));
  s.append(strip);

  s.append(el(`<div class="section-label mt">Itens do orçamento</div>`));
  o.itens.forEach((it) => {
    const qtyTxt = it.qtd > 1 ? ` <small>× ${it.qtd}</small>` : '';
    const row = el(`<div class="item-row"><span class="tag ${it.tipo}">${it.tipo === 'peca' ? 'PEÇA' : 'SERV'}</span><div class="desc">${it.desc}${qtyTxt}</div><div class="v">${money(it.valor * it.qtd)}</div>${editable ? `<button class="del">${ICON.edit}</button>` : ''}</div>`);
    if (editable) { row.style.cursor = 'pointer'; row.onclick = () => editItemSheet(o, it); }
    s.append(row);
  });
  if (!o.itens.length) s.append(el(`<div class="hint-line">Nenhum item ainda.</div>`));
  if (editable) { const add = el(`<button class="add-item-line">${ICON.plus} adicionar item</button>`); add.onclick = () => openItemSheet(o); s.append(add); }

  if (editable && o.itens.length) {
    const disc = el(`<div class="disc-input"><label>Desconto (R$)</label><input id="os-desc" inputmode="numeric" value="${(o.desconto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}"></div>`);
    const inp = disc.querySelector('#os-desc'); maskMoney(inp);
    inp.addEventListener('change', () => { o.desconto = Math.min(osTotal(o), parseMoneyBR(inp.value)); save(); render(); });
    s.append(disc);
  }

  if (o.desconto > 0) s.append(el(`<div class="desc-line"><div class="dl">Subtotal ${moneyV(osTotal(o))} · desconto</div><div class="dv">− ${moneyV(o.desconto)}</div></div>`));
  s.append(el(`<div class="total-bar"><div class="lbl">Total</div><div class="amt">${moneyV(osFinal(o))}</div></div>`));

  if (o.aprovadoAt) { const d = new Date(o.aprovadoAt); s.append(el(`<div class="approval-note">${ICON.checkc} Aprovado pelo cliente · ${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>`)); }

  const actions = el(`<div></div>`);
  if (o.status === 'orcamento') {
    const wpp = el(`<button class="btn teal">${ICON.wpp} Enviar orçamento no WhatsApp</button>`); wpp.onclick = () => enviarWhatsApp(o);
    const apr = el(`<button class="btn primary" style="margin-top:9px">${ICON.check} Cliente aprovou</button>`); apr.onclick = () => { if (!o.itens.length) return toast('Adicione itens antes de aprovar'); o.status = 'aprovado'; o.aprovadoAt = Date.now(); save(); render(); toast('Orçamento aprovado ✓'); };
    actions.append(wpp, apr);
  } else if (o.status === 'aprovado') {
    const exec = el(`<button class="btn dark">${ICON.wrench} Iniciar execução</button>`); exec.onclick = () => { o.status = 'execucao'; save(); render(); toast('Serviço em execução'); };
    actions.append(exec);
  } else if (o.status === 'execucao') {
    const ent = el(`<button class="btn primary">${ICON.invoice} Emitir nota e entregar</button>`); ent.onclick = () => emitirNota(o);
    actions.append(ent);
  } else if (o.status === 'entregue') {
    actions.append(el(`<div class="approval-note" style="background:var(--mist);color:var(--steel)">${ICON.invoice} ${o.nota || 'NFS-e'} emitida · entregue ${timeAgo(o.entregueAt)}</div>`));
    actions.append(el(`<div class="sim-note"><b>Emissão simulada.</b> Nesta versão o número da nota é fictício. A emissão real precisa do certificado digital da oficina e da integração com o Emissor Nacional da NFS-e.</div>`));
  }
  s.append(actions);

  if (o.itens.length) {
    const pdf = el(`<button class="btn outline">${ICON.print} Gerar orçamento em PDF</button>`);
    pdf.onclick = () => gerarPDF(o);
    s.append(pdf);
  }

  // reabrir orçamento (aprovado/execução) e excluir OS
  if (o.status === 'aprovado' || o.status === 'execucao') {
    const re = el(`<button class="btn line" style="margin-top:8px">${ICON.reopen} Reabrir orçamento para editar</button>`);
    re.onclick = () => { if (confirm('Reabrir esta OS como orçamento? O aceite anterior será limpo.')) { o.status = 'orcamento'; o.aprovadoAt = null; save(); render(); toast('OS reaberta'); } };
    s.append(re);
  }
  if (o.status !== 'entregue') {
    const del = el(`<button class="btn line" style="margin-top:6px;color:var(--red)">${ICON.trash} Excluir OS</button>`);
    del.onclick = () => { if (confirm(`Excluir a OS do ${o.veiculo.marca} ${o.veiculo.modelo}? Isso não pode ser desfeito.`)) { o.itens.forEach(it => { if (it.estoqueId) ajustaEstoque(it, it.qtd, 0); }); state.os = state.os.filter(x => x !== o); save(); go('os'); toast('OS excluída'); } };
    s.append(del);
  }
}

function editHeaderSheet(o) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  body.innerHTML = `<div class="grab"></div><h3>Editar dados da OS</h3>
    <div class="field"><label>Cliente</label><input id="h-cli" value="${o.cliente || ''}"></div>
    <div class="field"><label>WhatsApp</label><input id="h-tel" inputmode="numeric" value="${o.telefone ? fmtTelefone(o.telefone) : ''}"></div>
    <div class="row-2"><div class="field"><label>Marca</label><input id="h-marca" value="${o.veiculo.marca || ''}"></div><div class="field"><label>Modelo</label><input id="h-modelo" value="${o.veiculo.modelo || ''}"></div></div>
    <div class="row-2"><div class="field"><label>Ano</label><input id="h-ano" inputmode="numeric" value="${o.veiculo.ano || ''}"></div><div class="field"><label>KM</label><input id="h-km" inputmode="numeric" value="${o.veiculo.km || ''}"></div></div>
    <div class="field"><label>Observações (aparecem no PDF)</label><input id="h-obs" placeholder="Ex.: cliente relatou barulho na frenagem" value="${o.obs || ''}"></div>
    <button class="btn primary" id="h-save">Salvar</button><button class="btn line" id="h-cancel" style="margin-top:4px">cancelar</button>`;
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
  maskPhone(body.querySelector('#h-tel'));
  body.querySelector('#h-cancel').onclick = () => backdrop.hidden = true;
  body.querySelector('#h-save').onclick = () => {
    o.cliente = body.querySelector('#h-cli').value.trim() || o.cliente;
    o.telefone = body.querySelector('#h-tel').value.replace(/\D/g, '') || o.telefone;
    o.veiculo.marca = body.querySelector('#h-marca').value.trim(); o.veiculo.modelo = body.querySelector('#h-modelo').value.trim();
    o.veiculo.ano = +body.querySelector('#h-ano').value || ''; o.veiculo.km = +body.querySelector('#h-km').value || 0;
    o.obs = body.querySelector('#h-obs').value.trim();
    save(); backdrop.hidden = true; render(); toast('Dados atualizados');
  };
}

function emitirNota(o) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  body.innerHTML = `<div class="grab"></div><h3>Emitir nota e entregar</h3>
    <div class="sim-note" style="margin-bottom:14px"><span class="sim-badge">${ICON.invoice} SIMULADO</span><br><br>Nesta versão de demonstração a NFS-e é gerada com número fictício. Na versão real, aqui o sistema chamaria o <b>Emissor Nacional</b> com o certificado digital da sua oficina e devolveria a nota válida.</div>
    <button class="btn primary" id="do-emit">${ICON.check} Emitir NFS-e (simulada) e entregar</button>
    <button class="btn line" id="cancel-emit" style="margin-top:4px">cancelar</button>`;
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
  body.querySelector('#cancel-emit').onclick = () => backdrop.hidden = true;
  body.querySelector('#do-emit').onclick = () => {
    o.status = 'entregue'; o.entregueAt = Date.now(); o.nota = 'NFS-e ' + Math.floor(Math.random() * 900000 + 100000);
    save(); backdrop.hidden = true; render(); toast('Nota emitida (simulada) · OS entregue');
  };
}

function addPhoto(o) {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
  input.onchange = () => {
    const file = input.files && input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 720, scale = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas'); cv.width = img.width * scale; cv.height = img.height * scale;
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        o.fotos = o.fotos || []; o.fotos.push(cv.toDataURL('image/jpeg', 0.6));
        save(); render(); toast('Foto anexada');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function openChecklist(o) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  o.checklist = o.checklist || {};
  const draw = () => {
    body.innerHTML = `<div class="grab"></div><h3>Checklist de vistoria</h3><div id="chk"></div><button class="btn primary" id="chk-ok" style="margin-top:14px">Concluir</button>`;
    const box = body.querySelector('#chk');
    CHECKLIST_ITENS.forEach((item, i) => {
      const on = !!o.checklist[i];
      const row = el(`<div class="check-item ${on ? 'on' : ''}"><div class="check-box">${ICON.check}</div><div class="ci-label">${item}</div></div>`);
      row.onclick = () => { o.checklist[i] = !o.checklist[i]; save(); draw(); };
      box.append(row);
    });
    body.querySelector('#chk-ok').onclick = () => { backdrop.hidden = true; render(); };
  };
  draw();
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) { backdrop.hidden = true; render(); } };
}

function enviarWhatsApp(o) {
  const linhas = o.itens.map(i => `• ${i.desc}${i.qtd > 1 ? ` (x${i.qtd})` : ''} — ${money(i.valor * i.qtd)}`).join('%0A');
  const desc = o.desconto > 0 ? `%0ADesconto: − ${money(o.desconto)}` : '';
  const txt = `*${state.oficina.nome}*%0AOrçamento do ${o.veiculo.marca} ${o.veiculo.modelo} (placa ${fmtPlaca(o.placa)})%0A%0A${linhas}${desc}%0A%0A*Total: ${money(osFinal(o))}*%0A%0AResponda *APROVO* para autorizarmos o serviço.`;
  window.open(`https://wa.me/${o.telefone}?text=${txt}`, '_blank');
  toast('Abrindo WhatsApp do cliente…');
}

// ---------- orçamento em PDF (documento imprimível com a marca) ----------
function gerarPDF(o) {
  const app = $('#app');
  const of = state.oficina;
  const d = new Date(o.createdAt);
  const numero = o.id.replace(/[^0-9]/g, '').slice(-4).padStart(4, '0');
  const stLabel = { orcamento: 'Aguardando', aprovado: 'Aprovado', execucao: 'Em execução', entregue: 'Entregue' }[o.status] || '';
  const rows = o.itens.map((i, n) => `<tr><td class="c">${n + 1}</td><td><span class="tp ${i.tipo}">${i.tipo === 'peca' ? 'Peça' : 'Serviço'}</span></td><td>${i.desc}</td><td class="c">${i.qtd}</td><td class="r">${money(i.valor)}</td><td class="r">${money(i.valor * i.qtd)}</td></tr>`).join('');
  const subPecas = o.itens.filter(i => i.tipo === 'peca').reduce((a, i) => a + i.valor * i.qtd, 0);
  const subMO = o.itens.filter(i => i.tipo === 'servico').reduce((a, i) => a + i.valor * i.qtd, 0);
  const logoHtml = of.logo ? `<img class="dl-img" src="${of.logo}">` : `<div class="dl-mark">${ICON.wrench}</div>`;
  const termos = [
    'O prazo de garantia dos serviços prestados é de 90 (noventa) dias ou 3.000 km, o que ocorrer primeiro, conforme Art. 26 do Código de Defesa do Consumidor (Lei 8.078/90).',
    'Peças substituídas ficam à disposição do cliente por 72 horas após a conclusão do serviço, podendo ser retiradas mediante solicitação.',
    'O veículo deverá ser retirado no prazo máximo de 30 (trinta) dias após a comunicação da conclusão do serviço, sob pena de cobrança de diária de estadia.',
    'A oficina não se responsabiliza por objetos pessoais deixados no interior do veículo.',
    'Qualquer serviço adicional não previsto nesta ordem será realizado somente mediante autorização prévia do cliente.',
    'O orçamento tem validade de 10 (dez) dias a contar da data de emissão.',
    'O pagamento deverá ser efetuado na retirada do veículo, salvo acordo prévio entre as partes.',
  ];
  const doc = el(`<div class="print-doc">
    <div class="print-actions">
      <button class="btn primary" id="pdf-print">${ICON.print} Imprimir / Salvar PDF</button>
      <button class="btn line" id="pdf-close" style="color:#fff">Fechar</button>
    </div>
    <div class="sheet-a4 os-doc">
      <div class="os-topbar"></div>
      <div class="os-head">
        <div class="os-company">${logoHtml}<div class="os-co-info"><h1>${of.nome || 'Minha Oficina'}</h1>${of.cnpj ? `<div>CNPJ: ${of.cnpj}</div>` : ''}${of.endereco ? `<div>${of.endereco}</div>` : ''}${of.telefone ? `<div>Tel: ${fmtTelefone(of.telefone)}</div>` : ''}${of.email ? `<div>${of.email}</div>` : ''}</div></div>
        <div class="os-meta"><div class="os-kind">ORDEM DE SERVIÇO</div><div class="os-num">OS-${numero}</div><div class="os-status">${stLabel}</div><div class="os-dates">Emissão: ${d.toLocaleDateString('pt-BR')}, ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div></div>
      </div>
      <div class="os-sec">DADOS DO CLIENTE E VEÍCULO</div>
      <div class="os-boxes">
        <div class="os-box"><div class="os-box-t">CLIENTE</div><div class="os-box-name">${o.cliente || '—'}</div>${o.cpfCnpj ? `<div>CPF/CNPJ: ${o.cpfCnpj}</div>` : ''}${o.telefone ? `<div>Tel: ${fmtTelefone(o.telefone)}</div>` : ''}${o.endereco ? `<div>${o.endereco}</div>` : ''}</div>
        <div class="os-box"><div class="os-box-t">VEÍCULO</div><div class="os-box-name">${fmtPlaca(o.placa)}</div><div>Modelo: ${o.veiculo.marca} ${o.veiculo.modelo}${o.veiculo.ano ? ' · ' + o.veiculo.ano : ''}</div>${o.veiculo.km ? `<div>KM: ${o.veiculo.km.toLocaleString('pt-BR')}</div>` : ''}</div>
      </div>
      ${o.tecnico ? `<div class="os-tec">Técnico Responsável: <b>${o.tecnico}</b></div>` : ''}
      <div class="os-sec">SERVIÇOS E PEÇAS</div>
      <table class="os-table"><colgroup><col style="width:6%"><col style="width:13%"><col style="width:41%"><col style="width:8%"><col style="width:16%"><col style="width:16%"></colgroup><thead><tr><th class="c">#</th><th>Tipo</th><th>Descrição</th><th class="c">Qtd</th><th class="r">Vl. Unit.</th><th class="r">Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="os-tot-wrap"><div class="os-subs">
        <div class="tr"><span>Subtotal Peças:</span><span>${money(subPecas)}</span></div>
        <div class="tr"><span>Subtotal Mão de Obra:</span><span>${money(subMO)}</span></div>
        ${o.desconto > 0 ? `<div class="tr"><span>Desconto:</span><span>− ${money(o.desconto)}</span></div>` : ''}
        <div class="os-grand"><span>TOTAL GERAL</span><span>${money(osFinal(o))}</span></div>
      </div></div>
      <div class="os-sec">OBSERVAÇÕES</div>
      <div class="os-obs">${o.obs || '—'}</div>
      <div class="os-sec">TERMOS E CONDIÇÕES</div>
      <ol class="os-terms">${termos.map(t => `<li>${t}</li>`).join('')}</ol>
      <div class="os-footer"><div>${of.nome || 'Oficina'}${of.cnpj ? '<br>CNPJ: ' + of.cnpj : ''}</div><div>Documento gerado eletronicamente — válido como orçamento/ordem de serviço conforme CDC (Lei 8.078/90)</div></div>
    </div>
  </div>`);
  app.append(doc);
  doc.querySelector('#pdf-close').onclick = () => doc.remove();
  doc.querySelector('#pdf-print').onclick = () => window.print();
}
function fmtTelefone(t) { const v = String(t).replace(/\D/g, '').replace(/^55/, ''); if (v.length >= 10) return v.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3'); return t; }

// ---------- adicionar item (estoque + catálogo) ----------
function openItemSheet(o) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  let tipo = 'peca';
  const draw = () => {
    body.innerHTML = `<div class="grab"></div><h3>Adicionar item</h3><div class="seg"><button data-t="peca" class="${tipo === 'peca' ? 'on' : ''}">Peça</button><button data-t="servico" class="${tipo === 'servico' ? 'on' : ''}">Serviço</button></div><div id="cat"></div>`;
    body.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tipo = b.dataset.t; draw(); });
    const cat = body.querySelector('#cat');
    const custom = el(`<div class="cat-row" style="border:1.5px dashed var(--mist-2);color:var(--orange);font-weight:700;justify-content:center;gap:6px">${ICON.plus} Item personalizado</div>`);
    custom.onclick = () => editItemSheet(o, null, tipo);
    cat.append(custom);
    if (tipo === 'peca') {
      cat.append(el(`<div class="sub-lbl">Do seu estoque</div>`));
      const emEstoque = state.estoque.filter(e => e.qtd > 0);
      if (!emEstoque.length) cat.append(el(`<div class="hint-line">Nenhuma peça em estoque.</div>`));
      emEstoque.forEach(e => {
        const row = el(`<div class="cat-row"><div class="cname">${e.nome}<span class="em-estoque">em estoque: ${e.qtd}</span></div><div class="cval">${money(e.preco)}</div></div>`);
        row.onclick = () => { addItem(o, { tipo: 'peca', desc: e.nome, qtd: 1, valor: e.preco, custo: e.custo, estoqueId: e.id }); e.qtd -= 1; save(); toast(`${e.nome.split('(')[0].trim()} — baixa no estoque`); };
        cat.append(row);
      });
      cat.append(el(`<div class="sub-lbl">Pedir do fornecedor</div>`));
      Object.entries(CATALOGO).forEach(([desc, opts]) => {
        const best = opts.find(x => x.best) || opts[0];
        const row = el(`<div class="cat-row ${best.best ? 'best' : ''}"><div class="cname">${desc}<span class="sem-estoque">${best.forn} · entrega ${best.prazo}</span></div><div class="cval">${money(best.valor)}</div></div>`);
        row.onclick = () => addItem(o, { tipo: 'peca', desc, qtd: 1, valor: best.valor, custo: Math.round(best.valor * 0.68) });
        cat.append(row);
      });
    } else {
      SERVICOS.forEach(sv => { const row = el(`<div class="cat-row"><div class="cname">${sv.desc}</div><div class="cval">${money(sv.valor)}</div></div>`); row.onclick = () => addItem(o, { tipo: 'servico', desc: sv.desc, qtd: 1, valor: sv.valor, custo: 0 }); cat.append(row); });
    }
  };
  draw();
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
}
function addItem(o, item) { o.itens.push(item); save(); $('#sheet').hidden = true; render(); }

// ajusta o estoque quando a quantidade de um item vinculado muda. Retorna false se não há estoque.
function ajustaEstoque(item, oldQ, newQ) {
  if (!item.estoqueId) return true;
  const e = state.estoque.find(x => x.id === item.estoqueId); if (!e) return true;
  const delta = newQ - oldQ;
  if (delta > 0) { if (e.qtd < delta) return false; e.qtd -= delta; } else { e.qtd += -delta; }
  return true;
}

// editar item existente OU criar item personalizado (item = null)
function editItemSheet(o, item, tipoNovo) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  const novo = !item;
  let tmp = novo ? { tipo: tipoNovo || 'servico', desc: '', valor: 0, qtd: 1, custo: 0 } : item;
  let q = tmp.qtd;
  const draw = () => {
    body.innerHTML = `<div class="grab"></div><h3>${novo ? 'Item personalizado' : 'Editar item'}</h3>
      ${novo ? `<div class="seg"><button data-t="peca" class="${tmp.tipo === 'peca' ? 'on' : ''}">Peça</button><button data-t="servico" class="${tmp.tipo === 'servico' ? 'on' : ''}">Serviço</button></div>` : ''}
      <div class="field"><label>Descrição</label><input id="i-desc" placeholder="Ex.: Sangria do sistema de freio" value="${tmp.desc || ''}"></div>
      <div class="row-2"><div class="field"><label>Valor unitário (R$)</label><input id="i-val" inputmode="numeric" value="${(tmp.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}"></div><div class="field"><label>Quantidade</label><div class="disc-input" style="margin-top:0;padding:6px 8px"><div class="qty-stepper" style="width:100%;justify-content:space-between"><button id="i-qd">−</button><span class="qn" id="i-qn">${q}</span><button id="i-qi">+</button></div></div></div></div>
      ${item && item.estoqueId ? `<div class="hint-line">Vinculado ao estoque — mudar a quantidade ajusta a baixa.</div>` : ''}
      <button class="btn primary" id="i-save">${novo ? 'Adicionar à OS' : 'Salvar'}</button>
      ${novo ? '' : `<button class="btn line" id="i-del" style="margin-top:4px;color:var(--red)">Remover item</button>`}`;
    if (novo) body.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tmp.tipo = b.dataset.t; draw(); });
    maskMoney(body.querySelector('#i-val'));
    body.querySelector('#i-qi').onclick = () => { q++; body.querySelector('#i-qn').textContent = q; };
    body.querySelector('#i-qd').onclick = () => { if (q > 1) { q--; body.querySelector('#i-qn').textContent = q; } };
    body.querySelector('#i-save').onclick = () => {
      const desc = body.querySelector('#i-desc').value.trim(); if (!desc) return toast('Informe a descrição');
      const valor = parseMoneyBR(body.querySelector('#i-val').value);
      if (novo) { o.itens.push({ tipo: tmp.tipo, desc, valor, qtd: q, custo: 0 }); }
      else { if (!ajustaEstoque(item, item.qtd, q)) return toast('Sem estoque para essa quantidade'); item.desc = desc; item.valor = valor; item.qtd = q; }
      save(); backdrop.hidden = true; render();
    };
    const del = body.querySelector('#i-del');
    if (del) del.onclick = () => { if (item.estoqueId) ajustaEstoque(item, item.qtd, 0); o.itens = o.itens.filter(x => x !== item); save(); backdrop.hidden = true; render(); };
  };
  draw();
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
}

// ---------- nova OS ----------
function startNova(clienteId, veiculoId) { draft = { clienteId: clienteId || null, veiculoId: veiculoId || null }; go('nova'); }

function scrNova(s) {
  const cli = draft.clienteId ? clienteById(draft.clienteId) : null;

  // ---- passo 1: cliente ----
  s.append(el(`<div class="section-label">Cliente</div>`));
  if (!cli) {
    const busca = el(`<div class="searchbar"><span class="si">${ICON.search}</span><input id="cli-q" placeholder="Buscar cliente por nome ou telefone"></div>`);
    s.append(busca);
    const novo = el(`<button class="add-item-line" style="margin-bottom:10px">${ICON.plus} Novo cliente</button>`);
    novo.onclick = () => novoClienteSheet();
    s.append(novo);
    const lista = el(`<div id="cli-lista"></div>`);
    s.append(lista);
    const draw = () => {
      lista.innerHTML = '';
      const q = (busca.querySelector('#cli-q').value || '').trim().toLowerCase();
      const arr = [...state.clientes].filter(c => !q || (c.nome + ' ' + c.telefone).toLowerCase().includes(q)).sort((a, b) => a.nome.localeCompare(b.nome));
      if (!arr.length) lista.append(el(`<div class="hint-line">Nenhum cliente. Cadastre um novo.</div>`));
      arr.forEach(c => {
        const row = el(`<div class="menu-row"><div class="mi">${ICON.users}</div><div class="mt"><b>${c.nome}</b><small>${fmtTelefone(c.telefone)} · ${c.veiculos.length} veículo${c.veiculos.length !== 1 ? 's' : ''}</small></div><div class="arrow">›</div></div>`);
        row.onclick = () => { draft.clienteId = c.id; draft.veiculoId = c.veiculos.length === 1 ? c.veiculos[0].id : null; render(); };
        lista.append(row);
      });
    };
    busca.querySelector('#cli-q').addEventListener('input', draw);
    draw();
    const cancel = el(`<button class="btn line" style="margin-top:8px">cancelar</button>`);
    cancel.onclick = () => go('baia');
    s.append(cancel);
    return;
  }

  // cliente escolhido
  const card = el(`<div class="picked"><div class="pk-info"><b>${cli.nome}</b><small>${fmtTelefone(cli.telefone)}${cli.cpfCnpj ? ' · ' + cli.cpfCnpj : ''}</small></div><button class="pk-change">trocar</button></div>`);
  card.querySelector('.pk-change').onclick = () => { draft.clienteId = null; draft.veiculoId = null; render(); };
  s.append(card);

  // ---- passo 2: veículo ----
  s.append(el(`<div class="section-label mt">Veículo</div>`));
  cli.veiculos.forEach(v => {
    const sel = draft.veiculoId === v.id;
    const row = el(`<div class="veh-row ${sel ? 'sel' : ''}"><div class="veh-plate">${fmtPlaca(v.placa)}</div><div class="veh-info"><b>${v.marca} ${v.modelo}</b><small>${v.ano || ''}${v.km ? ' · ' + v.km.toLocaleString('pt-BR') + ' km' : ''}</small></div>${sel ? `<span class="veh-check">${ICON.check}</span>` : ''}</div>`);
    row.onclick = () => { draft.veiculoId = v.id; render(); };
    s.append(row);
  });
  const novoV = el(`<button class="add-item-line" style="margin-top:2px">${ICON.plus} Novo veículo</button>`);
  novoV.onclick = () => novoVeiculoSheet(cli);
  s.append(novoV);

  const criar = el(`<button class="btn primary" style="margin-top:16px" ${draft.veiculoId ? '' : 'disabled'}>${ICON.plus} Criar ordem de serviço</button>`);
  criar.onclick = () => {
    const v = cli.veiculos.find(x => x.id === draft.veiculoId); if (!v) return toast('Escolha o veículo');
    const os = Object.assign({
      id: uid('os'), clienteId: cli.id, cliente: cli.nome, telefone: cli.telefone, cpfCnpj: cli.cpfCnpj, endereco: enderecoStr(cli.endereco, cli.cep), tecnico: state.oficina.tecnico || '',
      veiculoId: v.id, placa: v.placa, veiculo: { marca: v.marca, modelo: v.modelo, ano: v.ano, km: v.km },
      itens: [], fotos: [], checklist: {}, obs: '', desconto: 0, status: 'orcamento', createdAt: Date.now(), aprovadoAt: null, entregueAt: null,
    });
    state.os.push(os); save(); go('detalhe', os.id); toast('OS criada — adicione os itens');
  };
  s.append(criar);
}

function novoClienteSheet(onSaved) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  body.innerHTML = `<div class="grab"></div><h3>Novo cliente</h3>
    <div class="field"><label>Nome</label><input id="n-nome" placeholder="Nome do cliente"></div>
    <div class="row-2"><div class="field"><label>WhatsApp</label><input id="n-tel" inputmode="numeric" placeholder="(19) 99999-0000"></div><div class="field"><label>CPF ou CNPJ</label><input id="n-doc" inputmode="numeric" placeholder="000.000.000-00"></div></div>
    <div class="field"><label>CEP</label><input id="n-cep" inputmode="numeric" placeholder="00000-000"></div>
    <div id="n-cep-hint" class="hint-line" style="margin-top:-6px;display:none"></div>
    <div class="row-2"><div class="field" style="flex:2"><label>Rua</label><input id="n-rua"></div><div class="field"><label>Número</label><input id="n-num" inputmode="numeric"></div></div>
    <div class="row-3"><div class="field"><label>Bairro</label><input id="n-bairro"></div><div class="field"><label>Cidade</label><input id="n-cidade"></div><div class="field"><label>UF</label><input id="n-uf" maxlength="2"></div></div>
    <button class="btn primary" id="n-save">Cadastrar cliente</button><button class="btn line" id="n-cancel" style="margin-top:4px">cancelar</button>`;
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
  maskPhone(body.querySelector('#n-tel')); maskCpfCnpj(body.querySelector('#n-doc')); maskCep(body.querySelector('#n-cep'));
  const cepEl = body.querySelector('#n-cep'); const hint = body.querySelector('#n-cep-hint');
  cepEl.addEventListener('input', async () => {
    if (cepEl.value.replace(/\D/g, '').length !== 8) return;
    hint.style.display = 'block'; hint.textContent = 'Buscando endereço…';
    const end = await buscaCep(cepEl.value);
    if (end) { body.querySelector('#n-rua').value = end.rua; body.querySelector('#n-bairro').value = end.bairro; body.querySelector('#n-cidade').value = end.cidade; body.querySelector('#n-uf').value = end.uf; hint.textContent = '✓ Endereço preenchido pelo CEP'; body.querySelector('#n-num').focus(); }
    else hint.textContent = 'CEP não encontrado — preencha manualmente';
  });
  body.querySelector('#n-cancel').onclick = () => backdrop.hidden = true;
  body.querySelector('#n-save').onclick = () => {
    const nome = body.querySelector('#n-nome').value.trim(); if (!nome) return toast('Informe o nome');
    const c = { id: uid('cli'), nome, telefone: body.querySelector('#n-tel').value.replace(/\D/g, ''), cpfCnpj: body.querySelector('#n-doc').value.trim(), cep: body.querySelector('#n-cep').value.trim(), endereco: { rua: body.querySelector('#n-rua').value.trim(), numero: body.querySelector('#n-num').value.trim(), bairro: body.querySelector('#n-bairro').value.trim(), cidade: body.querySelector('#n-cidade').value.trim(), uf: body.querySelector('#n-uf').value.trim().toUpperCase() }, veiculos: [] };
    state.clientes.push(c); save(); backdrop.hidden = true;
    if (onSaved) onSaved(c); else { draft.clienteId = c.id; draft.veiculoId = null; render(); }
    toast('Cliente cadastrado');
  };
}

function novoVeiculoSheet(cli, onSaved) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  body.innerHTML = `<div class="grab"></div><h3>Novo veículo</h3>
    <div class="field plate"><label>Placa</label><input id="v-placa" maxlength="8" placeholder="ABC-1D23" autocomplete="off"></div>
    <div class="row-2"><div class="field"><label>Marca</label><input id="v-marca" placeholder="VW"></div><div class="field"><label>Modelo</label><input id="v-modelo" placeholder="Gol 1.6"></div></div>
    <div class="row-2"><div class="field"><label>Ano</label><input id="v-ano" inputmode="numeric" placeholder="2014"></div><div class="field"><label>KM atual</label><input id="v-km" inputmode="numeric" placeholder="80000"></div></div>
    <div id="v-hint"></div>
    <button class="btn primary" id="v-save">Adicionar veículo</button><button class="btn line" id="v-cancel" style="margin-top:4px">cancelar</button>`;
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
  const placaEl = body.querySelector('#v-placa');
  placaEl.addEventListener('input', () => {
    const raw = placaEl.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7); placaEl.value = fmtPlaca(raw);
    const hit = PLACAS[raw]; const hint = body.querySelector('#v-hint');
    if (hit) { body.querySelector('#v-marca').value = hit.marca; body.querySelector('#v-modelo').value = hit.modelo; body.querySelector('#v-ano').value = hit.ano; hint.innerHTML = `<div class="approval-note">${ICON.checkc} ${hit.marca} ${hit.modelo} ${hit.ano} identificado pela placa</div>`; } else hint.innerHTML = '';
  });
  body.querySelector('#v-cancel').onclick = () => backdrop.hidden = true;
  body.querySelector('#v-save').onclick = () => {
    const placa = placaEl.value.replace(/[^A-Z0-9]/g, ''); if (placa.length < 7) return toast('Informe a placa completa');
    const v = { id: uid('v'), placa, marca: body.querySelector('#v-marca').value.trim() || '—', modelo: body.querySelector('#v-modelo').value.trim() || '—', ano: +body.querySelector('#v-ano').value || '', km: +body.querySelector('#v-km').value || 0 };
    cli.veiculos.push(v); save(); backdrop.hidden = true;
    if (onSaved) onSaved(v); else { draft.veiculoId = v.id; render(); }
    toast('Veículo adicionado');
  };
}

// ---------- histórico por placa ----------
function scrPlaca(s) {
  s.append(el(`<div class="field plate"><input id="p-search" maxlength="8" placeholder="DIGITE A PLACA" autocomplete="off"></div>`));
  const results = el(`<div id="p-res"></div>`); s.append(results);
  const draw = placa => {
    results.innerHTML = '';
    const raw = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (raw.length < 3) {
      results.append(el(`<div class="timeline-note">Digite a placa para ver todo o histórico do veículo — em qualquer OS, de qualquer cliente.</div>`));
      [...new Set(state.os.map(o => o.placa))].forEach(p => {
        const arr = state.os.filter(o => o.placa === p);
        const chip = el(`<div class="os-card"><div class="plate">${fmtPlaca(p)}</div><div class="info"><div class="veic">${arr[0].veiculo.marca} ${arr[0].veiculo.modelo}</div><div class="meta">${arr.length} serviço${arr.length > 1 ? 's' : ''}</div></div><div class="right"></div></div>`);
        chip.onclick = () => { $('#p-search').value = fmtPlaca(p); draw(p); };
        results.append(chip);
      });
      return;
    }
    const arr = state.os.filter(o => o.placa.startsWith(raw)).sort((a, b) => b.createdAt - a.createdAt);
    if (!arr.length) { results.append(emptyState('Nenhum serviço nessa placa ainda.')); return; }
    const v = arr[0].veiculo, total = arr.reduce((a, o) => a + osFinal(o), 0);
    results.append(el(`<div class="hist-plate"><div class="p">${fmtPlaca(arr[0].placa)}</div><div class="s">${v.marca} ${v.modelo} · ${arr.length} serviço${arr.length > 1 ? 's' : ''} · ${moneyV(total)} no total</div></div>`));
    arr.forEach(o => { const d = new Date(o.createdAt); const c = osCard(o); c.querySelector('.meta').textContent = `${d.toLocaleDateString('pt-BR')} · ${o.veiculo.km ? o.veiculo.km.toLocaleString('pt-BR') + ' km' : ''}`; results.append(c); });
    results.append(el(`<div class="banner"><b>O histórico é do carro, não do cliente.</b> Um veículo com histórico documentado vale mais na revenda — e o dono tem motivo para voltar sempre à sua oficina.</div>`));
  };
  $('#p-res').previousSibling;
  s.querySelector('#p-search').addEventListener('input', e => { e.target.value = fmtPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)); draw(e.target.value); });
  draw('');
}

// ---------- estoque ----------
function scrEstoque(s) {
  const low = state.estoque.filter(e => e.qtd <= e.min);
  if (low.length) s.append(el(`<div class="sim-note" style="background:#FDECEA;border-color:#F5C6C0;color:var(--red);margin-bottom:12px"><b>${low.length} ${low.length > 1 ? 'peças precisam' : 'peça precisa'} de reposição.</b> Abaixo do estoque mínimo.</div>`));
  s.append(el(`<div class="section-label">Peças cadastradas · ${state.estoque.length}</div>`));
  state.estoque.forEach(e => {
    const lowCls = e.qtd <= e.min ? 'low' : 'ok';
    const row = el(`<div class="stock-row">
      <div class="qtybadge ${lowCls}">${e.qtd}<small>em estoque</small></div>
      <div class="sname"><b>${e.nome}</b><small>custo ${money(e.custo)} · venda ${money(e.preco)}${e.qtd <= e.min ? ' · <span class="low-alert">MÍN ' + e.min + '</span>' : ''}</small></div>
      <div class="stepper"><button data-dec>−</button><button data-inc>+</button></div></div>`);
    row.querySelector('[data-dec]').onclick = () => { if (e.qtd > 0) { e.qtd--; save(); render(); } };
    row.querySelector('[data-inc]').onclick = () => { e.qtd++; save(); render(); };
    s.append(row);
  });
  const add = el(`<button class="add-item-line" style="margin-top:6px">${ICON.plus} cadastrar nova peça</button>`);
  add.onclick = () => addEstoqueSheet();
  s.append(add);
  s.append(el(`<div class="sim-note">Quando você adiciona uma peça do estoque a uma OS, a baixa é <b>automática</b>. O catálogo de fornecedores é de exemplo — a integração real (ex.: Fraga) é comercial.</div>`));
}
function addEstoqueSheet() {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  body.innerHTML = `<div class="grab"></div><h3>Cadastrar peça</h3>
    <div class="field"><label>Nome da peça</label><input id="e-nome" placeholder="Ex.: Vela de ignição"></div>
    <div class="row-3"><div class="field"><label>Qtd</label><input id="e-qtd" inputmode="numeric" value="1"></div><div class="field"><label>Mínimo</label><input id="e-min" inputmode="numeric" value="1"></div><div class="field"><label>Venda R$</label><input id="e-preco" inputmode="numeric" value=""></div></div>
    <div class="field"><label>Custo R$ (opcional)</label><input id="e-custo" inputmode="numeric" value=""></div>
    <button class="btn primary" id="e-save">Cadastrar</button><button class="btn line" id="e-cancel" style="margin-top:4px">cancelar</button>`;
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
  maskMoney(body.querySelector('#e-preco')); maskMoney(body.querySelector('#e-custo'));
  body.querySelector('#e-cancel').onclick = () => backdrop.hidden = true;
  body.querySelector('#e-save').onclick = () => {
    const nome = body.querySelector('#e-nome').value.trim(); if (!nome) return toast('Informe o nome');
    state.estoque.push({ id: uid('e'), nome, qtd: +body.querySelector('#e-qtd').value || 0, min: +body.querySelector('#e-min').value || 0, preco: parseMoneyBR(body.querySelector('#e-preco').value), custo: parseMoneyBR(body.querySelector('#e-custo').value) });
    save(); backdrop.hidden = true; render(); toast('Peça cadastrada');
  };
}

// ---------- financeiro ----------
function scrFinanceiro(s) {
  const now = new Date();
  const curKey = now.getFullYear() * 12 + now.getMonth();
  const keyOf = ts => { const d = new Date(ts); return d.getFullYear() * 12 + d.getMonth(); };
  const entregues = state.os.filter(o => o.entregueAt);
  const mesEntregas = entregues.filter(o => keyOf(o.entregueAt) === curKey);
  const receita = mesEntregas.reduce((a, o) => a + osFinal(o), 0);
  const custo = mesEntregas.reduce((a, o) => a + osCusto(o), 0);
  const despesas = state.despesasMensais || 0;
  const lucro = receita - custo - despesas;
  const ticket = mesEntregas.length ? receita / mesEntregas.length : 0;
  const aReceber = state.os.filter(o => o.status === 'aprovado' || o.status === 'execucao').reduce((a, o) => a + osFinal(o), 0);
  const receitaPrev = entregues.filter(o => keyOf(o.entregueAt) === curKey - 1).reduce((a, o) => a + osFinal(o), 0);
  const varPct = receitaPrev > 0 ? Math.round((receita - receitaPrev) / receitaPrev * 100) : null;
  const mesNome = now.toLocaleDateString('pt-BR', { month: 'long' });
  // composição peças x mão de obra (das entregas do mês)
  let recPecas = 0, recServ = 0;
  mesEntregas.forEach(o => o.itens.forEach(i => { const v = i.valor * i.qtd; if (i.tipo === 'peca') recPecas += v; else recServ += v; }));
  const recItens = recPecas + recServ || 1;

  // hero: faturamento do mês + comparação
  const hero = el(`<div class="fin-hero"><div class="lbl">Faturamento em ${mesNome}</div><div class="big">${moneyV(receita)}</div></div>`);
  if (varPct !== null) hero.append(el(`<div class="metric-var ${varPct >= 0 ? 'up' : 'down'}">${varPct >= 0 ? '▲' : '▼'} ${Math.abs(varPct)}% vs. mês anterior (${moneyV(receitaPrev)})</div>`));
  else hero.append(el(`<div class="sub">${mesEntregas.length} serviço${mesEntregas.length !== 1 ? 's' : ''} entregue${mesEntregas.length !== 1 ? 's' : ''}</div>`));
  s.append(hero);

  // lucro + ticket
  const grid1 = el(`<div class="fin-grid"></div>`);
  grid1.append(
    el(`<div class="fin-card"><div class="v ${lucro < 0 ? 'red' : 'teal'}">${moneyV(lucro)}</div><div class="k">lucro do mês (após peças e despesas)</div></div>`),
    el(`<div class="fin-card"><div class="v">${moneyV(ticket)}</div><div class="k">ticket médio · ${mesEntregas.length} serviço${mesEntregas.length !== 1 ? 's' : ''}</div></div>`),
  );
  s.append(grid1);

  // despesas fixas (editável) — o que torna o lucro real
  const exp = el(`<div class="exp-card" style="margin-top:10px"><div class="el">Despesas fixas do mês<b>aluguel, salários, contas, etc.</b></div><div class="ev">${moneyV(despesas)} ${ICON.edit}</div></div>`);
  exp.onclick = () => editDespesasSheet();
  s.append(exp);

  // detalhamento
  const grid2 = el(`<div class="fin-grid" style="margin-top:10px"></div>`);
  grid2.append(
    el(`<div class="fin-card"><div class="v">${moneyV(custo)}</div><div class="k">custo de peças no mês</div></div>`),
    el(`<div class="fin-card"><div class="v">${moneyV(aReceber)}</div><div class="k">a receber (OS em aberto)</div></div>`),
  );
  s.append(grid2);

  // composição peças x mão de obra
  s.append(el(`<div class="section-label mt">Composição da receita</div>`));
  const pPct = Math.round(recPecas / recItens * 100);
  const comp = el(`<div class="comp-bar"></div>`);
  if (recPecas > 0) comp.append(el(`<div class="comp-seg pecas" style="width:${pPct}%">${pPct >= 12 ? pPct + '%' : ''}</div>`));
  if (recServ > 0) comp.append(el(`<div class="comp-seg serv" style="width:${100 - pPct}%">${100 - pPct >= 12 ? (100 - pPct) + '%' : ''}</div>`));
  s.append(comp);
  s.append(el(`<div class="comp-legend"><span><span class="dot p"></span>Peças ${moneyV(recPecas)}</span><span><span class="dot s"></span>Mão de obra ${moneyV(recServ)}</span></div>`));

  // gráfico 6 meses
  s.append(el(`<div class="section-label mt">Faturamento — últimos 6 meses</div>`));
  const meses = [];
  for (let i = 5; i >= 0; i--) { const k = curKey - i; const val = entregues.filter(o => keyOf(o.entregueAt) === k).reduce((a, o) => a + osFinal(o), 0); const d = new Date(now.getFullYear(), now.getMonth() - i, 1); meses.push({ label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), val, atual: i === 0 }); }
  const maxV = Math.max(1, ...meses.map(m => m.val));
  const chart = el(`<div class="barchart"></div>`);
  meses.forEach(m => {
    const bval = state.ocultar ? '•••' : (m.val ? (m.val >= 1000 ? (m.val / 1000).toFixed(1).replace('.0', '') + 'k' : Math.round(m.val)) : '');
    const col = el(`<div class="barcol ${m.atual ? 'atual' : ''}"><div class="bval">${bval}</div><div class="bwrap"><div class="bar" style="height:${Math.round(m.val / maxV * 100)}%"></div></div><div class="blbl">${m.label}</div></div>`);
    chart.append(col);
  });
  s.append(chart);

  // últimas entregas
  s.append(el(`<div class="section-label mt">Últimas entregas</div>`));
  const entregas = [...state.os].filter(o => o.status === 'entregue').sort((a, b) => b.entregueAt - a.entregueAt).slice(0, 6);
  if (!entregas.length) s.append(el(`<div class="hint-line">Nenhuma entrega ainda.</div>`));
  entregas.forEach(o => { const c = osCard(o); const d = new Date(o.entregueAt); c.querySelector('.meta').textContent = `${o.cliente} · ${d.toLocaleDateString('pt-BR')}`; c.onclick = () => go('detalhe', o.id); s.append(c); });
  s.append(el(`<div class="sim-note">Números calculados das suas OS entregues. <b>Lucro = faturamento − custo de peças − despesas fixas.</b> A mão de obra entra cheia; ajuste as despesas para o número ficar real.</div>`));
}

function editDespesasSheet() {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  body.innerHTML = `<div class="grab"></div><h3>Despesas fixas do mês</h3>
    <div class="hint-line" style="margin-top:0">Some aluguel, salários, água, luz, internet e o que mais for fixo. Entra no cálculo do lucro do mês.</div>
    <div class="field"><label>Total de despesas fixas (R$)</label><input id="d-val" inputmode="numeric" value="${(state.despesasMensais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}"></div>
    <button class="btn primary" id="d-save">Salvar</button><button class="btn line" id="d-cancel" style="margin-top:4px">cancelar</button>`;
  backdrop.hidden = false;
  backdrop.onclick = e => { if (e.target === backdrop) backdrop.hidden = true; };
  maskMoney(body.querySelector('#d-val'));
  body.querySelector('#d-cancel').onclick = () => backdrop.hidden = true;
  body.querySelector('#d-save').onclick = () => { state.despesasMensais = parseMoneyBR(body.querySelector('#d-val').value); save(); backdrop.hidden = true; render(); toast('Despesas atualizadas'); };
}

// ---------- retornos ----------
function scrRetornos(s) {
  const INTERV = 180 * 86400000; // 6 meses
  const porPlaca = {};
  state.os.filter(o => o.entregueAt).forEach(o => { if (!porPlaca[o.placa] || o.entregueAt > porPlaca[o.placa].entregueAt) porPlaca[o.placa] = o; });
  const hoje = Date.now();
  const lista = Object.values(porPlaca).map(o => ({ o, prox: o.entregueAt + INTERV })).sort((a, b) => a.prox - b.prox);

  s.append(el(`<div class="timeline-note">Clientes com revisão prevista para os próximos meses, a partir do último serviço. Um toque manda o lembrete no WhatsApp.</div>`));
  if (!lista.length) { s.append(emptyState('Nenhum veículo entregue ainda.')); return; }
  lista.forEach(({ o, prox }) => {
    const dias = Math.round((prox - hoje) / 86400000);
    const venc = dias <= 0;
    const chipTxt = venc ? `atrasado ${Math.abs(dias)} d` : `em ${dias} d`;
    const chipCls = venc ? 'execucao' : (dias < 30 ? 'aprovado' : 'orcamento');
    const card = el(`<div class="os-card"><div class="plate">${fmtPlaca(o.placa)}</div><div class="info"><div class="veic">${o.veiculo.marca} ${o.veiculo.modelo}</div><div class="meta">${o.cliente} · revisão ${new Date(prox).toLocaleDateString('pt-BR')}</div></div><div class="right"><span class="chip ${chipCls}">${chipTxt}</span></div></div>`);
    card.onclick = () => {
      const txt = `Olá ${o.cliente.split(' ')[0]}! Aqui é da *${state.oficina.nome}*. O seu ${o.veiculo.marca} ${o.veiculo.modelo} (${fmtPlaca(o.placa)}) está chegando na época da revisão. Quer agendar? 🔧`;
      window.open(`https://wa.me/${o.telefone}?text=${encodeURIComponent(txt)}`, '_blank'); toast('Abrindo lembrete no WhatsApp…');
    };
    s.append(card);
  });
  s.append(el(`<div class="sim-note">O intervalo padrão é de 6 meses a partir da última entrega. No produto real dá para ajustar por tipo de serviço (óleo, correia, freios) e por quilometragem.</div>`));
}

// ---------- config / minha oficina ----------
function scrConfig(s) {
  const o = state.oficina;
  const form = el(`<div>
    <div class="section-label">Logo (aparece na OS em PDF)</div>
    <div class="logo-row"><div class="logo-prev" id="c-logo-prev">${o.logo ? `<img src="${o.logo}">` : ICON.wrench}</div><div class="logo-btns"><button class="btn ghost sm" id="c-logo-up">${ICON.camera} Enviar logo</button>${o.logo ? `<button class="btn line sm" id="c-logo-rm" style="color:var(--red)">remover</button>` : ''}</div></div>
    <div class="section-label mt">Dados da oficina</div>
    <div class="field"><label>Nome da oficina</label><input id="c-nome" value="${o.nome || ''}"></div>
    <div class="field"><label>CNPJ</label><input id="c-cnpj" inputmode="numeric" placeholder="00.000.000/0000-00" value="${o.cnpj || ''}"></div>
    <div class="field"><label>Endereço (aparece na OS)</label><input id="c-end" placeholder="Rua, nº · Cidade/UF" value="${o.endereco || ''}"></div>
    <div class="row-2"><div class="field"><label>Cidade / UF (cabeçalho)</label><input id="c-cidade" value="${o.cidade || ''}"></div><div class="field"><label>WhatsApp</label><input id="c-tel" inputmode="numeric" value="${o.telefone ? fmtTelefone(o.telefone) : ''}"></div></div>
    <div class="row-2"><div class="field"><label>E-mail</label><input id="c-email" value="${o.email || ''}"></div><div class="field"><label>Técnico responsável</label><input id="c-tec" value="${o.tecnico || ''}"></div></div>
    <button class="btn primary" id="c-save">Salvar</button>
    <div class="cfg-actions">
      <div class="section-label">Certificado digital (nota fiscal)</div>
      <div class="sim-note" style="margin-bottom:12px"><span class="sim-badge">${ICON.invoice} não conectado</span><br><br>Para emitir NFS-e de verdade, aqui você enviaria o <b>certificado digital A1</b> da oficina e conectaríamos ao Emissor Nacional. Não disponível nesta versão de demonstração.</div>
      <div class="section-label">Backup dos dados</div>
      <div class="sim-note" style="margin-bottom:10px">Enquanto não há nuvem, seus dados vivem só neste navegador. <b>Exporte um backup</b> de vez em quando para não perder nada.</div>
      <button class="btn ghost" id="c-export">${ICON.download} Exportar backup (.json)</button>
      <button class="btn line" id="c-import" style="margin-top:6px">Importar backup</button>
      <div class="section-label mt">Dados</div>
      <button class="btn line" id="c-reset" style="color:var(--steel)">Recomeçar com dados de exemplo</button>
      <button class="btn line" id="c-help" style="margin-top:4px">Ver como o app funciona</button>
    </div></div>`);
  s.append(form);
  maskPhone(form.querySelector('#c-tel'));
  form.querySelector('#c-logo-up').onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const img = new Image(); img.onload = () => { const max = 240, sc = Math.min(1, max / Math.max(img.width, img.height)); const cv = document.createElement('canvas'); cv.width = img.width * sc; cv.height = img.height * sc; cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); o.logo = cv.toDataURL('image/png'); save(); render(); toast('Logo enviada'); }; img.src = r.result; }; r.readAsDataURL(f); };
    inp.click();
  };
  const rm = form.querySelector('#c-logo-rm'); if (rm) rm.onclick = () => { o.logo = ''; save(); render(); toast('Logo removida'); };
  form.querySelector('#c-export').onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'oficina-pro-backup.json'; a.click(); URL.revokeObjectURL(url);
    toast('Backup exportado');
  };
  form.querySelector('#c-import').onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const data = JSON.parse(r.result); if (!data.os || !data.oficina) throw 0; state = data; state.onboarded = true; save(); go('baia'); toast('Backup importado'); } catch (e) { toast('Arquivo inválido'); } }; r.readAsText(f); };
    inp.click();
  };
  form.querySelector('#c-save').onclick = () => {
    o.nome = form.querySelector('#c-nome').value.trim() || o.nome;
    o.cidade = form.querySelector('#c-cidade').value.trim(); o.telefone = form.querySelector('#c-tel').value.replace(/\D/g, ''); o.cnpj = form.querySelector('#c-cnpj').value.trim();
    o.endereco = form.querySelector('#c-end').value.trim(); o.email = form.querySelector('#c-email').value.trim(); o.tecnico = form.querySelector('#c-tec').value.trim();
    save(); toast('Dados salvos'); render();
  };
  form.querySelector('#c-reset').onclick = () => { if (confirm('Isto apaga tudo e recarrega os dados de exemplo. Continuar?')) { state = seed(); state.onboarded = true; save(); go('baia'); toast('Dados de exemplo recarregados'); } };
  form.querySelector('#c-help').onclick = () => go('ajuda');
}

// ---------- mais ----------
function scrMais(s) {
  const items = [
    ['clientes', ICON.users, 'Clientes', 'Cadastro, veículos e histórico'],
    ['financeiro', ICON.chart, 'Financeiro', 'Receita, margem e a receber'],
    ['retornos', ICON.calendar, 'Retorno de clientes', 'Quem está na época da revisão'],
    ['placa', ICON.plate, 'Histórico por placa', 'Todo o serviço já feito no carro'],
    ['config', ICON.cog, 'Minha oficina', 'Logo, cadastro, nota fiscal e dados'],
    ['ajuda', ICON.help, 'Como o app funciona', 'O que é real e o que é demonstração'],
  ];
  items.forEach(([r, ic, t, d]) => { const row = el(`<div class="menu-row"><div class="mi">${ic}</div><div class="mt"><b>${t}</b><small>${d}</small></div><div class="arrow">›</div></div>`); row.onclick = () => go(r); s.append(row); });
  s.append(el(`<div class="sim-note">Oficina Pro · versão de demonstração. Os dados ficam salvos só neste navegador.</div>`));
}

// ---------- clientes ----------
function scrClientes(s) {
  const novo = el(`<button class="btn primary" style="margin-bottom:12px">${ICON.plus} Novo cliente</button>`);
  novo.onclick = () => novoClienteSheet(c => go('cliente', c.id));
  s.append(novo);
  const busca = el(`<div class="searchbar"><span class="si">${ICON.search}</span><input id="cl-q" placeholder="Buscar por nome ou telefone"></div>`);
  s.append(busca);
  const lista = el(`<div id="cl-lista"></div>`); s.append(lista);
  const draw = () => {
    lista.innerHTML = '';
    const q = (busca.querySelector('#cl-q').value || '').trim().toLowerCase();
    const arr = [...state.clientes].filter(c => !q || (c.nome + ' ' + c.telefone).toLowerCase().includes(q)).sort((a, b) => a.nome.localeCompare(b.nome));
    lista.append(el(`<div class="section-label">${arr.length} cliente${arr.length !== 1 ? 's' : ''}</div>`));
    if (!arr.length) lista.append(emptyState('Nenhum cliente cadastrado.'));
    arr.forEach(c => {
      const nOS = state.os.filter(o => o.clienteId === c.id).length;
      const row = el(`<div class="menu-row"><div class="mi">${ICON.users}</div><div class="mt"><b>${c.nome}</b><small>${fmtTelefone(c.telefone)} · ${c.veiculos.length} veículo${c.veiculos.length !== 1 ? 's' : ''}${nOS ? ' · ' + nOS + ' OS' : ''}</small></div><div class="arrow">›</div></div>`);
      row.onclick = () => go('cliente', c.id);
      lista.append(row);
    });
  };
  busca.querySelector('#cl-q').addEventListener('input', draw);
  draw();
}

function scrCliente(s) {
  const c = clienteById(route.param);
  if (!c) { go('clientes'); return; }
  const end = enderecoStr(c.endereco, c.cep);
  const head = el(`<div class="detail-head" style="padding:18px">
    <div class="row1"><b style="font-size:18px">${c.nome}</b><button class="head-edit">${ICON.edit}</button></div>
    <div class="cli-lines">
      <div>${ICON.wpp}<span>${fmtTelefone(c.telefone) || '—'}</span></div>
      ${c.cpfCnpj ? `<div>${ICON.invoice}<span>${c.cpfCnpj}</span></div>` : ''}
      ${end ? `<div>${ICON.mapPin}<span>${end}</span></div>` : ''}
    </div></div>`);
  head.querySelector('.head-edit').onclick = () => editClienteSheet(c);
  s.append(head);

  s.append(el(`<div class="section-label">Veículos · ${c.veiculos.length}</div>`));
  c.veiculos.forEach(v => {
    const nOS = state.os.filter(o => o.veiculoId === v.id).length;
    const row = el(`<div class="veh-row"><div class="veh-plate">${fmtPlaca(v.placa)}</div><div class="veh-info"><b>${v.marca} ${v.modelo}</b><small>${v.ano || ''}${v.km ? ' · ' + v.km.toLocaleString('pt-BR') + ' km' : ''}${nOS ? ' · ' + nOS + ' OS' : ''}</small></div><button class="veh-os">${ICON.plus} OS</button></div>`);
    row.querySelector('.veh-os').onclick = e => { e.stopPropagation(); startNova(c.id, v.id); };
    row.onclick = () => { go('placa'); setTimeout(() => { const inp = document.querySelector('#p-search'); if (inp) { inp.value = fmtPlaca(v.placa); inp.dispatchEvent(new Event('input')); } }, 30); };
    s.append(row);
  });
  const addV = el(`<button class="add-item-line" style="margin-top:2px">${ICON.plus} Adicionar veículo</button>`);
  addV.onclick = () => novoVeiculoSheet(c);
  s.append(addV);

  const osCli = state.os.filter(o => o.clienteId === c.id).sort((a, b) => b.createdAt - a.createdAt);
  if (osCli.length) {
    s.append(el(`<div class="section-label mt">Ordens de serviço · ${osCli.length}</div>`));
    osCli.slice(0, 8).forEach(o => s.append(osCard(o)));
  }
}

function editClienteSheet(c) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  const e = c.endereco || {};
  body.innerHTML = `<div class="grab"></div><h3>Editar cliente</h3>
    <div class="field"><label>Nome</label><input id="e-nome" value="${c.nome || ''}"></div>
    <div class="row-2"><div class="field"><label>WhatsApp</label><input id="e-tel" inputmode="numeric" value="${c.telefone ? fmtTelefone(c.telefone) : ''}"></div><div class="field"><label>CPF ou CNPJ</label><input id="e-doc" inputmode="numeric" value="${c.cpfCnpj || ''}"></div></div>
    <div class="field"><label>CEP</label><input id="e-cep" inputmode="numeric" value="${c.cep || ''}"></div>
    <div id="e-cep-hint" class="hint-line" style="margin-top:-6px;display:none"></div>
    <div class="row-2"><div class="field" style="flex:2"><label>Rua</label><input id="e-rua" value="${e.rua || ''}"></div><div class="field"><label>Número</label><input id="e-num" inputmode="numeric" value="${e.numero || ''}"></div></div>
    <div class="row-3"><div class="field"><label>Bairro</label><input id="e-bairro" value="${e.bairro || ''}"></div><div class="field"><label>Cidade</label><input id="e-cidade" value="${e.cidade || ''}"></div><div class="field"><label>UF</label><input id="e-uf" maxlength="2" value="${e.uf || ''}"></div></div>
    <button class="btn primary" id="e-save">Salvar</button><button class="btn line" id="e-cancel" style="margin-top:4px">cancelar</button>`;
  backdrop.hidden = false;
  backdrop.onclick = ev => { if (ev.target === backdrop) backdrop.hidden = true; };
  maskPhone(body.querySelector('#e-tel')); maskCpfCnpj(body.querySelector('#e-doc')); maskCep(body.querySelector('#e-cep'));
  const cepEl = body.querySelector('#e-cep'); const hint = body.querySelector('#e-cep-hint');
  cepEl.addEventListener('input', async () => {
    if (cepEl.value.replace(/\D/g, '').length !== 8) return;
    hint.style.display = 'block'; hint.textContent = 'Buscando endereço…';
    const r = await buscaCep(cepEl.value);
    if (r) { body.querySelector('#e-rua').value = r.rua; body.querySelector('#e-bairro').value = r.bairro; body.querySelector('#e-cidade').value = r.cidade; body.querySelector('#e-uf').value = r.uf; hint.textContent = '✓ Endereço preenchido pelo CEP'; } else hint.textContent = 'CEP não encontrado';
  });
  body.querySelector('#e-cancel').onclick = () => backdrop.hidden = true;
  body.querySelector('#e-save').onclick = () => {
    c.nome = body.querySelector('#e-nome').value.trim() || c.nome;
    c.telefone = body.querySelector('#e-tel').value.replace(/\D/g, ''); c.cpfCnpj = body.querySelector('#e-doc').value.trim(); c.cep = body.querySelector('#e-cep').value.trim();
    c.endereco = { rua: body.querySelector('#e-rua').value.trim(), numero: body.querySelector('#e-num').value.trim(), bairro: body.querySelector('#e-bairro').value.trim(), cidade: body.querySelector('#e-cidade').value.trim(), uf: body.querySelector('#e-uf').value.trim().toUpperCase() };
    save(); backdrop.hidden = true; render(); toast('Cliente atualizado');
  };
}

// ---------- ajuda ----------
function scrAjuda(s) {
  s.append(el(`<div class="help-block"><h4>${ICON.wrench} O fluxo do dia a dia</h4></div>`));
  const steps = [
    ['Toque no + e crie a OS', 'A placa preenche marca, modelo e ano. Cliente e WhatsApp completam a ficha.'],
    ['Adicione itens', 'Peças saem do seu estoque (com baixa automática) ou são pedidas do fornecedor. Serviços entram como mão de obra.'],
    ['Mande o orçamento', 'Um toque monta a mensagem no WhatsApp do cliente. Quando ele aprova, o app grava data e hora.'],
    ['Execute e entregue', 'Anexe fotos, preencha o checklist, e ao final emita a nota e entregue.'],
  ];
  const flow = el(`<div class="help-block"></div>`);
  steps.forEach(([t, d], i) => flow.append(el(`<div class="help-step"><div class="n">${i + 1}</div><div><b>${t}</b><br>${d}</div></div>`)));
  s.append(flow);

  s.append(el(`<div class="help-block"><h4>${ICON.checkc} O que já funciona de verdade</h4><p>OS digital, painel do dono, orçamento no WhatsApp com aceite, estoque com baixa automática, financeiro com margem, retorno de clientes, foto e checklist, e o histórico por placa. Tudo salvo neste aparelho.</p></div>`));

  s.append(el(`<div class="help-block"><h4>${ICON.invoice} O que ainda é simulado</h4><p><span class="tag-sim">Nota fiscal:</span> o número é fictício — a emissão real precisa do certificado digital e do Emissor Nacional. <span class="tag-sim">Catálogo de peças:</span> preços de exemplo, sem integração comercial. <span class="tag-sim">Vários aparelhos:</span> ainda não sincroniza — os dados vivem só neste navegador.</p></div>`));

  s.append(el(`<div class="sim-note">Esta é uma demonstração honesta: o que está marcado como simulado não deve ser usado com um cliente de verdade ainda.</div>`));
}

// ---------- onboarding ----------
function showOnboarding() {
  const app = $('#app');
  const onb = el(`<div class="onb">
    <div class="logo-lg">${ICON.wrench}</div>
    <h2>Bem-vindo ao<br>Oficina Pro</h2>
    <p>Uma demonstração funcional: crie ordens de serviço, controle o estoque, acompanhe o financeiro e o histórico de cada carro pela placa.</p>
    <div class="obl">${ICON.checkc}<span>OS, estoque, financeiro, retornos e histórico por placa <b style="color:#fff">funcionam de verdade</b> — e ficam salvos neste aparelho.</span></div>
    <div class="obl">${ICON.invoice}<span>A <b style="color:#fff">nota fiscal é simulada</b> nesta versão. A emissão real precisa de certificado digital.</span></div>
    <div class="obl">${ICON.help}<span>Toque em <b style="color:#fff">Mais › Como o app funciona</b> a qualquer momento para ver o que é real e o que é demonstração.</span></div>
    <div class="spacer"></div>
    <button class="btn primary" id="onb-go">Começar</button>
  </div>`);
  app.append(onb);
  onb.querySelector('#onb-go').onclick = () => { state.onboarded = true; save(); onb.remove(); };
}

// ---------- boot ----------
render();
if (!state.onboarded) showOnboarding();
