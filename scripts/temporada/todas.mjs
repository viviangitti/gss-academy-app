// GERA AS CINCO PEÇAS DA TEMPORADA DE UMA VEZ.
//
// Existe porque eu não conseguia regerar as artes sem lembrar dos argumentos
// de cada episódio — e, numa tentativa, escrevi quatro arquivos chamados "1",
// "2", "3" e "4" na raiz do repositório. Texto de arte que vai para o time
// inteiro não pode depender da minha memória de linha de comando.
//
// A ORDEM DOS EPISÓDIOS É A DO ROTEIRO, e isso importa: o episódio 1 é o
// Jaecoo 7 e o 4 é o Omoda 7. O plano já errou isso uma vez, dizendo
// "Episódio 4: Jaecoo 7" numa frase de exemplo.
//
// Cada TÍTULO é a objeção do cliente, copiada do roteiro de 03/09 — não é
// invenção minha, e é por isso que ela abre o vídeo. Cada FOCO é a linha "o
// que o time diz que fecha este carro", do mesmo roteiro.
//
// Uso: node scripts/temporada/todas.mjs [--data "14 de outubro"]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const PASTA = `${process.env.HOME}/Downloads/eleva-temporada`;
const i = process.argv.indexOf('--data');
const DATA = i > -1 ? process.argv[i + 1] : '';

const EPISODIOS = [
  ['01', 'jaecoo-7', 'É CHINÊS, NÉ?', 'O que fecha: autonomia, potência e design.', 'ep-01-jaecoo7-e-chines.png'],
  ['02', 'omoda-5-shs-h', 'HÍBRIDO DÁ TRABALHO?', 'O que fecha: autonomia, tecnologia e não precisa de tomada.', 'ep-02-omoda5-hibrido-da-trabalho.png'],
  ['03', 'omoda-e5', 'E ONDE EU CARREGO?', 'O que fecha: autonomia, custo-benefício e design.', 'ep-03-omodae5-onde-eu-carrego.png'],
  ['04', 'omoda-7-shs-p', 'SÓ MARCA CONHECIDA ENTREGA?', 'O que fecha: acabamento, espaço e autonomia.', 'ep-04-omoda7-marca-conhecida.png'],
];

fs.mkdirSync(PASTA, { recursive: true });
const roda = (script, args) =>
  execFileSync('node', [`scripts/temporada/${script}`, ...args], { stdio: 'inherit' });

roda('arte.mjs', [`${PASTA}/00-anuncio-da-temporada.png`, ...(DATA ? ['--data', DATA] : [])]);
for (const [ep, carro, titulo, foco, arq] of EPISODIOS) {
  roda('episodio.mjs', [`${PASTA}/${arq}`, '--ep', ep, '--carro', carro, '--titulo', titulo, '--foco', foco]);
}
console.log(`\n5 peças em ${PASTA}`);
