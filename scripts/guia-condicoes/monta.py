# O GUIA DE UMA IMAGEM — os quatro passos num print só, pra mandar no WhatsApp.
#
# Quem precisa do guia vai lê-lo no celular, entre uma venda e outra. Então é
# uma imagem, não um PDF: abre no toque, dá zoom com o dedo e fica na conversa
# pra consultar no mês que vem.
#
# Uso: python3 scripts/guia-condicoes/monta.py <pasta>   (a mesma da captura)
import json, sys, os
from PIL import Image, ImageDraw, ImageFont

PASTA = sys.argv[1]
TELAS = os.path.join(PASTA, 'telas')
ALVOS = json.load(open(os.path.join(PASTA, 'alvos.json')))

NAVY   = (14, 27, 43)
TINTA  = (22, 32, 42)
SUAVE  = (105, 119, 132)
AZUL   = (37, 99, 235)
PAPEL  = (243, 245, 248)
BRANCO = (255, 255, 255)

A_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
A_REG  = '/System/Library/Fonts/Supplemental/Arial.ttf'
G_BOLD = '/System/Library/Fonts/Supplemental/Georgia Bold.ttf'
f = lambda p, t: ImageFont.truetype(p, t)

PASSOS = [
    ('1-onde-fica.png',        'Abra o Painel e vá em Conteúdo',
     'Role até “Condições comerciais” e toque em Subir tabela.'),
    ('2-escolher-arquivo.png', 'Escolha o PDF da carta',
     'O mesmo arquivo que você manda no grupo. Pode ser print ou foto também.'),
    ('3-o-app-corta.png',      'O app corta a carta sozinho',
     'Uma condição por página, com o título já lido. O rebate da rede é tapado.'),
    ('4-substituir-e-data.png','Marque Substituir e publique',
     'A carta velha sai do ar e a data de saída já vem da própria carta.'),
]

LARG_TELA = 700          # cada print, redimensionado
MARGEM, GAP = 64, 56
CABECA = 92              # espaço do número + título de cada passo
LINHA2 = 46              # altura de UMA linha de apoio; cresce se o texto quebrar

def quebra(texto, fonte, largura, desenho):
    """Quebra o texto na largura da coluna — sem isto a legenda de um passo
    invadia a do passo ao lado, e o guia ficava ilegível justo onde explica."""
    linhas, atual = [], ''
    for palavra in texto.split(' '):
        teste = (atual + ' ' + palavra).strip()
        if desenho.textlength(teste, font=fonte) <= largura:
            atual = teste
        else:
            if atual:
                linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def tela(arquivo):
    """O print com o anel vermelho em volta do que a pessoa tem que tocar."""
    im = Image.open(os.path.join(TELAS, arquivo)).convert('RGB')
    a = ALVOS[arquivo]
    d = ImageDraw.Draw(im)
    folga = 16
    cx = [a['x'] - folga, a['y'] - folga, a['x'] + a['w'] + folga, a['y'] + a['h'] + folga]
    for i, cor in ((0, (255, 255, 255)), (1, (224, 36, 36))):
        d.rounded_rectangle([cx[0] - i * 6, cx[1] - i * 6, cx[2] + i * 6, cx[3] + i * 6],
                            radius=22 + i * 6, outline=cor, width=7)
    esc = LARG_TELA / im.width
    im = im.resize((LARG_TELA, round(im.height * esc)), Image.LANCZOS)
    # Moldura do aparelho: separa o print do fundo sem inventar um celular.
    moldura = Image.new('RGB', (im.width + 12, im.height + 12), (218, 224, 231))
    moldura.paste(im, (6, 6))
    return moldura

prints = [tela(p[0]) for p in PASSOS]
alt_tela = max(p.height for p in prints)
col = LARG_TELA + 12
LARG = MARGEM * 2 + col * 2 + GAP
TOPO = 300

# Mede antes de montar: as legendas quebram em uma ou duas linhas, e a altura
# das fileiras tem que caber na maior delas.
regua = ImageDraw.Draw(Image.new('RGB', (1, 1)))
f_apoio = f(A_REG, 27)
LEGENDAS = [quebra(p[2], f_apoio, col, regua) for p in PASSOS]
APOIO = max(len(l) for l in LEGENDAS) * 38 + 12
ALT = TOPO + 2 * (CABECA + APOIO + alt_tela + GAP) + MARGEM

lona = Image.new('RGB', (LARG, ALT), PAPEL)
d = ImageDraw.Draw(lona)

# ---- cabeçalho ----
d.rectangle([0, 0, LARG, TOPO - 48], fill=NAVY)
d.text((MARGEM, 56), 'ELEVA', font=f(G_BOLD, 44), fill=BRANCO)
d.text((MARGEM, 126), 'Como subir a carta comercial do mês', font=f(A_BOLD, 54), fill=BRANCO)
d.text((MARGEM, 196), 'Quatro toques. Leva menos de um minuto.', font=f(A_REG, 32), fill=(150, 170, 195))

for i, ((arq, titulo, apoio), img, legenda) in enumerate(zip(PASSOS, prints, LEGENDAS)):
    cx = MARGEM + (i % 2) * (col + GAP)
    cy = TOPO + (i // 2) * (CABECA + APOIO + alt_tela + GAP)
    # número
    d.ellipse([cx, cy, cx + 54, cy + 54], fill=AZUL)
    n = str(i + 1)
    fn = f(A_BOLD, 32)
    lb = d.textbbox((0, 0), n, font=fn)
    d.text((cx + 27 - (lb[2] - lb[0]) / 2, cy + 27 - (lb[3] - lb[1]) / 2 - lb[1]), n, font=fn, fill=BRANCO)
    d.text((cx + 74, cy + 6), titulo, font=f(A_BOLD, 36), fill=TINTA)
    for k, linha in enumerate(legenda):
        d.text((cx, cy + CABECA + k * 38), linha, font=f_apoio, fill=SUAVE)
    lona.paste(img, (cx, cy + CABECA + APOIO))

saida = os.path.join(PASTA, 'Eleva - como subir a carta do mes.png')
lona.save(saida, optimize=True)
print(saida, lona.size)
