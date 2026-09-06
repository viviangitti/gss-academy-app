#!/usr/bin/env python3
"""Locução guiada do tutorial.

Voz: Thalita Multilingual — a mesma que o gen-narration.py do app já usa como
padrão, e claramente mais natural que a Francisca em texto instrucional.

O serviço da Microsoft PENDURA de vez em quando: uma chamada fica aberta pra
sempre e o script inteiro para. Por isso cada cena tem prazo e três tentativas,
e o que já foi gerado não é refeito.
"""
import asyncio, json, subprocess, sys, os
from pathlib import Path
import edge_tts

VOZ = 'pt-BR-ThalitaMultilingualNeural'
RATE = '-6%'      # instrução pede um passo mais lento que narração comum
PRAZO = 45        # segundos por cena antes de desistir e tentar de novo

async def _gera(texto, destino):
    """Gera o MP3 E o tempo de cada palavra.

    O tempo vem do próprio sintetizador (WordBoundary), não de estimativa: é o
    que permite a legenda acender a palavra no instante em que ela é dita. Os
    valores vêm em unidades de 100 nanossegundos — dividir por 10 milhões dá
    segundos."""
    palavras = []
    with open(destino, 'wb') as f:
        async for pedaco in edge_tts.Communicate(texto, VOZ, rate=RATE, boundary='WordBoundary').stream():
            if pedaco['type'] == 'audio':
                f.write(pedaco['data'])
            elif pedaco['type'] == 'WordBoundary':
                palavras.append({'t': pedaco['offset'] / 1e7,
                                 'd': pedaco['duration'] / 1e7,
                                 'w': pedaco['text']})
    return palavras

async def uma(texto, destino):
    for tentativa in range(1, 4):
        try:
            palavras = await asyncio.wait_for(_gera(texto, destino), PRAZO)
            if destino.exists() and destino.stat().st_size > 2000 and palavras:
                destino.with_suffix('.json').write_text(
                    json.dumps(palavras, ensure_ascii=False), encoding='utf-8')
                return True
        except (asyncio.TimeoutError, Exception) as e:
            print(f'      tentativa {tentativa} falhou ({type(e).__name__}), repetindo')
            destino.unlink(missing_ok=True)
            await asyncio.sleep(2 * tentativa)
    return False

async def main(qual):
    cenas = json.loads(Path(f'falas-{qual}.json').read_text(encoding='utf-8'))
    saida = Path(f'audio-{qual}'); saida.mkdir(exist_ok=True)
    marca = Path(f'audio-{qual}/.voz')
    if marca.exists() and marca.read_text() != VOZ:
        for f in saida.glob('*.mp3'): f.unlink()   # trocou a voz: refaz tudo
    marca.write_text(VOZ)

    tempos = []
    for c in cenas:
        mp3 = saida / f"{c['id']}.mp3"
        if not (mp3.exists() and mp3.stat().st_size > 2000 and mp3.with_suffix('.json').exists()):
            if not await uma(c['fala'], mp3):
                print(f'  ✗ {c["id"]} não saiu'); sys.exit(1)
        dur = float(subprocess.run(
            ['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0', str(mp3)],
            capture_output=True, text=True).stdout.strip())
        tempos.append({'id': c['id'], 'dur': dur})
        print(f"  🎙  {c['id']}  {dur:.1f}s")
        await asyncio.sleep(0.6)   # respiro entre chamadas, pra não levar bloqueio
    Path(f'tempos-{qual}.json').write_text(json.dumps(tempos), encoding='utf-8')
    print(f"total: {sum(t['dur'] for t in tempos):.0f}s")

asyncio.run(main(sys.argv[1]))
