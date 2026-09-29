#!/usr/bin/env python3
"""
A locução do comercial. Voz Francisca — a voz do Eleva.

Os tutoriais usam a Thalita de propósito (ela é melhor em texto instrucional).
Comercial não é instrução: aqui vale a voz que o time já ouve nas pílulas.

Uso: python3 narrar.py <pasta-de-saida>
"""
import asyncio, json, sys
from pathlib import Path
import edge_tts
sys.path.insert(0, str(Path(__file__).parent))
from roteiro import CENAS

VOZ = 'pt-BR-FranciscaNeural'
RATE = '+6%'   # comercial anda mais rápido que tutorial
PRAZO = 45     # o serviço da Microsoft pendura: prazo e três tentativas

SAIDA = Path(sys.argv[1]) / 'voz'
SAIDA.mkdir(parents=True, exist_ok=True)

async def _gera(texto, destino):
    palavras = []
    with open(destino, 'wb') as f:
        async for p in edge_tts.Communicate(texto, VOZ, rate=RATE, boundary='WordBoundary').stream():
            if p['type'] == 'audio':
                f.write(p['data'])
            elif p['type'] == 'WordBoundary':
                palavras.append({'t': p['offset'] / 1e7, 'd': p['duration'] / 1e7, 'w': p['text']})
    return palavras

async def uma(texto, destino):
    for tentativa in range(1, 4):
        try:
            palavras = await asyncio.wait_for(_gera(texto, destino), PRAZO)
            if destino.exists() and destino.stat().st_size > 2000 and palavras:
                destino.with_suffix('.json').write_text(json.dumps(palavras, ensure_ascii=False), encoding='utf-8')
                return True
        except Exception as e:
            print(f'      tentativa {tentativa} falhou: {e}')
    return False

async def main():
    for c in CENAS:
        destino = SAIDA / f"{c['id']}.mp3"
        if destino.exists() and destino.with_suffix('.json').exists():
            print(f"   {c['id']}: já existe")
            continue
        ok = await uma(c['fala'], destino)
        print(f"   {c['id']}: {'ok' if ok else 'FALHOU'}")
        if not ok:
            sys.exit(1)

asyncio.run(main())
print('locução pronta:', SAIDA)
