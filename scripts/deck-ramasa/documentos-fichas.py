# -*- coding: utf-8 -*-
"""
As FICHAS TÉCNICAS em tamanho de valer, para o slide "ABA 6 DE 7".

Mesmo princípio do slide de Condições: o que o cliente precisa ver é a PEÇA,
não a tela do app listando a peça. Entram as duas fichas que a GSS produziu —
Jaecoo 7 e Jaecoo 5 — direto do PDF que está publicado no app.

A ficha do Jaecoo 5 é a que foi corrigida em 29/09 (dizia 279 cv no comparativo
e a ficha da marca diz 224).

Uso: python3 documentos-fichas.py <pasta> <saida.png>
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import sys

PASTA, SAIDA = sys.argv[1], sys.argv[2]
E = 2
L, A = 600 * E, 540 * E
GOLD = (201, 168, 76)
A_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

def sombra(base, peca, x, y, desvio, desfoque, forca):
    s = Image.new('RGBA', (L, A), (0, 0, 0, 0))
    sil = Image.new('RGBA', peca.size, (0, 0, 0, forca))
    s.paste(sil, (x + desvio[0], y + desvio[1]), peca)
    base.alpha_composite(s.filter(ImageFilter.GaussianBlur(desfoque)))

def papel(caminho, alt_pt):
    im = Image.open(caminho).convert('RGB')
    h = alt_pt * E
    w = round(h * im.width / im.height)
    im = im.resize((w, h), Image.LANCZOS)
    p = Image.new('RGBA', (w + 6, h + 6), (255, 255, 255, 255))
    p.paste(im, (3, 3))
    return p

base = Image.new('RGBA', (L, A), (0, 0, 0, 0))

j7 = papel(f'{PASTA}/ficha-jaecoo-7-1.png', 438)
x, y = 22 * E, 36 * E
sombra(base, j7, x, y, (9 * E, 13 * E), 15 * E, 190)
base.alpha_composite(j7, (x, y))

j5 = papel(f'{PASTA}/ficha-jaecoo-5-1.png', 372)
x, y = 304 * E, 124 * E
sombra(base, j5, x, y, (9 * E, 13 * E), 15 * E, 200)
base.alpha_composite(j5, (x, y))

d = ImageDraw.Draw(base)
fonte = ImageFont.truetype(A_BOLD, 10 * E)
texto = 'A FICHA TÉCNICA DE CADA MODELO, VERSÃO POR VERSÃO'
larg = d.textlength(texto, font=fonte)
d.text(((L - larg) / 2, 500 * E), texto, font=fonte, fill=GOLD + (255,))

base.save(SAIDA)
print('fichas:', SAIDA, base.size)
