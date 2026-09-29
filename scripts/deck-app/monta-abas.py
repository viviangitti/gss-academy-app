# -*- coding: utf-8 -*-
"""
"O app em 7 abas" — um slide por aba, com o print real de cada uma.

Pedido da Vivian em 29/09/2026: o slide de texto do deck grande virou um deck
próprio, com a captura de cada aba.

A ORDEM É A DA BARRA, da esquerda para a direita, e a barra retratada é a do
GESTOR (src/pilulas/BottomNav.tsx): é ela que tem as 7 abas do slide original.
Na barra do vendedor duas mudam de lugar — Hoje no lugar de Painel e Carros no
lugar de Ver como time.

Uso: python3 monta-abas.py <pasta-das-imagens> <arquivo.pptx>
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image
import sys

BASE, SAIDA = sys.argv[1], sys.argv[2]
IMG = f'{BASE}/deck-img/'

NAVY  = RGBColor(0x0F,0x0F,0x1E)
NAVY2 = RGBColor(0x1B,0x23,0x38)
GOLD  = RGBColor(0xC9,0xA8,0x4C)
GOLDD = RGBColor(0xA5,0x84,0x2F)
BODY  = RGBColor(0x16,0x18,0x1D)
GREY  = RGBColor(0x9A,0xA1,0xAE)
GREY2 = RGBColor(0x6B,0x73,0x85)
CARD  = RGBColor(0xF4,0xF5,0xF8)
LINHA = RGBColor(0xDD,0xE3,0xEC)
WHITE = RGBColor(0xFF,0xFF,0xFF)
NEVOA = RGBColor(0xC8,0xCB,0xDB)

pr = Presentation()
pr.slide_width, pr.slide_height = Inches(13.333), Inches(7.5)
BR = pr.slide_layouts[6]

def slide(fundo=None):
    s = pr.slides.add_slide(BR)
    if fundo is not None:
        f = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, pr.slide_width, pr.slide_height)
        f.fill.solid(); f.fill.fore_color.rgb = fundo
        f.line.fill.background(); f.shadow.inherit = False
    return s

def txt(s, x, y, w, h, texto, *, tam=12, bold=False, cor=BODY, fonte='Arial',
        espaco=None, alinha=PP_ALIGN.LEFT, entrelinha=1.2, caps=False):
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]; p.alignment = alinha; p.line_spacing = entrelinha
    r = p.add_run(); r.text = texto.upper() if caps else texto
    r.font.size = Pt(tam); r.font.bold = bold; r.font.name = fonte; r.font.color.rgb = cor
    if espaco is not None: r.font._rPr.set('spc', str(int(espaco)))
    return tb

def caixa(s, x, y, w, h, *, fill=None, linha=None, raio=0.06):
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = raio
    if fill is None: sh.fill.background()
    else: sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if linha is None: sh.line.fill.background()
    else: sh.line.color.rgb = linha; sh.line.width = Pt(0.75)
    sh.shadow.inherit = False
    return sh

def celular(s, arquivo, x, alturaIn, y):
    im = Image.open(IMG + arquivo)
    larg = alturaIn * im.width / im.height
    s.shapes.add_picture(IMG + arquivo, Inches(x), Inches(y), height=Inches(alturaIn))
    return larg

n = 0
def rodape(s, claro=False):
    global n; n += 1
    txt(s, 10.4, 7.03, 2.3, 0.2, f'Eleva · Grupo Ramasa   {n}', tam=9,
        cor=GREY if claro else GREY2, alinha=PP_ALIGN.RIGHT)

# ---------------------------------------------------------------- capa ----
s = slide(NAVY)
faixa = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.34), pr.slide_width, Inches(0.16))
faixa.fill.solid(); faixa.fill.fore_color.rgb = GOLD
faixa.line.fill.background(); faixa.shadow.inherit = False

txt(s, 0.95, 2.18, 8.6, 0.3, 'A barra de baixo', tam=12, bold=True, cor=GOLD, espaco=340, caps=True)
txt(s, 0.95, 2.72, 8.8, 1.5, 'O app em 7 abas', tam=62, bold=True, cor=WHITE, fonte='Georgia', entrelinha=1.0)
txt(s, 0.95, 4.28, 7.7, 1.0,
    'Cada uma resolve um momento do dia. Ninguém precisa procurar onde está o quê.',
    tam=17, cor=NEVOA, entrelinha=1.42)
txt(s, 0.95, 5.42, 8.0, 0.5, 'As telas destas páginas são do app rodando, sem montagem.',
    tam=12, cor=GREY, entrelinha=1.3)
celular(s, 'painel.png', 9.74, 5.75, 0.72)
rodape(s, claro=True)

# ------------------------------------------------------------- as abas ----
# A ordem é a da barra do gestor, da esquerda para a direita.
# O quinto campo diz DE QUEM é a tela. Sem isso, o espectador vê os nomes da
# barra de baixo trocando de um slide para o outro (Painel/Ver como time na
# visão da gerência, Hoje/Carros na do vendedor) e acha que é erro do deck.
ABAS = [
    ('painel.png', 'Painel',
     'Quem estudou, quem parou e o que a ponta anda perguntando.',
     ['30 pessoas ativas no mês, 256 vídeos assistidos — e a comparação com agosto no mesmo quadro.',
      'Filtro por loja: Omoda Goiânia, Tiger Goiânia, Tiger Itumbiara ou o grupo inteiro.',
      'O time lido pelos pilares da Ramasa: Razão, Magia e Satisfação.'],
     'Só a gerência abre esta aba.', 'tela da gerência'),
    ('jornada.png', 'Jornada',
     'As 9 etapas do atendimento, com a mensagem pronta em cada uma.',
     ['Nome do cliente, carro, vendedor e loja: preenche uma vez e entra em todos os scripts.',
      'Etapa 1 começa nos primeiros 5 minutos — responder antes do concorrente.',
      'A mensagem sai pronta para copiar, com o nome do cliente já dentro.'],
     'Do primeiro contato à entrega.', 'tela do vendedor'),
    ('ver-como-time.png', 'Ver como time',
     'A gerência abre o app exatamente como o vendedor vê.',
     ['Cada carro com o vídeo de 45 segundos e a objeção real que ele levanta.',
      'Lançamento e novidade marcados, para o time saber o que mudou.',
      'Sem versão de gerente: quem publica confere o que o time recebeu.'],
     'A mesma tela, o mesmo conteúdo.', 'tela da gerência'),
    ('condicoes.png', 'Condições',
     'A tabela do mês, partida por modelo, com validade que expira sozinha.',
     ['7 folhas de veículos, 6 de acessórios e a campanha da casa, separadas.',
      'Condição vencida some da ponta sozinha — tabela velha não vira promessa.',
      'É o que a gerência publicou, não o que a conversa lembrou.'],
     'Publicou no Painel, aparece aqui na hora.', 'tela do vendedor'),
    ('noticias.png', 'Notícias',
     'O que saiu sobre a marca, a concorrência e o mercado.',
     ['Quatro frentes: Tudo, Concorrência, Mercado e Lançamentos.',
      'Busca feita no servidor, com trava de idade: notícia velha não entra.',
      'Na captura, a matéria do topo tinha uma hora de publicada.'],
     'O vendedor sabe antes do cliente contar.', 'tela do vendedor'),
    ('documentos.png', 'Documentos',
     'Fichas, guias e processos da montadora, com zoom no celular.',
     ['Ficha técnica versão por versão: ELITE, LUXURY e PRESTIGE lado a lado.',
      'Cada documento diz quantas páginas tem e de quando é.',
      'É o dado oficial — o que vale quando o cliente questiona um número.'],
     'Do jeito que a marca mandou.', 'tela do vendedor'),
    ('tira-duvida.png', 'Tira-dúvida',
     'Pergunta por voz ou texto, resposta só do conteúdo aprovado.',
     ['A objeção do balcão vira resposta em sequência, pronta para falar.',
      'Responde com o método da GSS e com a condição que está publicada.',
      'De pé, com o cliente ao lado: dá para falar em vez de digitar.'],
     'A resposta não sai da internet.', 'tela do vendedor'),
]

for i, (arq, nome, linha, pontos, selo, dono) in enumerate(ABAS, start=1):
    s = slide(WHITE)
    # Painel navy à esquerda, com o celular CENTRADO nele. Antes sobrava 1,56"
    # de um lado e 0,85" do outro, e o aparelho parecia empurrado contra a divisa.
    PAINEL = 5.25
    p = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(PAINEL), pr.slide_height)
    p.width, p.height = Inches(PAINEL), pr.slide_height
    p.fill.solid(); p.fill.fore_color.rgb = NAVY
    p.line.fill.background(); p.shadow.inherit = False

    ALTURA = 6.05
    from PIL import Image as _I
    im = _I.open(IMG + arq)
    largura = ALTURA * im.width / im.height
    celular(s, arq, (PAINEL - largura) / 2, ALTURA, 0.42)
    txt(s, 0.4, 6.63, PAINEL - 0.8, 0.3, dono, tam=10.5, bold=True, cor=GOLD,
        espaco=200, caps=True, alinha=PP_ALIGN.CENTER)

    # Coluna de texto com posições FIXAS: com y variável, uma legenda de duas
    # linhas empurrava os cartões e cada slide da série tinha uma altura.
    x = 6.15
    txt(s, x, 0.92, 6.4, 0.3, f'aba {i} de 7', tam=11, bold=True, cor=GOLDD, espaco=320, caps=True)
    txt(s, x, 1.36, 6.5, 0.9, nome, tam=42, bold=True, cor=NAVY, fonte='Georgia', entrelinha=1.02)
    txt(s, x, 2.34, 6.35, 0.95, linha, tam=15.5, cor=GREY2, entrelinha=1.4)

    y = 3.40
    for ponto in pontos:
        caixa(s, x, y, 6.35, 0.88, fill=CARD, linha=LINHA, raio=0.13)
        pt = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x + 0.3), Inches(y + 0.285), Inches(0.1), Inches(0.1))
        pt.fill.solid(); pt.fill.fore_color.rgb = GOLD
        pt.line.fill.background(); pt.shadow.inherit = False
        txt(s, x + 0.58, y + 0.17, 5.5, 0.6, ponto, tam=12.5, cor=BODY, entrelinha=1.34)
        y += 1.12

    # Na mesma linha de base do rodapé — antes ficavam 0,1" desencontrados.
    txt(s, x, 7.03, 4.0, 0.3, selo, tam=11.5, bold=True, cor=GOLDD, entrelinha=1.3)
    rodape(s)

# ------------------------------------------------------------- as sete ----
s = slide(NAVY)
txt(s, 0.68, 0.62, 11, 0.24, 'As sete, na ordem da barra', tam=11, bold=True, cor=GOLD, espaco=300, caps=True)
txt(s, 0.68, 1.02, 11.9, 0.7, 'É tudo o que o time precisa, e nada além.',
    tam=31, bold=True, cor=WHITE, fonte='Georgia', entrelinha=1.05)

# CONTA DE LARGURA, não chute: sete celulares de 1,53" com seis vãos de 0,15"
# dão 11,63" — cabem nas 13,33" do slide com 0,85" de margem dos dois lados.
# Na primeira versão eles tinham 1,87" e o sétimo ficava 74% fora do slide.
from PIL import Image as _I
_im = _I.open(IMG + ABAS[0][0])
ALT_FECHO = 3.30
LARG = ALT_FECHO * _im.width / _im.height
VAO = 0.15
xs = (13.333 - (7 * LARG + 6 * VAO)) / 2
for arq, nome, _l, _p, _s, _d in ABAS:
    celular(s, arq, xs, ALT_FECHO, 2.30)
    txt(s, xs - 0.12, 5.78, LARG + 0.24, 0.3, nome, tam=11.5, bold=True, cor=WHITE, alinha=PP_ALIGN.CENTER)
    xs += LARG + VAO

txt(s, 0.68, 6.45, 11.9, 0.3,
    'A barra retratada é a do gestor. Na do vendedor, Hoje entra no lugar de Painel e Carros no lugar de Ver como time.',
    tam=11, cor=GREY2, entrelinha=1.3)
rodape(s, claro=True)

pr.save(SAIDA)
print('deck:', SAIDA, '·', len(pr.slides.__iter__.__self__._sldIdLst), 'slides')
