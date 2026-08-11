#!/usr/bin/env python3
"""Gera a LOCUÇÃO das pílulas com voz neural (edge-tts) — grátis, sem chave.

Por que existe: sem MP3 pronto, o app cai na voz do próprio navegador, que é
robotizada e muda de aparelho pra aparelho. Com o MP3, todo mundo ouve a mesma
voz boa — e no iPhone a locução não trava (é um play() só, dentro do toque).

Como rodar:
    npx tsx scripts/gen-narration.ts narration-manifest.json
    python3 scripts/gen-narration.py --ids jaecoo-7,omoda-5-shs-h
    python3 scripts/gen-narration.py --todos            # regera tudo
    python3 scripts/gen-narration.py --ids X --voz pt-BR-AntonioNeural

O que ele faz: sintetiza cada cena do roteiro, mede a duração real de cada uma,
junta tudo num MP3 por pílula e grava as marcas de tempo em
src/pilulas/data/narrationTimings.ts — é assim que o slide troca junto com a voz.
"""
import argparse
import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / 'public' / 'audio' / 'narration'
TIMINGS = RAIZ / 'src' / 'pilulas' / 'data' / 'narrationTimings.ts'
MANIFESTO = RAIZ / 'narration-manifest.json'

# Voz padrão. A Thalita é a geração mais nova (multilingual neural) e soa bem
# menos "lida" que a Francisca — foi por isso que ela virou o padrão.
VOZ_PADRAO = 'pt-BR-ThalitaMultilingualNeural'
# Um tico mais rápido que o normal: locução de venda parada soa arrastada.
RATE_PADRAO = '+5%'
# Respiro entre uma cena e outra. Sem isso as frases colam e viram atropelo.
PAUSA_S = 0.35


def duracao(mp3: Path) -> float:
    r = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'default=noprint_wrappers=1:nokey=1', str(mp3)],
        capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


async def sintetiza(texto: str, destino: Path, voz: str, rate: str) -> None:
    import edge_tts
    await edge_tts.Communicate(texto, voz, rate=rate).save(str(destino))


def junta(partes: list[Path], silencio: Path, destino: Path) -> None:
    """Concatena cena + silêncio + cena… num MP3 só, re-codificando uma vez."""
    lista = destino.parent / f'.lista-{destino.stem}.txt'
    linhas = []
    for i, p in enumerate(partes):
        linhas.append(f"file '{p.as_posix()}'")
        if i < len(partes) - 1:
            linhas.append(f"file '{silencio.as_posix()}'")
    lista.write_text('\n'.join(linhas), encoding='utf-8')
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
         '-i', str(lista), '-c:a', 'libmp3lame', '-b:a', '96k', str(destino)],
        check=True)
    lista.unlink(missing_ok=True)


def grava_timings(novos: dict[str, list[float]]) -> None:
    """Atualiza o arquivo de marcas mantendo o que já estava lá."""
    atual: dict[str, list[float]] = {}
    if TIMINGS.exists():
        bruto = TIMINGS.read_text(encoding='utf-8')
        # Ancora no nome da constante: o comentário do topo tem chaves ({id}.mp3)
        # e pegar a primeira '{' do arquivo trazia o comentário junto.
        ini = bruto.index('{', bruto.index('NARRATION_TIMINGS'))
        corpo = bruto[ini: bruto.rindex('}') + 1]
        # o arquivo é TS, mas o objeto em si é JSON válido (chaves com aspas)
        atual = json.loads(re.sub(r',(\s*[}\]])', r'\1', corpo))
    atual.update(novos)
    cabecalho = (
        '// GERADO por scripts/gen-narration.py (edge-tts + ffmpeg). Marcas de início\n'
        '// de cada cena (s) no MP3 único da pílula (public/audio/narration/{id}.mp3).\n'
        '// Regerar junto com os áudios quando o texto do roteiro muda — se as marcas\n'
        '// ficarem defasadas, o slide troca fora da hora da fala.\n'
        'export const NARRATION_TIMINGS: Record<string, number[]> = '
    )
    TIMINGS.write_text(cabecalho + json.dumps(atual, indent=2, ensure_ascii=False) + ';\n',
                       encoding='utf-8')


async def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids', default='', help='ids separados por vírgula')
    ap.add_argument('--todos', action='store_true')
    ap.add_argument('--voz', default=VOZ_PADRAO)
    ap.add_argument('--rate', default=RATE_PADRAO)
    a = ap.parse_args()

    if not MANIFESTO.exists():
        print(f'Falta {MANIFESTO.name}. Rode antes: npx tsx scripts/gen-narration.ts', file=sys.stderr)
        return 1

    itens = json.loads(MANIFESTO.read_text(encoding='utf-8'))
    alvos = [x.strip() for x in a.ids.split(',') if x.strip()]
    if not alvos and not a.todos:
        print('Diga o que gerar: --ids a,b  ou  --todos', file=sys.stderr)
        return 1

    porPilula: dict[str, list[str]] = {}
    for it in itens:
        if a.todos or it['id'] in alvos:
            porPilula.setdefault(it['id'], []).append(it['text'])

    faltando = [i for i in alvos if i not in porPilula]
    if faltando:
        print(f'Sem roteiro no manifesto: {", ".join(faltando)}', file=sys.stderr)
        return 1

    SAIDA.mkdir(parents=True, exist_ok=True)
    tmp = SAIDA / '.tmp'
    tmp.mkdir(exist_ok=True)

    silencio = tmp / 'silencio.mp3'
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi',
         '-i', 'anullsrc=r=24000:cl=mono', '-t', str(PAUSA_S),
         '-c:a', 'libmp3lame', '-b:a', '96k', str(silencio)], check=True)

    novos: dict[str, list[float]] = {}
    for pid, falas in porPilula.items():
        partes, marcas, t = [], [], 0.0
        for i, fala in enumerate(falas):
            parte = tmp / f'{pid}-{i}.mp3'
            await sintetiza(fala, parte, a.voz, a.rate)
            partes.append(parte)
            marcas.append(round(t, 2))
            t += duracao(parte) + PAUSA_S
        destino = SAIDA / f'{pid}.mp3'
        junta(partes, silencio, destino)
        novos[pid] = marcas
        print(f'  {pid}: {len(falas)} cenas · {duracao(destino):.1f}s · {destino.stat().st_size // 1024} KB')

    grava_timings(novos)
    for f in tmp.iterdir():
        f.unlink()
    tmp.rmdir()
    print(f'\n{len(novos)} pílula(s) com locução em {a.voz} ({a.rate}).')
    return 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
