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
};

const KEY = 'oficinapro.v2';
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
  return {
    onboarded: false,
    oficina: { nome: 'Auto Center do Zé', cidade: 'Campinas · SP', telefone: '5519999990000', cnpj: '' },
    estoque: [
      { id: uid('e'), nome: 'Pastilha de freio dianteira (par)', qtd: 4, min: 2, custo: 120, preco: 189 },
      { id: uid('e'), nome: 'Disco de freio ventilado', qtd: 1, min: 2, custo: 210, preco: 320 },
      { id: uid('e'), nome: 'Filtro de óleo', qtd: 12, min: 5, custo: 20, preco: 34 },
      { id: uid('e'), nome: 'Óleo motor 5W30 sintético (litro)', qtd: 18, min: 8, custo: 30, preco: 48 },
      { id: uid('e'), nome: 'Kit correia dentada', qtd: 0, min: 1, custo: 280, preco: 410 },
      { id: uid('e'), nome: 'Amortecedor dianteiro (par)', qtd: 2, min: 1, custo: 360, preco: 540 },
    ],
    os: [
      { id: uid('os'), placa: 'RQP4C18', cliente: 'Marcos Silva', telefone: '5519999990001', veiculo: { marca: 'VW', modelo: 'Gol 1.6', ano: 2014, km: 128400 },
        itens: [{ tipo: 'peca', desc: 'Pastilha de freio dianteira (par)', qtd: 1, valor: 189, custo: 120 }, { tipo: 'peca', desc: 'Disco de freio ventilado', qtd: 2, valor: 320, custo: 210 }, { tipo: 'servico', desc: 'Mão de obra — troca de pastilha', qtd: 1, valor: 150, custo: 0 }],
        fotos: [], checklist: {}, status: 'execucao', createdAt: now - 2 * 3600000, aprovadoAt: now - 1.5 * 3600000, entregueAt: null },
      { id: uid('os'), placa: 'BRA2E19', cliente: 'Ana Souza', telefone: '5519999990002', veiculo: { marca: 'Chevrolet', modelo: 'Onix LT', ano: 2019, km: 62100 },
        itens: [{ tipo: 'peca', desc: 'Filtro de óleo', qtd: 1, valor: 34, custo: 20 }, { tipo: 'peca', desc: 'Óleo motor 5W30 sintético (litro)', qtd: 4, valor: 48, custo: 30 }, { tipo: 'servico', desc: 'Mão de obra — troca de óleo e filtro', qtd: 1, valor: 80, custo: 0 }],
        fotos: [], checklist: {}, status: 'orcamento', createdAt: now - 40 * 60000, aprovadoAt: null, entregueAt: null },
      { id: uid('os'), placa: 'RQP4C18', cliente: 'Marcos Silva', telefone: '5519999990001', veiculo: { marca: 'VW', modelo: 'Gol 1.6', ano: 2014, km: 121000 },
        itens: [{ tipo: 'peca', desc: 'Kit correia dentada', qtd: 1, valor: 410, custo: 280 }, { tipo: 'servico', desc: 'Mão de obra — correia dentada', qtd: 1, valor: 420, custo: 0 }],
        fotos: [], checklist: {}, status: 'entregue', createdAt: now - 190 * day, aprovadoAt: now - 190 * day, entregueAt: now - 189 * day, nota: 'NFS-e 348192' },
      { id: uid('os'), placa: 'FLA2D33', cliente: 'Juliana Reis', telefone: '5519999990003', veiculo: { marca: 'Fiat', modelo: 'Argo Drive', ano: 2021, km: 41800 },
        itens: [{ tipo: 'servico', desc: 'Alinhamento e balanceamento', qtd: 1, valor: 120, custo: 0 }],
        fotos: [], checklist: {}, status: 'entregue', createdAt: now - 3 * day, aprovadoAt: now - 3 * day, entregueAt: now - 3 * day + 4 * 3600000, nota: 'NFS-e 348201' },
    ],
  };
}

let state = load() || seed();
if (!load()) save();

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const el = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
const osTotal = os => os.itens.reduce((s, i) => s + i.valor * i.qtd, 0);
const osCusto = os => os.itens.reduce((s, i) => s + (i.custo || 0) * i.qtd, 0);
const STATUS = { orcamento: { label: 'Orçamento', cls: 'orcamento' }, aprovado: { label: 'Aprovado', cls: 'aprovado' }, execucao: { label: 'Em execução', cls: 'execucao' }, entregue: { label: 'Entregue', cls: 'entregue' } };
function timeAgo(ts) { const d = Date.now() - ts, m = d / 60000, h = m / 60, days = h / 24; if (m < 60) return `há ${Math.max(1, Math.round(m))} min`; if (h < 24) return `há ${Math.round(h)} h`; if (days < 30) return `há ${Math.round(days)} d`; return `há ${Math.round(days / 30)} meses`; }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2200); }
function fmtPlaca(raw) { const r = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7); return r.length <= 3 ? r : r.slice(0, 3) + '-' + r.slice(3); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function estoqueByNome(nome) { return state.estoque.find(e => e.nome === nome); }

// ---------- router ----------
let route = { name: 'baia', param: null, _from: null };
let draft = null;
function go(name, param) { route = { name, param, _from: route.name }; render(); $('#screen').scrollTop = 0; }

// ---------- topbar ----------
function topbar() {
  const bar = $('#topbar');
  const titles = { nova: 'Nova ordem de serviço', detalhe: 'Ordem de serviço', estoque: 'Estoque de peças', financeiro: 'Financeiro', retornos: 'Retorno de clientes', config: 'Minha oficina', ajuda: 'Como funciona', mais: 'Mais', placa: 'Histórico por placa', os: 'Ordens de serviço' };
  const withBack = ['nova', 'detalhe', 'financeiro', 'retornos', 'config', 'ajuda', 'placa'];
  if (route.name === 'baia') {
    bar.innerHTML = `<div class="brand"><div class="logo">${ICON.wrench}</div><div class="title">Oficina Pro</div></div><div class="spacer"></div><div class="sub">${state.oficina.cidade}</div>`;
  } else if (withBack.includes(route.name)) {
    bar.innerHTML = `<button class="back" data-back>‹</button><div class="title">${titles[route.name]}</div><div class="spacer"></div>`;
  } else {
    bar.innerHTML = `<div class="brand"><div class="logo">${ICON.wrench}</div><div class="title">${titles[route.name] || 'Oficina Pro'}</div></div>`;
  }
  const b = bar.querySelector('[data-back]');
  if (b) b.onclick = () => go(route._from && route._from !== route.name ? route._from : 'baia');
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
const SCREENS = { baia: scrBaia, os: scrOS, nova: scrNova, detalhe: scrDetalhe, placa: scrPlaca, estoque: scrEstoque, financeiro: scrFinanceiro, retornos: scrRetornos, config: scrConfig, ajuda: scrAjuda, mais: scrMais };
function render() {
  topbar(); tabbar();
  const s = $('#screen'); s.innerHTML = '';
  (SCREENS[route.name] || scrBaia)(s);
}

// ---------- Baia (painel) ----------
function scrBaia(s) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const entregHoje = state.os.filter(o => o.entregueAt && o.entregueAt >= today.getTime());
  const receitaHoje = entregHoje.reduce((a, o) => a + osTotal(o), 0);
  const naBaia = state.os.filter(o => o.status === 'aprovado' || o.status === 'execucao');
  const aguardando = state.os.filter(o => o.status === 'orcamento');
  const semEstoque = state.estoque.filter(e => e.qtd <= e.min);

  s.append(el(`<div class="section-label">Hoje na oficina</div>`));
  const grid = el(`<div class="stat-grid"></div>`);
  grid.append(
    el(`<div class="stat dark"><div class="big">${naBaia.length}</div><div class="lbl">carros na baia</div></div>`),
    el(`<div class="stat accent"><div class="big">${money(receitaHoje)}</div><div class="lbl">entrou hoje</div></div>`),
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

function scrOS(s) {
  const ordered = [...state.os].sort((a, b) => b.createdAt - a.createdAt);
  [['Abertas', ordered.filter(o => o.status !== 'entregue')], ['Entregues', ordered.filter(o => o.status === 'entregue')]].forEach(([label, arr]) => {
    if (!arr.length) return;
    s.append(el(`<div class="section-label">${label} · ${arr.length}</div>`));
    arr.forEach(o => s.append(osCard(o)));
  });
  if (!state.os.length) s.append(emptyState('Nenhuma OS ainda. Toque no + para criar.'));
}

function osCard(o) {
  const st = STATUS[o.status];
  const c = el(`<div class="os-card"><div class="plate">${fmtPlaca(o.placa)}</div><div class="info"><div class="veic">${o.veiculo.marca} ${o.veiculo.modelo}</div><div class="meta">${o.cliente} · ${timeAgo(o.createdAt)}</div></div><div class="right"><div class="val">${money(osTotal(o))}</div><span class="chip ${st.cls}">${st.label}</span></div></div>`);
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

  s.append(el(`<div class="detail-head"><div class="row1"><div class="plate-lg">${fmtPlaca(o.placa)}</div><span class="chip ${st.cls}">${st.label}</span></div><div class="veic-lg">${o.veiculo.marca} ${o.veiculo.modelo} · ${o.veiculo.ano} · ${(o.veiculo.km || 0).toLocaleString('pt-BR')} km</div><div class="cli">${o.cliente}</div></div>`));

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
  o.itens.forEach((it, idx) => {
    const row = el(`<div class="item-row"><span class="tag ${it.tipo}">${it.tipo === 'peca' ? 'PEÇA' : 'SERV'}</span><div class="desc">${it.desc}${it.qtd > 1 ? ` <small>× ${it.qtd}</small>` : ''}</div><div class="v">${money(it.valor * it.qtd)}</div>${editable ? `<button class="del" data-del="${idx}">${ICON.trash}</button>` : ''}</div>`);
    const del = row.querySelector('[data-del]');
    if (del) del.onclick = () => { const it2 = o.itens[idx]; if (it2.estoqueId) { const e = state.estoque.find(x => x.id === it2.estoqueId); if (e) e.qtd += it2.qtd; } o.itens.splice(idx, 1); save(); render(); };
    s.append(row);
  });
  if (!o.itens.length) s.append(el(`<div class="hint-line">Nenhum item ainda.</div>`));
  if (editable) { const add = el(`<button class="add-item-line">${ICON.plus} adicionar item</button>`); add.onclick = () => openItemSheet(o); s.append(add); }

  s.append(el(`<div class="total-bar"><div class="lbl">Total</div><div class="amt">${money(osTotal(o))}</div></div>`));

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
  const txt = `*${state.oficina.nome}*%0AOrçamento do ${o.veiculo.marca} ${o.veiculo.modelo} (placa ${fmtPlaca(o.placa)})%0A%0A${linhas}%0A%0A*Total: ${money(osTotal(o))}*%0A%0AResponda *APROVO* para autorizarmos o serviço.`;
  window.open(`https://wa.me/${o.telefone}?text=${txt}`, '_blank');
  toast('Abrindo WhatsApp do cliente…');
}

// ---------- adicionar item (estoque + catálogo) ----------
function openItemSheet(o) {
  const backdrop = $('#sheet'), body = $('#sheet-body');
  let tipo = 'peca';
  const draw = () => {
    body.innerHTML = `<div class="grab"></div><h3>Adicionar item</h3><div class="seg"><button data-t="peca" class="${tipo === 'peca' ? 'on' : ''}">Peça</button><button data-t="servico" class="${tipo === 'servico' ? 'on' : ''}">Serviço</button></div><div id="cat"></div>`;
    body.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tipo = b.dataset.t; draw(); });
    const cat = body.querySelector('#cat');
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

// ---------- nova OS ----------
function startNova() { draft = { placa: '', cliente: '', telefone: '', veiculo: { marca: '', modelo: '', ano: '', km: '' } }; go('nova'); }
function scrNova(s) {
  const d = draft;
  const form = el(`<div>
    <div class="field plate"><label>Placa</label><input id="f-placa" maxlength="8" placeholder="ABC-1D23" value="${fmtPlaca(d.placa)}" autocomplete="off"></div>
    <div class="field"><label>Cliente</label><input id="f-cli" placeholder="Nome do cliente" value="${d.cliente}"></div>
    <div class="field"><label>WhatsApp (com DDD)</label><input id="f-tel" inputmode="numeric" placeholder="19 99999-0000" value="${d.telefone}"></div>
    <div class="section-label mt">Veículo</div>
    <div class="row-2"><div class="field"><label>Marca</label><input id="f-marca" placeholder="VW" value="${d.veiculo.marca}"></div><div class="field"><label>Modelo</label><input id="f-modelo" placeholder="Gol 1.6" value="${d.veiculo.modelo}"></div></div>
    <div class="row-2"><div class="field"><label>Ano</label><input id="f-ano" inputmode="numeric" placeholder="2014" value="${d.veiculo.ano}"></div><div class="field"><label>KM</label><input id="f-km" inputmode="numeric" placeholder="128400" value="${d.veiculo.km}"></div></div>
    <div id="hint"></div>
    <button class="btn primary" id="f-save" style="margin-top:8px">${ICON.plus} Criar ordem de serviço</button>
    <button class="btn line" id="f-cancel" style="margin-top:4px">cancelar</button></div>`);
  s.append(form);
  const placaEl = form.querySelector('#f-placa');
  placaEl.addEventListener('input', () => {
    const raw = placaEl.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7); placaEl.value = fmtPlaca(raw);
    const hit = PLACAS[raw], hint = form.querySelector('#hint');
    if (hit) { form.querySelector('#f-marca').value = hit.marca; form.querySelector('#f-modelo').value = hit.modelo; form.querySelector('#f-ano').value = hit.ano; hint.innerHTML = `<div class="approval-note">${ICON.checkc} Veículo identificado pela placa: ${hit.marca} ${hit.modelo} ${hit.ano}</div>`; }
    else hint.innerHTML = '';
  });
  form.querySelector('#f-cancel').onclick = () => go('baia');
  form.querySelector('#f-save').onclick = () => {
    const placa = placaEl.value.replace(/[^A-Z0-9]/g, ''), cli = form.querySelector('#f-cli').value.trim();
    if (placa.length < 7) return toast('Informe a placa completa');
    if (!cli) return toast('Informe o nome do cliente');
    const os = { id: uid('os'), placa, cliente: cli, telefone: form.querySelector('#f-tel').value.replace(/\D/g, '') || '5519999990000', veiculo: { marca: form.querySelector('#f-marca').value.trim() || '—', modelo: form.querySelector('#f-modelo').value.trim() || '—', ano: +form.querySelector('#f-ano').value || '', km: +form.querySelector('#f-km').value || 0 }, itens: [], fotos: [], checklist: {}, status: 'orcamento', createdAt: Date.now(), aprovadoAt: null, entregueAt: null };
    state.os.push(os); save(); go('detalhe', os.id); toast('OS criada — adicione os itens');
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
    const v = arr[0].veiculo, total = arr.reduce((a, o) => a + osTotal(o), 0);
    results.append(el(`<div class="hist-plate"><div class="p">${fmtPlaca(arr[0].placa)}</div><div class="s">${v.marca} ${v.modelo} · ${arr.length} serviço${arr.length > 1 ? 's' : ''} · ${money(total)} no total</div></div>`));
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
  body.querySelector('#e-cancel').onclick = () => backdrop.hidden = true;
  body.querySelector('#e-save').onclick = () => {
    const nome = body.querySelector('#e-nome').value.trim(); if (!nome) return toast('Informe o nome');
    state.estoque.push({ id: uid('e'), nome, qtd: +body.querySelector('#e-qtd').value || 0, min: +body.querySelector('#e-min').value || 0, preco: +body.querySelector('#e-preco').value || 0, custo: +body.querySelector('#e-custo').value || 0 });
    save(); backdrop.hidden = true; render(); toast('Peça cadastrada');
  };
}

// ---------- financeiro ----------
function scrFinanceiro(s) {
  const now = new Date(), mStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const entregMes = state.os.filter(o => o.entregueAt && o.entregueAt >= mStart);
  const receita = entregMes.reduce((a, o) => a + osTotal(o), 0);
  const custo = entregMes.reduce((a, o) => a + osCusto(o), 0);
  const margem = receita - custo;
  const ticket = entregMes.length ? receita / entregMes.length : 0;
  const aReceber = state.os.filter(o => o.status === 'aprovado' || o.status === 'execucao').reduce((a, o) => a + osTotal(o), 0);
  const mesNome = now.toLocaleDateString('pt-BR', { month: 'long' });

  s.append(el(`<div class="fin-hero"><div class="lbl">Receita em ${mesNome}</div><div class="big">${money(receita)}</div><div class="sub">${entregMes.length} serviço${entregMes.length !== 1 ? 's' : ''} entregue${entregMes.length !== 1 ? 's' : ''}</div></div>`));
  const grid = el(`<div class="fin-grid"></div>`);
  grid.append(
    el(`<div class="fin-card"><div class="v teal">${money(margem)}</div><div class="k">margem bruta (receita − custo de peças)</div></div>`),
    el(`<div class="fin-card"><div class="v">${money(ticket)}</div><div class="k">ticket médio</div></div>`),
    el(`<div class="fin-card"><div class="v">${money(custo)}</div><div class="k">custo de peças no mês</div></div>`),
    el(`<div class="fin-card"><div class="v">${money(aReceber)}</div><div class="k">a receber (OS em aberto)</div></div>`),
  );
  s.append(grid);

  s.append(el(`<div class="section-label mt">Últimas entregas</div>`));
  const entregas = [...state.os].filter(o => o.status === 'entregue').sort((a, b) => b.entregueAt - a.entregueAt).slice(0, 6);
  if (!entregas.length) s.append(el(`<div class="hint-line">Nenhuma entrega ainda.</div>`));
  entregas.forEach(o => { const c = osCard(o); const d = new Date(o.entregueAt); c.querySelector('.meta').textContent = `${o.cliente} · ${d.toLocaleDateString('pt-BR')}`; c.onclick = () => go('detalhe', o.id); s.append(c); });
  s.append(el(`<div class="sim-note">Todos os números são calculados a partir das suas OS. Margem considera o custo das peças; a mão de obra entra como margem cheia.</div>`));
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
    <div class="section-label">Dados da oficina</div>
    <div class="field"><label>Nome da oficina</label><input id="c-nome" value="${o.nome || ''}"></div>
    <div class="field"><label>Cidade / UF</label><input id="c-cidade" value="${o.cidade || ''}"></div>
    <div class="field"><label>WhatsApp da oficina</label><input id="c-tel" inputmode="numeric" value="${o.telefone || ''}"></div>
    <div class="field"><label>CNPJ</label><input id="c-cnpj" inputmode="numeric" placeholder="00.000.000/0000-00" value="${o.cnpj || ''}"></div>
    <button class="btn primary" id="c-save">Salvar</button>
    <div class="cfg-actions">
      <div class="section-label">Certificado digital (nota fiscal)</div>
      <div class="sim-note" style="margin-bottom:12px"><span class="sim-badge">${ICON.invoice} não conectado</span><br><br>Para emitir NFS-e de verdade, aqui você enviaria o <b>certificado digital A1</b> da oficina e conectaríamos ao Emissor Nacional. Não disponível nesta versão de demonstração.</div>
      <div class="section-label">Dados</div>
      <button class="btn ghost" id="c-reset">Recomeçar com dados de exemplo</button>
      <button class="btn line" id="c-help" style="margin-top:6px">Ver como o app funciona</button>
    </div></div>`);
  s.append(form);
  form.querySelector('#c-save').onclick = () => {
    o.nome = form.querySelector('#c-nome').value.trim() || o.nome;
    o.cidade = form.querySelector('#c-cidade').value.trim(); o.telefone = form.querySelector('#c-tel').value.replace(/\D/g, ''); o.cnpj = form.querySelector('#c-cnpj').value.trim();
    save(); toast('Dados salvos'); render();
  };
  form.querySelector('#c-reset').onclick = () => { if (confirm('Isto apaga tudo e recarrega os dados de exemplo. Continuar?')) { state = seed(); state.onboarded = true; save(); go('baia'); toast('Dados de exemplo recarregados'); } };
  form.querySelector('#c-help').onclick = () => go('ajuda');
}

// ---------- mais ----------
function scrMais(s) {
  const items = [
    ['financeiro', ICON.chart, 'Financeiro', 'Receita, margem e a receber'],
    ['retornos', ICON.calendar, 'Retorno de clientes', 'Quem está na época da revisão'],
    ['placa', ICON.plate, 'Histórico por placa', 'Todo o serviço já feito no carro'],
    ['config', ICON.cog, 'Minha oficina', 'Cadastro, nota fiscal e dados'],
    ['ajuda', ICON.help, 'Como o app funciona', 'O que é real e o que é demonstração'],
  ];
  items.forEach(([r, ic, t, d]) => { const row = el(`<div class="menu-row"><div class="mi">${ic}</div><div class="mt"><b>${t}</b><small>${d}</small></div><div class="arrow">›</div></div>`); row.onclick = () => go(r); s.append(row); });
  s.append(el(`<div class="sim-note">Oficina Pro · versão de demonstração. Os dados ficam salvos só neste navegador.</div>`));
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
