# -*- coding: utf-8 -*-
"""
Os MATERIAIS da aba Condições, em tamanho de valer.

A primeira versão deste slide tinha três telas de celular espremidas num painel
de 378 pt — 39% da largura do slide — e nada era legível. A Vivian foi direta:
"precisa destacar os materiais que criamos; pode reduzir a parte de texto".

Então o painel cresce para 620 pt e entram as DUAS peças que a GSS produziu,
grandes: a arte da Premiação de setembro e a ficha do acessório para o cliente
(a folha que sai sem preço e sem código de peça). O celular sai — ele já
aparece nas outras seis abas.

Uso: python3 condicoes-materiais.py <pasta-das-telas> <saida.png>
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import sys

PASTA, SAIDA = sys.argv[1], sys.argv[2]
E = 2
L, A = 600 * E, 540 * E          # o painel escuro inteiro
GOLD = (201, 168, 76)
A_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

ARTE = '/Users/viviangitti/Downloads/Campanha setembro — sem fotos (no ar).jpg'

def sombra(base, peca, x, y, desvio, desfoque, forca):
    s = Image.new('RGBA', (L, A), (0, 0, 0, 0))
    sil = Image.new('RGBA', peca.size, (0, 0, 0, forca))
    s.paste(sil, (x + desvio[0], y + desvio[1]), peca)
    base.alpha_composite(s.filter(ImageFilter.GaussianBlur(desfoque)))

def papel(im, alt_pt):
    """Documento com borda branca fina — lê como folha, não como print."""
    h = alt_pt * E
    w = round(h * im.width / im.height)
    im = im.resize((w, h), Image.LANCZOS)
    p = Image.new('RGBA', (w + 6, h + 6), (255, 255, 255, 255))
    p.paste(im, (3, 3))
    return p

base = Image.new('RGBA', (L, A), (0, 0, 0, 0))

# 1) a arte da campanha, a peça mais vistosa: vai atrás e à esquerda
arte = papel(Image.open(ARTE).convert('RGB'), 424)
ax, ay = 28 * E, 42 * E
sombra(base, arte, ax, ay, (9 * E, 13 * E), 15 * E, 185)
base.alpha_composite(arte, (ax, ay))

# 2) a ficha do acessório, recortada da tela: só a folha, sem o app em volta
tela = Image.open(f'{PASTA}/telas/ficha-acessorio.png').convert('RGB')
# a folha ocupa x 50..1120, y 575..1880 na captura de 1170 px
ficha = papel(tela.crop((50, 575, 1120, 1880)), 352)
fx, fy = 306 * E, 126 * E
sombra(base, ficha, fx, fy, (9 * E, 13 * E), 15 * E, 195)
base.alpha_composite(ficha, (fx, fy))

# 3) a legenda, para o cliente saber o que está olhando
d = ImageDraw.Draw(base)
fonte = ImageFont.truetype(A_BOLD, 10 * E)
texto = 'A CAMPANHA DA CASA  ·  A FOLHA DO ACESSÓRIO PARA O CLIENTE'
larg = d.textlength(texto, font=fonte)
d.text(((L - larg) / 2, 497 * E), texto, font=fonte, fill=GOLD + (255,))

base.save(SAIDA)
print('materiais:', SAIDA, base.size)
