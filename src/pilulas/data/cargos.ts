// CARGO NA CONCESSIONÁRIA.
//
// O cadastro nasceu no mundo da farmácia e oferecia balconista, promotor,
// afiliado e "profissional da saúde". Um vendedor da Ramasa tinha que se
// declarar balconista pra entrar — na primeira tela que ele vê.
//
// Aqui a loja tem quatro cargos, e eles vêm em pares: veículo e acessório, cada
// um com quem vende e quem gerencia. A separação é real na operação — quem
// vende acessório trabalha o cliente que JÁ comprou o carro — e é por isso que
// ela precisa existir no cadastro: sem o cargo, a gerência olha as respostas do
// time e não sabe quem falou.
//
// O QUE O CARGO **NÃO** FAZ: os dois vendedores enxergam exatamente a mesma
// coisa, e os dois gerentes caem no painel padrão. O cargo identifica a pessoa,
// não recorta o conteúdo — vendedor de acessório precisa conhecer o carro pra
// vender o acessório, e vendedor de carro fecha acessório no mesmo aperto de
// mão. Esconder metade do app de cada um quebraria os dois.
//
// OS NOMES SÃO OS DA CASA, não os meus. Eu tinha escrito "Gerente de veículos"
// e "Líder de acessórios"; no grupo eles se chamam GERENTE DE VENDAS e
// SUPERVISOR DE ACESSÓRIOS. O id no banco continua o mesmo — muda o que a
// pessoa lê, que é o que decide se ela se reconhece na lista do cadastro.
//
// GERENTE x SUPERVISOR: o gerente responde por UMA loja; o supervisor responde
// pela operação de acessórios do grupo inteiro, acima dos gerentes. Hoje os dois
// enxergam o mesmo conteúdo — o app ainda não separa o que é de cada loja,
// então "ver tudo" já é o padrão de qualquer marca. A distinção existe aqui
// para que o cadastro diga a verdade agora, e para que a separação por loja,
// quando vier, tenha em que se apoiar.
//
// LEADS: a terceira frente, e a única que trabalha o cliente ANTES da loja.
// O executivo recebe o lead que chegou pelo site, pelo anúncio ou pelo
// WhatsApp e qualifica antes de virar visita; o gerente responde pela operação
// inteira. Precisam do mesmo conteúdo de quem está no salão — a primeira
// objeção do cliente chega por mensagem, não no showroom — mas a rotina é
// outra, e sem o cargo a gerência não consegue separar o que veio da ponta de
// atendimento do que veio do salão.
//
// QUALIDADE: não é par de ninguém. O gerente de qualidade não vende — ele
// audita o que o grupo faz, então precisa enxergar o conteúdo inteiro e o uso
// do time inteiro, sem recorte de loja nem de linha. É o único cargo aqui cuja
// razão de existir é justamente olhar o trabalho dos outros.
//
// E o cargo não dá poder sozinho: quem abre o Painel é o papel por baixo
// (gestor), e quem lê os dados do time é a lista de e-mails autorizados nas
// regras do Firestore. Marcar "Líder" no cadastro é uma declaração, não uma
// chave.
import type { Role } from '../AuthContext';

export type CargoAuto =
  | 'vendedor-veiculos'
  | 'gerente-veiculos'
  | 'vendedor-acessorios'
  | 'gerente-acessorios'
  | 'lider-acessorios'
  | 'gerente-qualidade'
  | 'executivo-leads'
  | 'gerente-leads';

export interface Cargo {
  id: CargoAuto;
  label: string;
  /** O papel que o app usa por baixo. Vendedor vê o app; gerente vê o painel. */
  role: Role;
}

export const CARGOS_AUTO: Cargo[] = [
  {
    id: 'vendedor-veiculos',
    label: 'Vendedor(a) de veículos',
    role: 'balconista',
  },
  {
    id: 'vendedor-acessorios',
    label: 'Vendedor(a) de acessórios',
    role: 'balconista',
  },
  {
    id: 'gerente-veiculos',
    label: 'Gerente de vendas',
    role: 'gestor',
  },
  {
    id: 'gerente-acessorios',
    label: 'Gerente de acessórios',
    role: 'gestor',
  },
  {
    id: 'lider-acessorios',
    label: 'Supervisor(a) de acessórios',
    role: 'gestor',
  },
  {
    id: 'gerente-qualidade',
    label: 'Gerente de qualidade',
    role: 'gestor',
  },
  {
    id: 'executivo-leads',
    label: 'Executivo(a) de leads',
    // Trabalha o cliente, não o time: vê o app como qualquer vendedor.
    role: 'balconista',
  },
  {
    id: 'gerente-leads',
    label: 'Gerente de leads',
    role: 'gestor',
  },
];

export function ehCargoAuto(x: unknown): x is CargoAuto {
  return CARGOS_AUTO.some((c) => c.id === x);
}

export function cargoPorId(id?: string | null): Cargo | null {
  return CARGOS_AUTO.find((c) => c.id === id) || null;
}

export function cargoLabel(id?: string | null): string {
  return cargoPorId(id)?.label || '';
}

/** O papel que o app usa. Cargo desconhecido cai em vendedor — nunca em gestor. */
export function roleDoCargo(id?: string | null): Role {
  return cargoPorId(id)?.role || 'balconista';
}

// QUEM MEXE NO CATÁLOGO DE ACESSÓRIOS.
//
// A Vivian foi explícita: editar, remover e ordenar acessório é do SUPERVISOR
// e do GERENTE DE ACESSÓRIOS. Não é de qualquer gestor — gerente de vendas,
// gerente de leads e qualidade abrem o mesmo Painel, e nenhum deles responde
// pela tabela de acessórios. Deixar o botão aparecer pra todo mundo era
// convite pra dois donos no mesmo dado.
//
// A administração do app entra junto (a Vivian), porque é ela quem conserta
// quando algo sai errado — e ficar trancada do lado de fora do próprio app
// não ajuda ninguém.
//
// ISTO É A TELA, NÃO A TRANCA. Cargo não viaja no login do Firebase, então a
// regra do Firestore não consegue enxergar ele: lá a tranca continua sendo a
// lista de e-mails autorizados (isGestor). Ou seja — o botão só aparece pra
// quem responde pelo assunto, e a nuvem só aceita a gravação de quem está na
// lista. São duas camadas, e a de baixo é a que vale contra quem insiste.
const DONAS_DO_APP = ['viviangitti23@gmail.com', 'viviangitti@gmail.com'];

const CARGOS_DE_ACESSORIOS: CargoAuto[] = ['gerente-acessorios', 'lider-acessorios'];

export function podeMexerEmAcessorios(
  user?: { role?: Role; cargo?: string | null; email?: string } | null,
): boolean {
  if (!user || user.role !== 'gestor') return false;
  if (CARGOS_DE_ACESSORIOS.includes(user.cargo as CargoAuto)) return true;
  return DONAS_DO_APP.includes((user.email || '').trim().toLowerCase());
}
