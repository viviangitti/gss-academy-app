# -*- coding: utf-8 -*-
"""Moldura de celular para as 7 capturas de aba. Uso: python3 prepara-abas.py <pasta>"""
from PIL import Image, ImageDraw, ImageFilter
import os, sys

BASE = sys.argv[1]
os.makedirs(f'{BASE}/deck-img', exist_ok=True)
RAIO, BORDA = 54, 14

def moldura(nome):
    im = Image.open(f'{BASE}/telas/{nome}').convert('RGBA')
    L, A = im.size
    mask = Image.new('L', (L, A), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, L, A], RAIO, fill=255)
    tela = Image.new('RGBA', (L, A), (0, 0, 0, 0))
    tela.paste(im, (0, 0), mask)
    fora = Image.new('RGBA', (L + BORDA * 2, A + BORDA * 2), (0, 0, 0, 0))
    ImageDraw.Draw(fora).rounded_rectangle([0, 0, fora.width, fora.height], RAIO + BORDA, fill=(14, 18, 32, 255))
    fora.alpha_composite(tela, (BORDA, BORDA))
    s = Image.new('RGBA', (fora.width + 90, fora.height + 90), (0, 0, 0, 0))
    sil = Image.new('RGBA', fora.size, (10, 16, 34, 110))
    s.paste(sil, (45, 54), fora)
    s = s.filter(ImageFilter.GaussianBlur(26))
    s.alpha_composite(fora, (45, 45))
    s.save(f'{BASE}/deck-img/{nome}')

for n in sorted(os.listdir(f'{BASE}/telas')):
    if n.endswith('.png'):
        moldura(n); print('  ', n)
