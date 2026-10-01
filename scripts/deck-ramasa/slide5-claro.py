# -*- coding: utf-8 -*-
"""
A MOBÍLIA CLARA do slide "O que é o Eleva".

POR QUE UMA IMAGEM, E NÃO FORMAS. O AppleScript do Keynote não define o fundo
do slide nem o preenchimento de uma forma, e formas não podem ser copiadas
entre slides ("Shapes can not be copied"). Imagem de arquivo, essa sim, entra.
Então tudo o que tem COR DE FUNDO vira uma imagem só — fundo, os dois painéis,
os nove círculos dourados e a faixa escura — e o TEXTO volta nativo por cima,
para a Vivian poder editar.

OS CÍRCULOS SÃO RECORTADOS DO PRÓPRIO SLIDE, do render em 2×: assim os ícones
são exatamente os mesmos, sem ter de adivinhar qual ícone do lucide é cada um.

Uso: python3 slide5-claro.py <render-2x.png> <saida.png>
"""
from PIL import Image, ImageDraw, ImageFilter
import sys

ORIGEM, SAIDA = sys.argv[1], sys.argv[2]
E = 2                      # o slide tem 960×540 pt; a imagem sai em 2×
L, A = 960 * E, 540 * E

FUNDO  = (244, 245, 249)   # #F4F5F9, o claro dos outros slides do deck
CARTAO = (255, 255, 255)
BORDA  = (223, 227, 236)
ESCURO = (22, 24, 42)

CIRCULOS = [(76, 241), (76, 283), (76, 325), (76, 366), (76, 408),
            (520, 241), (520, 283), (520, 325), (520, 366)]
PAINEIS = [(50, 196, 415, 266), (495, 196, 415, 266)]
FAIXA = (520, 414, 364, 42)

def cartao(base, x, y, w, h, raio=16):
    """Cartão branco com sombra macia — o mesmo tratamento dos slides claros."""
    x, y, w, h = x * E, y * E, w * E, h * E
    r = raio * E
    sombra = Image.new('RGBA', (L, A), (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle([x, y + 4 * E, x + w, y + h + 4 * E], r, fill=(23, 32, 61, 36))
    sombra = sombra.filter(ImageFilter.GaussianBlur(9 * E))
    base.alpha_composite(sombra)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle([x, y, x + w, y + h], r, fill=CARTAO + (255,), outline=BORDA + (255,), width=1)

base = Image.new('RGBA', (L, A), FUNDO + (255,))
for p in PAINEIS:
    cartao(base, *p)

# a faixa escura ("Tudo com a cara da sua marca") continua escura: contraste
# de verdade contra o cartão branco, igual aos quadros NA RAMASA do slide 24
fx, fy, fw, fh = [v * E for v in FAIXA]
ImageDraw.Draw(base).rounded_rectangle([fx, fy, fx + fw, fy + fh], 10 * E, fill=ESCURO + (255,))

# os círculos dourados, recortados do slide escuro e remontados em disco
origem = Image.open(ORIGEM).convert('RGBA')
mascara = Image.new('L', (30 * E, 30 * E), 0)
ImageDraw.Draw(mascara).ellipse([0, 0, 30 * E - 1, 30 * E - 1], fill=255)
for cx, cy in CIRCULOS:
    pedaco = origem.crop((cx * E, cy * E, (cx + 30) * E, (cy + 30) * E))
    base.paste(pedaco, (cx * E, cy * E), mascara)

base.convert('RGB').save(SAIDA)
print('mobília:', SAIDA, base.size)
