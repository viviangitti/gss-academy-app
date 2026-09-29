# -*- coding: utf-8 -*-
"""Prepara as telas para o deck: recorta, põe moldura de celular e gera os zooms."""
from PIL import Image, ImageDraw, ImageFilter
import os, qrcode

os.makedirs('deck-img', exist_ok=True)
RAIO = 54
BORDA = 14

def moldura(entrada, saida, corte=None):
    im = Image.open(f'telas/{entrada}').convert('RGBA')
    if corte:
        im = im.crop(corte)
    L, A = im.size
    # cantos arredondados
    mask = Image.new('L', (L, A), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, L, A], RAIO, fill=255)
    tela = Image.new('RGBA', (L, A), (0, 0, 0, 0))
    tela.paste(im, (0, 0), mask)
    # corpo do aparelho
    fora = Image.new('RGBA', (L + BORDA * 2, A + BORDA * 2), (0, 0, 0, 0))
    ImageDraw.Draw(fora).rounded_rectangle([0, 0, fora.width, fora.height], RAIO + BORDA, fill=(14, 18, 32, 255))
    fora.alpha_composite(tela, (BORDA, BORDA))
    # sombra
    s = Image.new('RGBA', (fora.width + 90, fora.height + 90), (0, 0, 0, 0))
    sil = Image.new('RGBA', fora.size, (10, 16, 34, 90))
    s.paste(sil, (45, 52), fora)
    s = s.filter(ImageFilter.GaussianBlur(26))
    s.alpha_composite(fora, (45, 45))
    s.save(f'deck-img/{saida}')
    return s.size

def zoom(entrada, saida, corte, escala=2.0):
    """Recorte ampliado com contorno dourado — o detalhe que o olho tem de pegar."""
    im = Image.open(f'telas/{entrada}').convert('RGBA').crop(corte)
    im = im.resize((int(im.width * escala), int(im.height * escala)), Image.LANCZOS)
    L, A = im.size
    f = Image.new('RGBA', (L + 16, A + 16), (0, 0, 0, 0))
    ImageDraw.Draw(f).rounded_rectangle([0, 0, f.width, f.height], 22, fill=(201, 168, 76, 255))
    m = Image.new('L', (L, A), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, L, A], 16, fill=255)
    f.paste(im, (8, 8), m)
    f.save(f'deck-img/{saida}')
    return f.size

TELAS = ['hoje', 'jornada', 'jornada-msg', 'jornada-acess', 'produto', 'objecoes', 'assistente',
         'condicoes', 'documentos', 'noticias', 'catalogo', 'painel', 'painel-time', 'cultura',
         'acessorios', 'material', 'trilha']
for t in TELAS:
    moldura(f'{t}.png', f'{t}.png')

# zooms: o campo da Jornada virando mensagem, e o acessório com preço
zoom('jornada.png', 'zoom-campos.png', (60, 800, 1110, 1190), 1.35)
zoom('acessorios.png', 'zoom-acessorio.png', (40, 1800, 1130, 2130), 1.35)

qr = qrcode.QRCode(box_size=18, border=2)
qr.add_data('https://gsseleva.com.br')
qr.make(fit=True)
qr.make_image(fill_color=(15, 15, 30), back_color='white').save('deck-img/qr.png')
print('imagens prontas:', len(os.listdir('deck-img')))
