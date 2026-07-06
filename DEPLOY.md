# Deploy do Eleva (IMPORTANTE)

Esta pasta é o app **Eleva** e publica no **time Vercel próprio `eleva-app`**:
- Projeto: `eleva` (time `eleva-app`)
- URL: https://eleva-eleva-app.vercel.app/eleva

```bash
npx vercel --prod --yes --scope eleva-app
```

## ⚠️ NUNCA aponte esta pasta pro time/projeto do MAESTR.IA
O MAESTR.IA em Vendas é o projeto `gss` no time **corpo-leve-apps-projects**
(https://gss-weld.vercel.app) e mora em `/Users/viviangitti/maestria-empresas`.

Esta pasta já esteve linkada ao projeto `gss` por engano e **sobrescrevia o app
de vendas** a cada deploy (o app "voltava pra versão antiga"). Em 2026-07-06 foi
separado: o Eleva ganhou o time próprio `eleva-app`.

Se o `vercel` perguntar o escopo/projeto: use **eleva-app / eleva**. Jamais `gss`
nem `corpo-leve`.
(Links antigos guardados em `.vercel.DESLIGADO-projeto-errado`.)
