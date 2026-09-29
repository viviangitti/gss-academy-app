# -*- coding: utf-8 -*-
"""O app por dentro — deck visual do Eleva, com as telas reais."""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import sys

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

IMG = 'deck-img/'
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

def celular(s, arquivo, x, alturaIn, y=None):
    """Cola a tela já com moldura, pela ALTURA — todas ficam do mesmo tamanho."""
    from PIL import Image
    im = Image.open(IMG + arquivo)
    w = alturaIn * im.width / im.height
    if y is None: y = (7.5 - alturaIn) / 2
    s.shapes.add_picture(IMG + arquivo, Inches(x), Inches(y), height=Inches(alturaIn))
    return w

def titulo(s, texto, sub=None, eyebrow=None, cor=NAVY, corSub=GREY2):
    y = 0.52
    if eyebrow:
        txt(s, 0.68, y, 11, 0.24, eyebrow, tam=11, bold=True, cor=GOLDD, espaco=300, caps=True); y += 0.38
    txt(s, 0.68, y, 11.9, 0.6, texto, tam=31, bold=True, cor=cor, fonte='Georgia', entrelinha=1.05)
    if sub: txt(s, 0.68, y + 0.72, 11.6, 0.35, sub, tam=14, cor=corSub, entrelinha=1.3)
    return y + (1.25 if sub else 0.95)

def rodape(s, n, claro=False):
    txt(s, 10.6, 7.05, 2.1, 0.2, f'Eleva · Grupo Ramasa   {n}', tam=9,
        cor=GREY if not claro else RGBColor(0x6B,0x72,0x85), alinha=PP_ALIGN.RIGHT)

n = 0
def pag():
    global n; n += 1; return n

# ── 1 · capa ────────────────────────────────────────────────────────────────
s = slide(NAVY); pag()
txt(s, 0.9, 1.45, 7.2, 0.3, 'Eleva · Grupo Ramasa', tam=12, bold=True, cor=GOLD, espaco=300, caps=True)
txt(s, 0.9, 1.95, 7.4, 1.6, 'O app por dentro', tam=54, bold=True, cor=WHITE, fonte='Georgia', entrelinha=1.0)
txt(s, 0.9, 3.5, 6.6, 1.1,
    'O que a sua equipe abre todo dia, tela por tela — e o que cada uma resolve na hora do atendimento.',
    tam=16, cor=NEVOA, entrelinha=1.4)
txt(s, 0.9, 6.3, 6.0, 0.3, 'Setembro de 2026 · uso interno', tam=11, bold=True, cor=RGBColor(0x8E,0x96,0xB4), espaco=200, caps=True)
for i, (arq, x, alt) in enumerate([('catalogo.png', 7.75, 4.3), ('hoje.png', 9.35, 5.1), ('assistente.png', 10.95, 4.3)]):
    celular(s, arq, x, alt, y=(7.5 - alt) / 2)

# ── 2 · o que é ─────────────────────────────────────────────────────────────
s = slide(); pag()
titulo(s, 'O conteúdo da marca no bolso\nde quem atende', eyebrow='O que é o Eleva')
txt(s, 0.68, 2.5, 6.4, 1.5,
    'O carro em vídeo curto, a objeção com a resposta pronta, a condição do mês e o material para mandar ao cliente. Tudo no mesmo lugar, com a cara da Ramasa, e funcionando offline no meio do salão.',
    tam=14, cor=BODY, entrelinha=1.5)
DADOS = [('5', 'carros, com ficha,\nversões e objeções'), ('27', 'acessórios, com preço\ne código de peça'),
         ('23', 'documentos da\nmontadora na prateleira')]
for i, (num, rot) in enumerate(DADOS):
    x = 0.68 + i * 2.25
    caixa(s, x, 4.5, 2.05, 1.5, fill=CARD, raio=0.09)
    txt(s, x + 0.25, 4.72, 1.6, 0.5, num, tam=30, bold=True, cor=GOLDD, fonte='Georgia')
    txt(s, x + 0.25, 5.28, 1.6, 0.6, rot, tam=10, cor=GREY2, entrelinha=1.25)
txt(s, 0.68, 6.35, 6.6, 0.3, 'Instala sem loja de aplicativo. Abre no celular que a pessoa já tem.', tam=11, cor=GREY2)
celular(s, 'hoje.png', 8.6, 6.3, y=0.6)
rodape(s, n)

# ── 3 · as 7 abas ───────────────────────────────────────────────────────────
s = slide(); pag()
titulo(s, 'O app em 7 abas', 'Cada uma resolve um momento do dia. Ninguém precisa procurar onde está o quê.',
       eyebrow='A barra de baixo')
ABAS = [('Painel', 'Quem estudou, quem parou e o que a ponta anda perguntando.'),
        ('Jornada', 'As 9 etapas do atendimento, com a mensagem pronta em cada uma.'),
        ('Ver como time', 'A gerência abre o app exatamente como o vendedor vê.'),
        ('Condições', 'A tabela do mês, partida por modelo, com validade que expira sozinha.'),
        ('Notícias', 'O que saiu sobre a marca, a concorrência e o mercado.'),
        ('Documentos', 'Fichas, guias e processos da montadora, com zoom no celular.'),
        ('Tira-dúvida', 'Pergunta por voz ou texto, resposta só do conteúdo aprovado.')]
for i, (nome, frase) in enumerate(ABAS):
    col = i // 4; lin = i % 4
    x = 0.68 + col * 3.35; y = 2.35 + lin * 1.12
    caixa(s, x, y, 3.1, 0.95, fill=CARD, raio=0.10)
    txt(s, x + 0.22, y + 0.14, 2.7, 0.24, nome, tam=13, bold=True, cor=NAVY)
    txt(s, x + 0.22, y + 0.42, 2.7, 0.45, frase, tam=10, cor=GREY2, entrelinha=1.25)
celular(s, 'painel.png', 9.3, 5.4, y=1.85)
rodape(s, n)



# ── 4 · um dia de venda ─────────────────────────────────────────────────────
s = slide(NAVY); pag()
txt(s, 0.68, 1.6, 8, 0.28, 'Um dia de venda', tam=12, bold=True, cor=GOLD, espaco=300, caps=True)
txt(s, 0.68, 2.05, 9.4, 1.5, 'Seis momentos, entre as 9h e as 11h30', tam=40, bold=True, cor=WHITE, fonte='Georgia', entrelinha=1.05)
txt(s, 0.68, 3.35, 8.2, 0.7, 'Nenhum deles é novo — todos já acontecem hoje. O que muda é o que a pessoa tem na mão em cada um.',
    tam=15, cor=NEVOA, entrelinha=1.4)
MOMENTOS = [('9h02', 'O lead chega'), ('9h40', 'Antes de ele chegar'), ('10h15', '“É seguro?”'),
            ('10h30', 'A pergunta que ninguém treinou'), ('11h10', 'O fechamento'), ('11h30', '“Vou pensar.”')]
for i, (hora, nome) in enumerate(MOMENTOS):
    x = 0.68 + i * 2.02
    lin = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(4.85), Inches(1.75), Pt(2))
    lin.fill.solid(); lin.fill.fore_color.rgb = GOLD; lin.line.fill.background(); lin.shadow.inherit = False
    txt(s, x, 5.05, 1.8, 0.35, hora, tam=19, bold=True, cor=GOLD, fonte='Georgia')
    txt(s, x, 5.5, 1.8, 0.7, nome, tam=11, cor=NEVOA, entrelinha=1.3)

# ── 5 a 10 · os seis momentos ───────────────────────────────────────────────
def momento(hora, tit, tela, sem, com, *, zoom=None, alt=6.1):
    s = slide(); pag()
    celular(s, tela, 0.75, alt, y=(7.5 - alt) / 2)
    X = 4.35
    txt(s, X, 0.85, 2.0, 0.5, hora, tam=34, bold=True, cor=GOLD, fonte='Georgia')
    txt(s, X, 1.5, 8.3, 0.7, tit, tam=27, bold=True, cor=NAVY, fonte='Georgia', entrelinha=1.08)
    y = 2.6
    caixa(s, X, y, 8.2, 1.25, fill=CARD, raio=0.08)
    txt(s, X + 0.28, y + 0.18, 1.6, 0.22, 'Sem o Eleva', tam=10, bold=True, cor=GREY2, espaco=240, caps=True)
    txt(s, X + 0.28, y + 0.48, 7.6, 0.7, sem, tam=12, cor=GREY2, entrelinha=1.35)
    y += 1.5
    caixa(s, X, y, 8.2, 1.35, fill=NAVY, raio=0.08)
    txt(s, X + 0.28, y + 0.2, 1.6, 0.22, 'Com o Eleva', tam=10, bold=True, cor=GOLD, espaco=240, caps=True)
    txt(s, X + 0.28, y + 0.5, 7.6, 0.8, com, tam=12.5, cor=WHITE, entrelinha=1.35)
    if zoom:
        # o recorte entra ABAIXO das duas caixas (que terminam em 5,45") e acima
        # do rodapé — antes ele subia por cima do bloco "com o Eleva"
        txt(s, X, 5.52, 6, 0.22, 'O detalhe', tam=10, bold=True, cor=GOLDD, espaco=240, caps=True)
        s.shapes.add_picture(IMG + zoom, Inches(X), Inches(5.8), width=Inches(3.2))
    rodape(s, n)

momento('9h02', 'O lead chega pelo site', 'jornada.png',
        'Cada um escreve a própria mensagem. Uma sai boa, a outra sai com erro de português, e o cliente espera.',
        'A Jornada tem as 9 etapas do atendimento. Nome do cliente e carro preenchidos UMA vez, e a mensagem pronta entra em todos os scripts.',
        zoom='zoom-campos.png')

momento('9h40', 'Antes do cliente chegar', 'trilha.png',
        'O treinamento foi há três meses, a apostila está na gaveta e o carro novo entrou depois dela.',
        'Uma pílula de 15 a 30 segundos com locução, e o quiz libera o próximo nível. Quem não domina o básico não avança.')

momento('10h15', '“É seguro? Nunca vi esse carro batido.”', 'objecoes.png',
        '“Acho que é bom.” O vendedor improvisa, e o cliente sente. A dúvida some do salão e reaparece na concorrência.',
        'A quebra de objeção traz a resposta aprovada e o laudo na mão — cinco estrelas no Euro NCAP, com o teste em vídeo e foto.')

momento('10h30', 'A pergunta que ninguém treinou', 'assistente.png',
        'Ele pede um minuto, sai do cliente, procura no grupo do WhatsApp e volta com a resposta de outra pessoa.',
        'Pergunta por voz, ali mesmo. O Tira-dúvida responde só com o conteúdo aprovado — e diz de qual condição o número saiu.')

momento('11h10', 'O fechamento', 'acessorios.png',
        'O acessório fica para depois. E depois o cliente já foi embora com o carro sem tapete, sem estribo e sem rack.',
        '“Leve com ele”: a lista do carro escolhido, com preço e código de peça. O vendedor oferece sem sair do fechamento.',
        zoom='zoom-acessorio.png')

momento('11h30', '“Vou pensar.”', 'material.png',
        'Ele vai embora com um folheto amassado, ou com nada. Em casa, quem conta a história do carro é o concorrente.',
        'O resumo do carro sai pelo WhatsApp ou em PDF, com foto, ficha e o contato do vendedor. A Ramasa vai junto para dentro da casa dele.')

# ── 11 · o gestor ───────────────────────────────────────────────────────────
s = slide(); pag()
titulo(s, 'O que a gerência abre na segunda,\nàs 8h', eyebrow='Do outro lado do app')
BLOCOS = [('Quem estudou e quem parou', 'Por pessoa, por cargo e por loja. Quem está há sete dias sem abrir aparece com nome.'),
          ('O que a ponta anda perguntando', 'As objeções mais consultadas no mês — o que o mercado está dizendo, antes de virar objeção perdida.'),
          ('Os pilares da cultura', 'Quantas pessoas praticaram RA·zão, MA·gia e SA·tisfação no mês, pelo que fizeram no app.'),
          ('As notícias do setor', 'Concorrência, mercado, lançamentos e elétricos, em seis frentes que se atualizam sozinhas.')]
for i, (t, d) in enumerate(BLOCOS):
    y = 2.45 + i * 1.12
    caixa(s, 0.68, y, 6.4, 0.98, fill=CARD, raio=0.09)
    txt(s, 0.92, y + 0.15, 5.9, 0.24, t, tam=13, bold=True, cor=NAVY)
    txt(s, 0.92, y + 0.44, 5.9, 0.45, d, tam=10.5, cor=GREY2, entrelinha=1.3)
celular(s, 'painel-time.png', 8.2, 6.2, y=0.65)
rodape(s, n)

# ── 12 · os números ─────────────────────────────────────────────────────────
s = slide(NAVY); pag()
txt(s, 0.68, 0.9, 8, 0.28, 'O que já passou por dentro do app', tam=12, bold=True, cor=GOLD, espaco=300, caps=True)
txt(s, 0.68, 1.32, 10, 0.8, 'Um mês de uso, medido no próprio app', tam=34, bold=True, cor=WHITE, fonte='Georgia')
NUM = [('788', 'ações registradas'), ('29', 'pessoas usaram'), ('291', 'vídeos de carro assistidos'),
       ('125', 'objeções consultadas'), ('70', 'resumos enviados a clientes'), ('39', 'quizzes aprovados'),
       ('64', 'argumentos escritos pelo time'), ('33', 'consultas a acessório')]
for i, (v, r) in enumerate(NUM):
    col = i % 4; lin = i // 4
    x = 0.68 + col * 3.05; y = 2.6 + lin * 1.75
    caixa(s, x, y, 2.8, 1.5, fill=NAVY2, raio=0.08)
    txt(s, x + 0.28, y + 0.24, 2.3, 0.55, v, tam=34, bold=True, cor=GOLD, fonte='Georgia')
    txt(s, x + 0.28, y + 0.88, 2.3, 0.5, r, tam=11, cor=NEVOA, entrelinha=1.25)
txt(s, 0.68, 6.5, 11, 0.3, 'De 28/08 a 29/09, nas três lojas com time no app. Contas de teste fora da conta.',
    tam=11, cor=RGBColor(0x8E,0x96,0xB4))

# ── 13 · demo e QR ──────────────────────────────────────────────────────────
s = slide(); pag()
titulo(s, 'Dois minutos valem mais\nque este deck', 'Peça a pergunta mais difícil que um cliente já fez na sua loja. A gente responde pelo Tira-dúvida, aqui, agora.',
       eyebrow='Antes de terminar')
PASSOS = [('1', 'Escolha a pergunta', 'A que o time mais erra, ou a que você nunca viu ninguém responder bem.'),
          ('2', 'Pergunte por voz', 'No celular, na frente de todo mundo, como o vendedor faria no salão.'),
          ('3', 'Confira a fonte', 'A resposta diz de qual condição ou ficha saiu cada número. Sem invenção.')]
for i, (num, t, d) in enumerate(PASSOS):
    x = 0.68 + i * 3.1
    caixa(s, x, 3.15, 2.85, 1.7, fill=CARD, raio=0.09)
    txt(s, x + 0.25, 3.35, 0.5, 0.4, num, tam=24, bold=True, cor=GOLDD, fonte='Georgia')
    txt(s, x + 0.25, 3.82, 2.4, 0.24, t, tam=13, bold=True, cor=NAVY)
    txt(s, x + 0.25, 4.12, 2.4, 0.6, d, tam=10.5, cor=GREY2, entrelinha=1.3)
caixa(s, 0.68, 5.3, 9.1, 1.5, fill=NAVY, raio=0.08)
txt(s, 1.0, 5.55, 6.6, 0.3, 'Abra você mesmo, no modo “Ver como time”', tam=14, bold=True, cor=WHITE)
txt(s, 1.0, 5.95, 6.6, 0.6, 'gsseleva.com.br — entra pelo navegador, instala sem loja de aplicativo.', tam=11.5, cor=NEVOA, entrelinha=1.3)
s.shapes.add_picture(IMG + 'qr.png', Inches(10.15), Inches(4.55), height=Inches(2.25))
txt(s, 10.15, 6.9, 2.3, 0.22, 'gsseleva.com.br', tam=9.5, cor=GREY2, alinha=PP_ALIGN.CENTER)
rodape(s, n)

pr.save(sys.argv[1] if len(sys.argv) > 1 else 'app-por-dentro.pptx')
print('deck pronto:', n, 'slides')
