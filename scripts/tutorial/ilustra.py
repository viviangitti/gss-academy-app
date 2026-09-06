#!/usr/bin/env python3
"""OS PASSOS DO SAFARI, desenhados.

Os dois primeiros passos de instalar não acontecem no app — acontecem no
navegador: o botão Compartilhar e a lista que sobe. Não dá pra capturar isso do
Chrome sem fingir uma tela de iPhone, e tela fingida em vídeo de treinamento é
o tipo de coisa que confunde quando não bate com o aparelho da pessoa.

Então aqui é DESENHO, e parece desenho de propósito: fundo escuro, formas
simples, só o essencial. A pessoa reconhece o gesto sem achar que é print.

Tamanho igual ao das capturas (390x844 em 3x), pro montador tratar todos igual.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1170, 2532
FUNDO = (13, 13, 24)
CLARO = (238, 240, 248)
AZUL = (75, 141, 255)
CINZA = (128, 134, 158)
BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
REG = '/System/Library/Fonts/Supplemental/Arial.ttf'
f = lambda t, n: ImageFont.truetype(t, n)

saida = Path('ilustracoes'); saida.mkdir(exist_ok=True)

def base(titulo, passo):
    im = Image.new('RGB', (W, H), FUNDO)
    d = ImageDraw.Draw(im)
    d.text((W//2, 210), f'PASSO {passo}', font=f(BOLD, 46), fill=AZUL, anchor='mm')
    for i, linha in enumerate(titulo):
        d.text((W//2, 320 + i*76), linha, font=f(BOLD, 62), fill=CLARO, anchor='mm')
    return im, d

def seta_compartilhar(d, cx, cy, s, cor):
    """O ícone do Safari: quadrado com a seta pra cima saindo dele."""
    d.rounded_rectangle([cx-s*0.42, cy-s*0.18, cx+s*0.42, cy+s*0.62], s*0.12,
                        outline=cor, width=int(s*0.09))
    d.rectangle([cx-s*0.44, cy-s*0.24, cx+s*0.44, cy+s*0.10], fill=FUNDO)
    d.line([cx, cy-s*0.62, cx, cy+s*0.16], fill=cor, width=int(s*0.09))
    d.line([cx-s*0.26, cy-s*0.36, cx, cy-s*0.64], fill=cor, width=int(s*0.09))
    d.line([cx+s*0.26, cy-s*0.36, cx, cy-s*0.64], fill=cor, width=int(s*0.09))

# ---- 1: a barra do Safari, com o Compartilhar marcado ----
im, d = base(['No Safari, toque em', 'Compartilhar'], 1)
by = 1520
d.rounded_rectangle([90, by, W-90, by+230], 40, fill=(30, 31, 44))
pontos = [260, 430, 600, 770, 940]
for i, x in enumerate(pontos):
    if i == 2:
        seta_compartilhar(d, x, by+115, 120, AZUL)
    else:
        d.rounded_rectangle([x-34, by+82, x+34, by+150], 12, outline=CINZA, width=8)
d.rounded_rectangle([pontos[2]-110, by+10, pontos[2]+110, by+220], 34, outline=AZUL, width=10)
d.text((W//2, by+330), 'é o quadrado com a seta para cima', font=f(REG, 44), fill=CINZA, anchor='mm')
d.text((W//2, by+400), 'na barra de baixo do navegador', font=f(REG, 44), fill=CINZA, anchor='mm')
im.save(saida/'inst-1.png')

# ---- 2: a lista que sobe, com a opção certa marcada ----
im, d = base(['Desça a lista e escolha', 'Adicionar à Tela de Início'], 2)
ly = 1180
opcoes = ['Copiar', 'Adicionar aos Favoritos', 'Adicionar à Tela de Início', 'Marcar como Lida', 'Imprimir']
d.rounded_rectangle([90, ly-40, W-90, ly+len(opcoes)*150+40], 44, fill=(30, 31, 44))
for i, o in enumerate(opcoes):
    y = ly + 40 + i*150
    marcada = i == 2
    if marcada:
        d.rounded_rectangle([120, y-64, W-120, y+64], 26, fill=(30, 52, 104))
        d.rounded_rectangle([120, y-64, W-120, y+64], 26, outline=AZUL, width=8)
    d.text((190, y), o, font=f(BOLD if marcada else REG, 48),
           fill=CLARO if marcada else CINZA, anchor='lm')
    d.rounded_rectangle([W-230, y-34, W-162, y+34], 12, outline=AZUL if marcada else CINZA, width=6)
im.save(saida/'inst-2.png')

# ---- 3: o ícone na tela de início ----
im, d = base(['Pronto: o Eleva vira', 'aplicativo no seu celular'], 3)
ic = Image.open('/Users/viviangitti/gss/public/icon-192.png').convert('RGBA').resize((300, 300), Image.LANCZOS)
m = Image.new('L', ic.size, 0); ImageDraw.Draw(m).rounded_rectangle([0,0,300,300], 68, fill=255)
im.paste(ic, (W//2-150, 1360), m)
d.text((W//2, 1740), 'Eleva', font=f(BOLD, 52), fill=CLARO, anchor='mm')
d.text((W//2, 1900), 'Abre em tela cheia, sem procurar a aba', font=f(REG, 44), fill=CINZA, anchor='mm')
d.text((W//2, 1970), 'no meio das outras.', font=f(REG, 44), fill=CINZA, anchor='mm')
im.save(saida/'inst-3.png')

print('3 ilustrações em ilustracoes/')
