# -*- coding: utf-8 -*-
"""
O slide "MAESTR.IA × Eleva" — montado NATIVO dentro do .key.

Nativo, e não imagem colada, porque todo o resto do deck é nativo: um slide de
imagem a Vivian não consegue corrigir na frente do cliente.

POR QUE GERAR O APPLESCRIPT EM VEZ DE ESCREVÊ-LO. Dentro de um bloco
`tell application "Keynote"` o AppleScript procura CADA identificador no
dicionário do app antes de procurar nas variáveis locais — então uma função
auxiliar com um parâmetro chamado `cor` estoura com "Can't set color to cor.
Access not allowed". Gerando o script com os valores já literais, o problema
não existe.

O conteúdo sai do material dos dois produtos, não de memória:
  MAESTR.IA — "O copiloto da sua equipe comercial", alimentado pelo Método GSS
  e pelo segmento (maestria-empresas/apresentacao/gen-onepager.cjs e
  public/apresentacao-concessionaria.html).
  ELEVA — "O conhecimento da marca, transformado em conversa de venda",
  alimentado pelo catálogo da marca (slide 5 deste mesmo deck).

Uso: python3 maestria-vs-eleva.py <arquivo.key> [depois_do_slide]
"""
import subprocess, sys

ARQUIVO = sys.argv[1]
DEPOIS = int(sys.argv[2]) if len(sys.argv) > 2 else 6
POS = DEPOIS + 1

# As cores saem do próprio deck, medidas no slide exportado.
GOLD   = (48830, 43433, 22102)   # #BEA956
BRANCO = (65535, 65535, 65535)
NEVOA  = (51400, 52171, 56283)   # #C8CBDB

LINHAS = [
    ('ALIMENTADO POR',
     'O Método GSS e o segmento da empresa.',
     'O catálogo e a carta da sua marca.'),
    ('O QUE ENTREGA',
     'Cinco abas: Painel, Negociações, Maestria, Raio X e Coaching.',
     'Sete abas: Painel, Jornada, Ver como time, Condições, Notícias, Documentos e Tira-dúvida.'),
    ('NO DIA A DIA',
     'Boost na objeção, mensagem de prospecção e de resgate, treino falado e em vídeo.',
     'A resposta na hora, a condição vigente e o one-page pronto pro cliente.'),
    ('O GESTOR VÊ',
     'Raio X do Time: por que cada vendedor ganha e por que perde.',
     'Quem estudou, quem parou e o que a ponta anda perguntando.'),
    ('SE TROCAR DE MARCA',
     'Vai junto — o método serve a qualquer catálogo.',
     'Fica com a marca — ele é o catálogo.'),
]

def esc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')

partes = []
def txt(conteudo, x, y, larg, fonte, tam, cor):
    partes.append(f'''
  tell s
    set t to make new text item with properties {{object text:"{esc(conteudo)}", position:{{{x}, {y}}}, width:{larg}}}
  end tell
  set properties of object text of t to {{font:"{fonte}", size:{tam}, color:{{{cor[0]}, {cor[1]}, {cor[2]}}}}}''')

txt('DOIS PRODUTOS, DOIS PROBLEMAS', 43, 48, 500, 'Helvetica-Bold', 11, GOLD)
txt('MAESTR.IA e Eleva não competem.', 43, 72, 820, 'Georgia-Bold', 34, BRANCO)
txt('Um treina quem vende. O outro entrega o que vender.', 43, 126, 820, 'Helvetica', 15, NEVOA)

txt('MAESTR.IA', 230, 174, 330, 'Helvetica-Bold', 15, GOLD)
txt('O copiloto da equipe comercial.', 230, 196, 330, 'Helvetica', 11, NEVOA)
txt('ELEVA', 600, 174, 330, 'Helvetica-Bold', 15, GOLD)
txt('O conhecimento da marca na mão de quem atende.', 600, 196, 330, 'Helvetica', 11, NEVOA)

y = 228
for rotulo, m, e in LINHAS:
    txt(rotulo, 43, y + 2, 175, 'Helvetica-Bold', 9, GOLD)
    txt(m, 230, y, 330, 'Helvetica', 11.5, BRANCO)
    txt(e, 600, y, 330, 'Helvetica', 11.5, BRANCO)
    y += 56

txt('Um prepara o vendedor. O outro põe a marca na mão dele. É por isso que um não substitui o outro.',
    43, 500, 880, 'Helvetica-BoldOblique', 12, GOLD)

script = f'''
set src to POSIX file "{ARQUIVO}"
tell application "Keynote"
  set d to open src
  -- O FUNDO ESCURO É DO SLIDE, NÃO É UM OBJETO.
  --
  -- Era o slide 5 que servia de molde, mas ele virou CLARO em 30/09. Agora o
  -- molde é o 7 (este mesmo comparativo) — se um dia ele também clarear,
  -- troque aqui por outro slide escuro.
  --
  -- O deck tem um layout só ("DEFAULT", branco): os slides escuros têm a cor
  -- no fundo do próprio slide, e o AppleScript não deixa definir nem o fundo
  -- do slide nem o preenchimento de uma forma. Então o caminho é duplicar um
  -- slide escuro que já existe, esvaziar e escrever por cima — assim o fundo
  -- vem exatamente igual ao dos outros.
  duplicate slide 7 of d
  move slide (count of slides of d) of d to after slide {DEPOIS} of d
  set s to slide {POS} of d
  -- A ORDEM IMPORTA: formas e imagens primeiro. Apagar os textos antes disso
  -- derruba o AppleEvent. E dois textos NUNCA apagam — são os marcadores de
  -- título e corpo do layout; esses a gente esconde em vez de apagar.
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
{''.join(partes)}
  save d
  set n to count of text items of s
  close d saving yes
  return "slide {POS} criado · " & n & " textos"
end tell
'''

r = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip()[:500])
