# -*- coding: utf-8 -*-
"""
As três telas de Condições em leque, para o slide "ABA 4 DE 7".

A Vivian pediu para o slide mostrar um pouco mais de DENTRO da aba — os assets
que a GSS produziu: a campanha da casa e o acessório com roteiro. Então o
aparelho único vira três: a aba como ela abre, a arte da Premiação de setembro
dentro do app, e a ficha do acessório com o roteiro de 45 segundos.

Fundo TRANSPARENTE: a imagem é colada por cima do painel escuro que já existe
no slide, e o painel tem de continuar aparecendo em volta.

Uso: python3 condicoes-leque.py <pasta-das-telas> <saida.png>
"""
from PIL import Image, ImageDraw, ImageFilter
import sys

TELAS, SAIDA = sys.argv[1], sys.argv[2]
E = 2                       # o slide é 960×540 pt; a imagem sai em 2×
L, A = 360 * E, 450 * E     # a área útil dentro do painel escuro

# (arquivo, x, largura) em pt — a de trás, a da frente, a de trás
ORDEM = [
    ('condicoes.png',     0, 130),
    ('acessorio.png',   230, 130),
    ('cond-campanha.png', 93, 175),   # por último = na frente
]
ALTURA_Y = {130: 95, 175: 45}

RAIO, BORDA = 11, 5

def aparelho(arquivo, larg_pt):
    """Uma tela com moldura e canto arredondado, já no tamanho do leque."""
    im = Image.open(f'{TELAS}/{arquivo}').convert('RGB')
    w = larg_pt * E
    h = round(w * im.height / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w, h], RAIO * E, fill=255)
    tela = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    tela.paste(im, (0, 0), mask)
    b = BORDA * E
    corpo = Image.new('RGBA', (w + b * 2, h + b * 2), (0, 0, 0, 0))
    ImageDraw.Draw(corpo).rounded_rectangle([0, 0, corpo.width, corpo.height], (RAIO + BORDA) * E, fill=(8, 10, 20, 255))
    corpo.alpha_composite(tela, (b, b))
    return corpo

base = Image.new('RGBA', (L, A), (0, 0, 0, 0))
for arquivo, x_pt, larg_pt in ORDEM:
    peca = aparelho(arquivo, larg_pt)
    x, y = x_pt * E, ALTURA_Y[larg_pt] * E
    # sombra própria: sem ela as telas de trás colam na da frente
    sombra = Image.new('RGBA', (L, A), (0, 0, 0, 0))
    sil = Image.new('RGBA', peca.size, (0, 0, 0, 165))
    sombra.paste(sil, (x + 6 * E, y + 9 * E), peca)
    base.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(11 * E)))
    base.alpha_composite(peca, (x, y))

base.save(SAIDA)
print('leque:', SAIDA, base.size)
