# -*- coding: utf-8 -*-
"""
O COMERCIAL DO ELEVA — roteiro.

Horizontal (1920×1080), para tocar dentro da apresentação. Fala com o time da
Ramasa: não explica o que é o app, mostra o que ele já faz e o que eles já
construíram com ele.

Cada cena diz: que tela usar, de onde até onde ROLAR nela (em pixels de CSS da
página, que é a unidade que a captura reporta), o que fica escrito e o que a
locução diz. A duração sai da locução — não é chutada aqui.
"""

# de/ate = posição do topo da janela, em px CSS. None em `ate` = tela parada.
CENAS = [
    dict(id='abertura', tela=None,
         titulo='"É chinês, né?"',
         apoio='A pergunta que trava a venda no salão.',
         fala='No salão, a pergunta do cliente não espera.'),

    dict(id='tira-duvida', tela='tira-duvida.png', de=0, ate=28,
         titulo='Tira-dúvida',
         apoio='Pergunta por voz ou texto.',
         fala='A resposta sai na hora. Com fato, não com adjetivo.'),

    dict(id='jornada', tela='jornada.png', de=0, ate=900,
         titulo='Jornada',
         apoio='As 9 etapas do atendimento.',
         fala='A mensagem do primeiro contato já vem pronta, com o nome do cliente dentro.'),

    dict(id='condicoes', tela='condicoes.png', de=0, ate=None,
         titulo='Condições',
         apoio='A tabela vigente, publicada pela gerência.',
         fala='A tabela do mês é a que a gerência publicou. A vencida some sozinha.'),

    dict(id='documentos', tela='documentos.png', de=120, ate=1250,
         titulo='Documentos',
         apoio='O material oficial da marca.',
         fala='A ficha técnica oficial, no bolso, versão por versão.'),

    dict(id='noticias', tela='noticias.png', de=0, ate=760,
         titulo='Notícias',
         apoio='Marca, concorrência e mercado.',
         fala='E o que saiu na imprensa, antes do cliente contar.'),

    dict(id='painel', tela='painel.png', de=380, ate=1180,
         titulo='Painel',
         apoio='Quem estudou, quem parou, quanto andou.',
         fala='Em agosto, o time da Ramasa assistiu vinte e três vídeos. Em setembro, duzentos e cinquenta e seis.'),

    dict(id='fecho', tela=None,
         titulo='ELEVA',
         apoio='Ramasa · Jaecoo e Omoda',
         fala='Eleva. O que o time precisa saber, na hora em que o cliente pergunta.'),
]
