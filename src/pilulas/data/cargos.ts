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
// GERENTE x LÍDER: o gerente responde por UMA loja; o líder responde pela
// operação de acessórios do grupo inteiro, acima dos gerentes. Hoje os dois
// enxergam o mesmo conteúdo — o app ainda não separa o que é de cada loja,
// então "ver tudo" já é o padrão de qualquer marca. A distinção existe aqui
// para que o cadastro diga a verdade agora, e para que a separação por loja,
// quando vier, tenha em que se apoiar.
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
  | 'gerente-qualidade';

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
    label: 'Gerente de veículos',
    role: 'gestor',
  },
  {
    id: 'gerente-acessorios',
    label: 'Gerente de acessórios',
    role: 'gestor',
  },
  {
    id: 'lider-acessorios',
    label: 'Líder de acessórios',
    role: 'gestor',
  },
  {
    id: 'gerente-qualidade',
    label: 'Gerente de qualidade',
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
