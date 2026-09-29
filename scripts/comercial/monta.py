#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monta o comercial: 1920×1080, para tocar dentro da apresentação.

COMO O MOVIMENTO É FEITO. A captura traz a PÁGINA INTEIRA num PNG alto. Aqui a
janela de recorte desce sobre essa imagem, quadro a quadro, com aceleração
suave nas pontas — é isso que faz a tela parecer rolada por um dedo, sem
precisar gravar vídeo do navegador (que sai com queda de quadro e cursor).

AS DURAÇÕES VÊM DA LOCUÇÃO, não de chute: cada cena dura o áudio dela mais um
respiro. Os cortes são secos, que é o que dá ritmo de comercial.

Uso: python3 monta.py <pasta> <saida.mp4>
"""
import json, subprocess, sys, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.path.insert(0, str(Path(__file__).parent))
from roteiro import CENAS

BASE = Path(sys.argv[1])
SAIDA = Path(sys.argv[2])
TELAS, VOZ = BASE / 'telas', BASE / 'voz'
QUADROS = BASE / 'quadros'
# SO_AUDIO=1 remonta só a trilha e a mixagem, reaproveitando os quadros já
# desenhados — ajustar volume não devia custar 40 s de desenho.
import os
SO_AUDIO = os.environ.get('SO_AUDIO') == '1' and QUADROS.exists()
if not SO_AUDIO:
    if QUADROS.exists(): shutil.rmtree(QUADROS)
    QUADROS.mkdir(parents=True)

W, H, FPS = 1920, 1080, 30
NAVY   = (15, 15, 30)
NAVY2  = (24, 28, 48)
GOLD   = (201, 168, 76)
WHITE  = (255, 255, 255)
NEVOA  = (190, 196, 214)
CINZA  = (120, 128, 148)

G_BOLD = '/System/Library/Fonts/Supplemental/Georgia Bold.ttf'
A_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
A_REG  = '/System/Library/Fonts/Supplemental/Arial.ttf'
f_titulo = ImageFont.truetype(G_BOLD, 62)
f_grande = ImageFont.truetype(G_BOLD, 96)
f_olho   = ImageFont.truetype(A_BOLD, 24)
f_apoio  = ImageFont.truetype(A_REG, 30)
f_marca  = ImageFont.truetype(G_BOLD, 34)

# ---- o aparelho ----------------------------------------------------------
TELA_H = 900
TELA_W = round(TELA_H * 390 / 844)     # a proporção do visor do celular
BORDA, RAIO = 14, 24
# RAIO era 42 e comia o rótulo da última aba ("Tira-dúvida" virava
# "Tira-dúvid"): a curva do canto passa por cima da barra, que vai de ponta a
# ponta. 24 arredonda o suficiente para parecer aparelho sem cortar conteúdo.
TELA_X, TELA_Y = 1318, (H - TELA_H) // 2

def moldura_e_mascara():
    """O corpo do aparelho (desenhado uma vez) e a máscara de canto da tela."""
    corpo = Image.new('RGBA', (TELA_W + BORDA * 2, TELA_H + BORDA * 2), (0, 0, 0, 0))
    ImageDraw.Draw(corpo).rounded_rectangle([0, 0, corpo.width, corpo.height], RAIO + BORDA, fill=(10, 13, 26, 255))
    # sombra própria, para o aparelho descolar do fundo
    sombra = Image.new('RGBA', (corpo.width + 120, corpo.height + 120), (0, 0, 0, 0))
    sil = Image.new('RGBA', corpo.size, (0, 0, 0, 150))
    sombra.paste(sil, (60, 72), corpo)
    sombra = sombra.filter(ImageFilter.GaussianBlur(34))
    mask = Image.new('L', (TELA_W, TELA_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, TELA_W, TELA_H], RAIO, fill=255)
    return corpo, sombra, mask

CORPO, SOMBRA, MASK = moldura_e_mascara()

# ---- texto ---------------------------------------------------------------
def quebra(d, texto, fonte, larg):
    linhas, atual = [], ''
    for p in texto.split():
        t = f'{atual} {p}'.strip()
        if d.textlength(t, font=fonte) > larg and atual:
            linhas.append(atual); atual = p
        else:
            atual = t
    if atual: linhas.append(atual)
    return linhas

# Palavras que ganham ouro: são o dado, e o dado é o argumento.
DESTAQUE = {'vinte': GOLD, 'três': GOLD, 'duzentos': GOLD, 'cinquenta': GOLD, 'seis': GOLD,
            'e': None, 'vídeos.': GOLD, 'vídeos': GOLD, '23': GOLD, '256': GOLD}

def escreve(d, x, y, linhas, fonte, cor, entrelinha, destacar=None):
    for linha in linhas:
        if destacar:
            cx = x
            for palavra in linha.split():
                limpa = palavra.strip('.,').lower()
                c = GOLD if limpa in destacar else cor
                d.text((cx, y), palavra, font=fonte, fill=c)
                cx += d.textlength(palavra + ' ', font=fonte)
        else:
            d.text((x, y), linha, font=fonte, fill=cor)
        y += entrelinha
    return y

def fundo():
    """Navy com um halo frio atrás do aparelho — o fundo chapado achatava tudo."""
    im = Image.new('RGB', (W, H), NAVY)
    halo = Image.new('RGB', (W, H), NAVY)
    d = ImageDraw.Draw(halo)
    d.ellipse([TELA_X - 420, TELA_Y - 300, TELA_X + TELA_W + 420, TELA_Y + TELA_H + 300], fill=NAVY2)
    halo = halo.filter(ImageFilter.GaussianBlur(190))
    return Image.blend(im, halo, 0.85)

FUNDO = fundo()

def camada_texto(cena, i, total):
    """A parte parada do quadro: marca, olho, frase e barra de progresso."""
    cam = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(cam)
    X, LARG = 150, 1000

    d.text((X, 78), 'ELEVA', font=f_marca, fill=WHITE)
    # A seta é DESENHADA. O glifo "↗" não existe na Arial e saía quadradinho —
    # é a mesma seta da marca no app, só que feita com traço.
    sx = X + d.textlength('ELEVA', font=f_marca) + 16
    sy = 84
    d.line([(sx, sy + 20), (sx + 20, sy)], fill=GOLD, width=4)
    d.line([(sx + 6, sy), (sx + 20, sy)], fill=GOLD, width=4)
    d.line([(sx + 20, sy), (sx + 20, sy + 14)], fill=GOLD, width=4)

    if cena['id'] == 'fecho':
        d.text((X, 392), 'ELEVA', font=ImageFont.truetype(G_BOLD, 132), fill=WHITE)
        d.text((X + 6, 560), cena['apoio'], font=ImageFont.truetype(A_BOLD, 34), fill=GOLD)
        d.text((X + 6, 622), 'gsseleva.com.br', font=f_apoio, fill=NEVOA)
        return cam

    olho = cena['titulo'] if cena['id'] != 'abertura' else 'No salão'
    d.text((X, 300), olho.upper(), font=f_olho, fill=GOLD)

    fonte = f_grande if cena['id'] == 'abertura' else f_titulo
    texto = cena['titulo'] if cena['id'] == 'abertura' else cena['fala']
    linhas = quebra(d, texto, fonte, LARG)
    y = escreve(d, X, 356, linhas, fonte, WHITE, int(fonte.size * 1.28),
                destacar=DESTAQUE if cena['id'] == 'painel' else None)

    if cena['id'] == 'abertura':
        d.text((X, y + 26), cena['apoio'], font=f_apoio, fill=NEVOA)
    return cam

def barra(d, fracao):
    d.rectangle([0, H - 7, W, H], fill=(28, 32, 54))
    d.rectangle([0, H - 7, int(W * fracao), H], fill=GOLD)

# ---- cada cena -----------------------------------------------------------
def dur(cena):
    mp3 = VOZ / f"{cena['id']}.mp3"
    s = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                              '-of', 'csv=p=0', str(mp3)], capture_output=True, text=True).stdout.strip())
    # respiro: o corte seco em cima da última sílaba corta a frase na boca
    # A abertura ganhava o mesmo respiro do fecho e ficava 1,2 s parada antes de
    # cortar — tempo morto logo no começo, que é onde o comercial se perde.
    return s + (0.5 if cena['id'] == 'abertura' else 1.15 if cena['id'] == 'fecho' else 0.6)

def suave(t):
    """Aceleração nas pontas. Rolagem linear denuncia que é máquina."""
    return t * t * (3 - 2 * t)

# As barras fixas (cabeçalho e abas) não vêm na imagem alta — elas foram
# apagadas na captura de propósito, porque `position: fixed` as desenhava no
# meio da página. Voltam aqui, recortadas do visor, por cima do conteúdo que
# corre. É exatamente o que a pessoa vê: o conteúdo anda, as barras ficam.
MEDIDAS = json.loads((TELAS / 'medidas.json').read_text(encoding='utf-8'))

def sem_rolagem(tela):
    """A página cabe no visor? Então não há nada para rolar — e aí a imagem
    certa é o VISOR, não a página inteira.

    Importa porque a barra de digitar do Tira-dúvida também é fixa: na captura
    além do visor ela era desenhada fora de lugar e o botão do microfone
    aparecia cortado ao meio pela barra de abas."""
    m = MEDIDAS[tela.replace('.png', '')]
    return m['altura'] <= 884


def barras_de(tela):
    ident = tela.replace('.png', '')
    m = MEDIDAS[ident]
    visor = Image.open(TELAS / f'{ident}-visor.png').convert('RGB')
    escala = TELA_W / visor.width
    alvo_w, alvo_h = TELA_W, round(visor.height * escala)
    visor = visor.resize((alvo_w, alvo_h), Image.LANCZOS)
    h_cab = round(m['cabecalho'] * 3 * escala)
    h_nav = round(m['nav'] * 3 * escala)
    cab = visor.crop((0, 0, alvo_w, h_cab))
    nav = visor.crop((0, alvo_h - h_nav, alvo_w, alvo_h))
    return cab, nav, h_nav

duracoes = [dur(c) for c in CENAS]
TOTAL = sum(duracoes)
print(f'{len(CENAS)} cenas · {TOTAL:.1f}s · {round(TOTAL * FPS)} quadros')

n = 0
decorrido = 0.0
for i, (cena, d_cena) in enumerate([] if SO_AUDIO else list(zip(CENAS, duracoes))):
    quadros_cena = round(d_cena * FPS)
    texto = camada_texto(cena, i, len(CENAS))

    alto = cab = nav = None
    parada = False
    if cena['tela']:
        parada = sem_rolagem(cena['tela'])
        fonte_img = TELAS / (cena['tela'].replace('.png', '-visor.png') if parada else cena['tela'])
        alto = Image.open(fonte_img).convert('RGB')
        escala = TELA_W / alto.width          # a captura é 3× o CSS
        alto = alto.resize((TELA_W, round(alto.height * escala)), Image.LANCZOS)
        if parada:
            de = ate = 0
        else:
            cab, nav, h_nav = barras_de(cena['tela'])
            css_para_px = escala * 3          # 1 px de CSS vira isto na imagem já escalada
            de = cena['de'] * css_para_px
            ate = (cena['ate'] * css_para_px) if cena['ate'] is not None else de
            ate = min(ate, max(0, alto.height - TELA_H))
            de = min(de, max(0, alto.height - TELA_H))

    for k in range(quadros_cena):
        t = k / max(1, quadros_cena - 1)
        q = FUNDO.copy()

        if alto is not None:
            # entrada: desliza 70 px e materializa em 0,45 s
            ent = min(1.0, k / (0.45 * FPS))
            desl = int(70 * (1 - suave(ent)))
            y = int(de + (ate - de) * suave(t))
            visor = alto.crop((0, y, TELA_W, y + TELA_H)).convert('RGB')
            if not parada:
                visor.paste(cab, (0, 0))
                visor.paste(nav, (0, TELA_H - h_nav))
            painel = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            painel.paste(SOMBRA, (TELA_X - BORDA - 60, TELA_Y - BORDA - 60), SOMBRA)
            painel.paste(CORPO, (TELA_X - BORDA, TELA_Y - BORDA), CORPO)
            painel.paste(visor, (TELA_X, TELA_Y), MASK)
            if ent < 1:
                painel.putalpha(painel.getchannel('A').point(lambda v, e=ent: int(v * e)))
            q.paste(painel, (desl, 0), painel)

        # texto entra um pouco depois do aparelho, subindo
        # (e) sem aparelho para esperar, o texto entra na hora
        atraso = 0.0 if alto is None else 0.12
        ent_t = min(1.0, max(0.0, (k - atraso * FPS) / (0.38 * FPS)))
        # A cena sem celular não tem movimento nenhum e o quadro CONGELA por
        # segundos — num comercial isso parece travamento. A deriva lenta é
        # quase imperceptível parada e resolve inteiro em movimento.
        deriva = int(14 * t) if alto is None else 0
        sobe = int(26 * (1 - suave(ent_t))) - deriva
        cam = texto.copy()
        if ent_t < 1:
            cam.putalpha(cam.getchannel('A').point(lambda v, e=ent_t: int(v * e)))
        q.paste(cam, (0, sobe), cam)

        d = ImageDraw.Draw(q)
        barra(d, (decorrido + k / FPS) / TOTAL)
        q.save(QUADROS / f'{n:05d}.png')
        n += 1
    decorrido += d_cena
    print(f"   {cena['id']}: {d_cena:.1f}s")

print('quadros reaproveitados' if SO_AUDIO else f'{n} quadros desenhados')

# ---- áudio ---------------------------------------------------------------
#
# A TRILHA VEM DO PRÓPRIO MAC. Dois loops do mesmo kit do GarageBand ("Go Time"):
# mesmo kit = mesmo andamento e mesma tonalidade, então eles casam sem ajuste.
# Loops de kits diferentes têm durações diferentes (7,44s contra 8,00s) e vão
# saindo de compasso ao longo do vídeo — foi por isso que escolhi pelo tamanho
# exato, não pelo nome.
LOOPS = ['/Library/Audio/Apple Loops/Apple/04 Modern RnB/Go Time Beat 01.caf',
         '/Library/Audio/Apple Loops/Apple/04 Modern RnB/Go Time Layered Bass.caf']

def roda(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-1500:]); sys.exit(1)

audio = BASE / 'audio'; audio.mkdir(exist_ok=True)

# 1) a locução, cena por cena, esticada até a duração da cena.
#    O atraso de 0,35 s existe para a imagem entrar ANTES da voz: voz que começa
#    junto com o corte parece dublagem mal encaixada.
pedacos = []
for cena, d_cena in zip(CENAS, duracoes):
    dest = audio / f"{cena['id']}.wav"
    roda(['ffmpeg', '-y', '-i', str(VOZ / f"{cena['id']}.mp3"),
          '-af', f'adelay=350|350,apad=whole_dur={d_cena:.3f}',
          '-t', f'{d_cena:.3f}', '-ar', '48000', '-ac', '2', str(dest)])
    pedacos.append(dest)

lista = audio / 'lista.txt'
lista.write_text(''.join(f"file '{p}'\n" for p in pedacos), encoding='utf-8')
roda(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', str(lista), '-c', 'copy', str(audio / 'voz.wav')])

# 2) a trilha, em volume de CAMA.
#    Medido: a 0.17 ela ficava 1,7 dB abaixo da voz e disputava a frase. Cama de
#    trilha para locução vive uns 11 dB abaixo — daí o 0.055. Confira com
#    `ffmpeg -i trilha.wav -af volumedetect -f null -` antes de mudar no olho.
roda(['ffmpeg', '-y',
      '-stream_loop', '-1', '-i', LOOPS[0],
      '-stream_loop', '-1', '-i', LOOPS[1],
      '-filter_complex',
      f'[0:a]volume=1.0[a];[1:a]volume=0.85[b];[a][b]amix=inputs=2:duration=shortest:normalize=0[m];'
      f'[m]atrim=0:{TOTAL:.3f},asetpts=N/SR/TB,afade=t=in:st=0:d=1.0,afade=t=out:st={max(0, TOTAL - 2.2):.3f}:d=2.2,volume=0.055[s]',
      '-map', '[s]', '-ar', '48000', '-ac', '2', '-t', f'{TOTAL:.3f}', str(audio / 'trilha.wav')])

# O loudnorm no fim: a mistura crua saía com média de -21 dB, baixa demais para
# um notebook ligado numa TV de sala de reunião. -16 LUFS é o padrão de vídeo.
roda(['ffmpeg', '-y', '-i', str(audio / 'voz.wav'), '-i', str(audio / 'trilha.wav'),
      '-filter_complex',
      '[0:a][1:a]amix=inputs=2:duration=longest:normalize=0[m];[m]loudnorm=I=-16:TP=-1.5:LRA=11[a]',
      '-map', '[a]', '-ar', '48000', '-ac', '2', str(audio / 'mix.wav')])

# 3) imagem + som
roda(['ffmpeg', '-y', '-framerate', str(FPS), '-i', str(QUADROS / '%05d.png'),
      '-i', str(audio / 'mix.wav'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow',
      '-c:a', 'aac', '-b:a', '192k', '-shortest', str(SAIDA)])
print('vídeo:', SAIDA)
