# -*- coding: utf-8 -*-
"""
Põe o slide "O que é o Eleva" em FUNDO BRANCO.

O Keynote não deixa o AppleScript mudar o fundo de um slide nem o
preenchimento de uma forma, e formas não se copiam entre slides. Então:

  1. duplica o slide e esvazia;
  2. entra a MOBÍLIA como imagem (fundo claro, os dois cartões, os nove
     círculos dourados com os ícones originais e a faixa escura) — ver
     slide5-claro.py;
  3. o TEXTO volta nativo por cima, recolorido para fundo claro, para a
     Vivian continuar editando frase por frase.

A ordem importa: a imagem tem de entrar ANTES dos textos, porque o que é
criado depois fica por cima e não há como mandar para trás por script.

Uso: python3 slide5-monta.py <arquivo.key> <mobilia.png>
"""
import subprocess, sys

ARQUIVO, MOBILIA = sys.argv[1], sys.argv[2]

NAVY   = (4112, 3855, 7453)       # #100F1D — o título e o corpo no claro
CORPO  = (5654, 6168, 7453)       # #16181D
GOLD_E = (42405, 33924, 12079)    # #A5842F — dourado que sobrevive no branco
BRANCO = (65535, 65535, 65535)
NEVOA  = (51400, 52171, 56283)

TITULO = 'O conhecimento da marca, transformado em conversa de venda.'
DESTAQUE = 'conversa de venda.'
ini = TITULO.index(DESTAQUE) + 1          # AppleScript conta a partir de 1
fim = ini + len(DESTAQUE) - 1

# (texto, x, y, largura, fonte, tamanho, cor) — posições lidas do slide original
TEXTOS = [
    ('O QUE É O ELEVA', 50, 48, 576, 'Arial-BoldMT', 12, GOLD_E),
    (TITULO, 50, 93, 857, 'Georgia-Bold', 32, NAVY),
    ('PARA QUEM VENDE', 76, 212, 360, 'Arial-BoldMT', 11, GOLD_E),
    ('Pílulas do produto em níveis, com quiz', 119, 249, 331, 'Arial-BoldMT', 14, CORPO),
    ('Jornada da venda com mensagens prontas', 119, 290, 331, 'Arial-BoldMT', 14, CORPO),
    ('Quebra de objeções testada', 119, 332, 331, 'Arial-BoldMT', 14, CORPO),
    ('Condições vigentes e documentos oficiais', 119, 374, 331, 'Arial-BoldMT', 14, CORPO),
    ('Tira-dúvida com IA, na hora (Coach de Vendas)', 119, 416, 331, 'Arial-BoldMT', 14, CORPO),
    ('PARA QUEM LIDERA', 520, 212, 360, 'Arial-BoldMT', 11, GOLD_E),
    ('Publica carros, acessórios e tabela na hora', 563, 249, 331, 'Arial-BoldMT', 14, CORPO),
    ('Painel de uso por pessoa e loja', 563, 290, 331, 'Arial-BoldMT', 14, CORPO),
    ('Cultura da empresa dentro do app', 563, 332, 331, 'Arial-BoldMT', 14, CORPO),
    ('Tira-dúvida com IA, na hora (Coach de Gestão)', 563, 374, 331, 'Arial-BoldMT', 14, CORPO),
    # dentro da faixa escura: segue branco
    ('Tudo com a cara da sua marca.\nPronto em três semanas, sem integração com sistemas.',
     538, 421, 331, 'Arial-BoldMT', 14, BRANCO),
    ('Não é um curso a mais: é a resposta certa, na mão de quem vende, na hora em que o cliente pergunta.',
     50, 475, 857, 'Arial-BoldItalicMT', 15, GOLD_E),
]

def esc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '" & return & "')

blocos = []
for i, (conteudo, x, y, larg, fonte, tam, cor) in enumerate(TEXTOS):
    blocos.append(f'''
  tell s
    set t to make new text item with properties {{object text:"{esc(conteudo)}", position:{{{x}, {y}}}, width:{larg}}}
  end tell
  set properties of object text of t to {{font:"{fonte}", size:{tam}, color:{{{cor[0]}, {cor[1]}, {cor[2]}}}}}''')
    if conteudo == TITULO:
        # "conversa de venda." continua dourado, como no slide escuro
        blocos.append(f'''
  set color of characters {ini} thru {fim} of object text of t to {{{GOLD_E[0]}, {GOLD_E[1]}, {GOLD_E[2]}}}''')
    if conteudo.startswith('Tudo com a cara'):
        # a segunda linha é menor e mais apagada, como no original
        blocos.append(f'''
  try
    set properties of paragraph 2 of object text of t to {{size:11, color:{{{NEVOA[0]}, {NEVOA[1]}, {NEVOA[2]}}}}}
  end try''')

script = f'''
set src to POSIX file "{ARQUIVO}"
tell application "Keynote"
  set d to open src
  duplicate slide 5 of d
  move slide (count of slides of d) of d to after slide 5 of d
  set s to slide 6 of d
  -- esvazia: formas e imagens antes dos textos, senão o AppleEvent falha
  repeat with i from (count of shapes of s) to 1 by -1
    try
      delete shape i of s
    end try
  end repeat
  repeat with i from (count of images of s) to 1 by -1
    try
      delete image i of s
    end try
  end repeat
  repeat with i from (count of text items of s) to 1 by -1
    try
      delete text item i of s
    end try
  end repeat
  try
    set body showing of s to false
    set title showing of s to false
  end try
  -- a mobília entra primeiro, para ficar POR BAIXO de tudo o que vem depois
  tell s
    make new image with properties {{file:POSIX file "{MOBILIA}", position:{{0, 0}}, width:960, height:540}}
  end tell
{''.join(blocos)}
  -- o slide escuro sai; o claro passa a ser o 5
  delete slide 5 of d
  save d
  set n to count of text items of slide 5 of d
  close d saving yes
  return "slide 5 agora é o claro · " & n & " textos"
end tell
'''

r = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip()[:600])
