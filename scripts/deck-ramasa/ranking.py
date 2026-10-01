# -*- coding: utf-8 -*-
"""
O slide OCULTO que explica o ranking.

Fica no fim e vem marcado como pulado: é consulta para quando alguém da Ramasa
perguntar "mas como pontua?", não parte da apresentação.

TODO NÚMERO AQUI SAIU DO CÓDIGO, não da memória:
  POINTS_PER_PILL = 10 e POINTS_PER_QUIZ = 30 (src/pilulas/data/tracking.ts:38-39)
  WEEKLY_GOAL = 10 pílulas (:40)
  pílula conta 1x por produto por dia (recordView, :124)
  quiz conta 1x por produto, permanente (recordQuizPass, :236)
  o placar é por marca e por mês, reiniciando no dia 1º (data/placar.ts, Ranking.tsx)
  missões NÃO valem para a Ramasa: a rota /eleva/missoes é BlockAuto
    (src/pilulas/PilulasApp.tsx:393)

Uso: python3 ranking.py <arquivo.key>
"""
import subprocess, sys

ARQUIVO = sys.argv[1]

GOLD   = (48830, 43433, 22102)
BRANCO = (65535, 65535, 65535)
NEVOA  = (51400, 52171, 56283)

def esc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')

blocos = []
def txt(conteudo, x, y, larg, fonte, tam, cor):
    blocos.append(f'''
  tell s
    set t to make new text item with properties {{object text:"{esc(conteudo)}", position:{{{x}, {y}}}, width:{larg}}}
  end tell
  set properties of object text of t to {{font:"{fonte}", size:{tam}, color:{{{cor[0]}, {cor[1]}, {cor[2]}}}}}''')

txt('COMO FUNCIONA O RANKING', 60, 46, 500, 'Helvetica-Bold', 11, GOLD)
txt('O que pontua — e o que não pontua.', 60, 70, 840, 'Georgia-Bold', 32, BRANCO)
txt('O placar é por marca, conta o mês corrente e reinicia todo dia 1º.', 60, 124, 840, 'Helvetica', 14, NEVOA)

# ---- coluna da esquerda: o que soma ----
txt('PONTUA', 60, 178, 380, 'Helvetica-Bold', 11, GOLD)

txt('Pílula assistida', 60, 208, 240, 'Helvetica-Bold', 15, BRANCO)
txt('10 pontos', 300, 208, 140, 'Helvetica-Bold', 15, GOLD)
txt('Uma vez por carro, por dia. Reabrir o mesmo carro no mesmo dia não soma de novo.',
    60, 234, 380, 'Helvetica', 11.5, NEVOA)

txt('Quiz acertado', 60, 286, 240, 'Helvetica-Bold', 15, BRANCO)
txt('30 pontos', 300, 286, 140, 'Helvetica-Bold', 15, GOLD)
txt('Uma vez por carro, e vale para sempre — é o carimbo de que a pessoa domina aquele modelo.',
    60, 312, 380, 'Helvetica', 11.5, NEVOA)

txt('Missão do mês: 10 pílulas assistidas.', 60, 372, 380, 'Helvetica-Bold', 12, BRANCO)
txt('É a barra de progresso da tela de Ranking. Não dá ponto extra: mede ritmo.',
    60, 394, 380, 'Helvetica', 11.5, NEVOA)

# ---- coluna da direita: o que fica de fora, e por quê ----
txt('NÃO PONTUA — E ISSO É PROPOSITAL', 520, 178, 380, 'Helvetica-Bold', 11, GOLD)

txt('Abrir um documento, consultar uma objeção, mandar o one-page, perguntar ao Tira-dúvida, abrir a condição.',
    520, 208, 380, 'Helvetica', 12.5, BRANCO)
txt('Isso é o trabalho acontecendo. Se pontuasse, viraria alvo — e o número deixaria de medir o que a gente quer medir: quem estudou o produto.',
    520, 268, 380, 'Helvetica', 11.5, NEVOA)

txt('A OFENSIVA', 520, 352, 380, 'Helvetica-Bold', 11, GOLD)
txt('Dias seguidos abrindo o app. Conta dias, não pontos — e some se a pessoa pular um dia.',
    520, 374, 380, 'Helvetica', 11.5, NEVOA)

txt('QUEM APARECE NO PLACAR', 520, 420, 380, 'Helvetica-Bold', 11, GOLD)
txt('Todo mundo da marca, do mais pontos para o menos. Time de uma pessoa só não mostra ranking.',
    520, 442, 380, 'Helvetica', 11.5, NEVOA)

txt('O ranking mede estudo, não movimento: vale ponto o que deixa o vendedor pronto antes do cliente chegar.',
    60, 500, 850, 'Helvetica-BoldOblique', 12, GOLD)

script = f'''
set src to POSIX file "{ARQUIVO}"
tell application "Keynote"
  set d to open src
  -- duplica um slide ESCURO para herdar o fundo (o 7 é o comparativo)
  duplicate slide 7 of d
  set n to count of slides of d
  set s to slide n of d
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
{''.join(blocos)}
  -- oculto: é consulta, não apresentação
  set skipped of s to true
  save d
  set total to count of slides of d
  close d saving yes
  return "slide " & n & " criado e oculto · total " & total
end tell
'''

r = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip()[:500])
