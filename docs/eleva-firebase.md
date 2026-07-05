# Eleva — Backend Firebase (plano de produção)

O protótipo hoje guarda tudo em `localStorage` (via `src/pilulas/data/store.ts`). Este doc é
o desenho para trocar essa camada pelo **Firebase** que o projeto GSS **já usa** (dependência
`firebase`, `firestore.rules`, `api/_firebase.js`). Nada aqui foi aplicado à produção — é o
que falta executar, com o seu aval, porque cria coleções/regras no projeto real.

## 1. Autenticação (login + papéis)
- **Firebase Auth** (e-mail/senha ou link mágico). Substitui a tela `Login.tsx` do protótipo.
- Papel e marcas do usuário em `users/{uid}` (abaixo) — ou em **custom claims** para regra rápida.
- `role`: `gestor` | `vendedora` | `super` (GSS). Um usuário pode ter **várias marcas**.

## 2. Modelo de dados (Firestore)
```
brands/{brandId}
  name, mode: 'exclusiva' | 'hub'
  theme: { accent, accentDeep, light, onAccent }

brands/{brandId}/products/{productId}
  brand, name, category, tagline, hook, whatItIs, benefits[],
  howToUse, forWho, salesLine, objections[], durationSec,
  gradient[2], storyboard[], videoUrl (Storage), createdAt

brands/{brandId}/offers/{offerId}
  brand, tag, tagKind, title, desc, until, share, activeFrom, activeTo

brands/{brandId}/missions/{missionId}
  brand, kind, points, title, goal, productId, caption, hashtags

brands/{brandId}/sellers/{uid}            # ranking real + comissão
  name, city, weekPoints, weekViews, streak, weekMissions, link (rastreável)

users/{uid}
  name, role, brands: [brandId, ...]

brands/{brandId}/events/{eventId}          # alimenta as MÉTRICAS
  type: 'view' | 'mission' | 'share' | 'sale', uid, productId, ts
```

## 3. Storage (vídeos)
```
brands/{brandId}/videos/{productId}.mp4        # pílula 30s
brands/{brandId}/videos/{productId}-aula.mp4   # formação (longa)
```
Upload no Painel do Gestor → `uploadBytes()` → pega URL → grava em `product.videoUrl`.
No app, a `Reel` já toca `<video>` quando há `videoUrl` (senão, o storyboard animado).

## 4. Regras de segurança (rascunho)
```
match /users/{uid} {
  allow read, write: if request.auth.uid == uid;
}
match /brands/{brandId}/{doc=**} {
  // vendedora e gestor da marca leem o conteúdo
  allow read:  if isMember(brandId);
  // só o GESTOR da marca escreve produto/oferta/missão
  allow write: if isGestor(brandId);
}
match /brands/{brandId}/sellers/{uid} {
  allow read:  if isMember(brandId);          // ver o ranking
  allow write: if request.auth.uid == uid;    // cada uma atualiza os próprios pontos
}
// isMember/isGestor: checam users/{uid}.brands e users/{uid}.role
```

## 5. Troca no código (mínima — o store já isola isso)
`src/pilulas/data/store.ts` expõe: `allProducts`, `addProduct`, `findProduct`,
`allOffers`, `addOffer`, `useStore`. Basta reimplementar essas funções com Firestore
(`onSnapshot` para reatividade em tempo real no lugar do `useSyncExternalStore` local).
Os componentes (`Catalog`, `Product`, `Ofertas`, `Gestor`) **não mudam** — já consomem o store.

Tracking (`data/tracking.ts`) grava um doc em `.../events` a cada view/missão; as MÉTRICAS
do painel passam a ser agregação real desses eventos (hoje são números-semente).

## 6. Métricas → dados reais
`Gestor.tsx` hoje usa `METRICS` (semente). Em produção: agregação de `events` por marca/semana
(Cloud Function ou query) → vendedoras ativas, pílulas assistidas, posts, top produtos, e o
uplift real (comparar quem assiste vs. quem não assiste). É o número que o PPT promete provar.

## Ordem sugerida de execução (com aval)
1. Auth + `users/{uid}` (papéis) → troca `Login.tsx`.
2. Migrar `products/offers/missions` seed → Firestore + reescrever `store.ts`.
3. Storage de vídeo no upload do Painel.
4. `sellers` + `events` → ranking real + métricas reais.
