# "O app por dentro" — o deck visual do Eleva

Deck de 13 slides que mostra o app tela por tela, com as capturas REAIS e os
números medidos. Pedido da Vivian em 29/09/2026.

```bash
# 1. o servidor de desenvolvimento precisa estar no ar
npm run dev                       # ou preview_start com o nome "eleva"

# 2. capturar as telas (vendedor e gestor)
node scripts/deck-app/captura.mjs      # grava em telas/

# 3. moldura de celular, recortes ampliados e QR
python3 scripts/deck-app/prepara.py    # grava em deck-img/

# 4. montar
python3 scripts/deck-app/monta.py "O app por dentro — Eleva.pptx"
```

## Por que localhost, e não gsseleva.com.br

Para fotografar as telas é preciso **estar logado** — como vendedor num momento
e como gestora no outro. Em produção isso exigiria a senha de alguém, e senha de
pessoa não se usa. O atalho `wp_dev_user` só existe no build de desenvolvimento
(`import.meta.env.DEV`), então só funciona em localhost.

**O código é o mesmo que está no ar.** O que muda é só quem está logado. Os
dados também são reais: `wp_demo_time`, `wp_demo_argumentos` e `wp_demo_objecoes`
são alimentados pelo `scripts/tutorial/gera-time.mjs` e
`scripts/tutorial/gera-argumentos.mjs`, que leem o Firestore de verdade.

## O que não pode faltar

- **Os números do slide 12 são medidos**, não estimados. Refazer antes de
  apresentar: eles mudam toda semana.
- **As telas envelhecem.** Se o app mudou, recapture — um print velho num deck
  de venda é pior do que não ter print.
- O QR aponta para `gsseleva.com.br`.
