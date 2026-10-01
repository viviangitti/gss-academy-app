# -*- coding: utf-8 -*-
"""
"Ver como time" + o ONE-PAGE que sai dali.

A Vivian pediu o one-page neste slide: é o material que o vendedor manda pro
cliente, e ele nasce da ficha do carro que a gerência confere nesta tela. Então
o slide passa a mostrar as duas pontas — o catálogo como o time vê, e a folha
que chega no WhatsApp do cliente.

O rótulo "O QUE O CLIENTE RECEBE" vai DENTRO da imagem de propósito: sem ele a
folha aparece sem explicação, e os três textos do slide falam da aba, não dela.

Fundo transparente — o painel escuro do slide continua aparecendo em volta.

O terceiro argumento escolhe a ETAPA, porque o Keynote não deixa um script
criar animação: o efeito é feito com dois slides seguidos.
  'celular'  — só o aparelho (primeira etapa)
  'completo' — aparelho + one-page (segunda etapa)

Uso: python3 vercomotime-onepage.py <pasta> <saida.png> [celular|completo]
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import sys

PASTA, SAIDA = sys.argv[1], sys.argv[2]
ETAPA = sys.argv[3] if len(sys.argv) > 3 else 'completo'
E = 2
L, A = 360 * E, 450 * E
GOLD = (201, 168, 76)
A_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'

def sombra(base, peca, x, y, desvio, desfoque, forca):
    s = Image.new('RGBA', (L, A), (0, 0, 0, 0))
    sil = Image.new('RGBA', peca.size, (0, 0, 0, forca))
    s.paste(sil, (x + desvio[0], y + desvio[1]), peca)
    base.alpha_composite(s.filter(ImageFilter.GaussianBlur(desfoque)))

base = Image.new('RGBA', (L, A), (0, 0, 0, 0))

# 1) o aparelho, atrás e à esquerda: a aba como a gerência abre
cel = Image.open(f'{PASTA}/telas/ver-como-time.png').convert('RGB')
cw = 135 * E
ch = round(cw * cel.height / cel.width)
cel = cel.resize((cw, ch), Image.LANCZOS)
mask = Image.new('L', (cw, ch), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw, ch], 11 * E, fill=255)
tela = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
tela.paste(cel, (0, 0), mask)
b = 5 * E
corpo = Image.new('RGBA', (cw + b * 2, ch + b * 2), (0, 0, 0, 0))
ImageDraw.Draw(corpo).rounded_rectangle([0, 0, corpo.width, corpo.height], 16 * E, fill=(8, 10, 20, 255))
corpo.alpha_composite(tela, (b, b))
cx, cy = 0, 120 * E
sombra(base, corpo, cx, cy, (6 * E, 9 * E), 11 * E, 165)
base.alpha_composite(corpo, (cx, cy))

# 2) a folha, na frente: é ela que o cliente recebe.
#    Na primeira etapa ela não existe ainda — é justamente ela que "entra".
if ETAPA == 'celular':
    d = ImageDraw.Draw(base)
    fonte = ImageFont.truetype(A_BOLD, 10 * E)
    texto = 'TELA DA GERÊNCIA'
    larg = d.textlength(texto, font=fonte)
    d.text(((L - larg) / 2, 432 * E), texto, font=fonte, fill=GOLD + (255,))
    base.save(SAIDA)
    print('composição (só o celular):', SAIDA, base.size)
    sys.exit(0)

folha = Image.open(f'{PASTA}/onepage.png').convert('RGB')
fh = 372 * E
fw = round(fh * folha.width / folha.height)
folha = folha.resize((fw, fh), Image.LANCZOS)
papel = Image.new('RGBA', (fw + 4, fh + 4), (255, 255, 255, 255))
papel.paste(folha, (2, 2))
fx, fy = 84 * E, 30 * E
sombra(base, papel, fx, fy, (8 * E, 12 * E), 14 * E, 185)
base.alpha_composite(papel, (fx, fy))

# 3) UMA legenda só, dentro da imagem.
#    O slide já trazia "TELA DA GERÊNCIA" logo abaixo; com o rótulo da folha
#    por cima, as duas ficavam empilhadas e pareciam erro. Esta diz as duas
#    coisas, e a do slide é apagada na montagem.
d = ImageDraw.Draw(base)
fonte = ImageFont.truetype(A_BOLD, 10 * E)
texto = 'TELA DA GERÊNCIA  ·  O QUE O CLIENTE RECEBE'
larg = d.textlength(texto, font=fonte)
d.text(((L - larg) / 2, fy + fh + 20 * E), texto, font=fonte, fill=GOLD + (255,))

base.save(SAIDA)
print('composição:', SAIDA, base.size)
