#!/usr/bin/env bash
# check-secrets.sh — impede que uma chave de API volte para o bundle público.
#
# Por que existe: em jul/2026 uma chave do Gemini embutida no bundle (via
# VITE_GEMINI_API_KEY) foi encontrada por um robô, que disparou ~13.500
# chamadas/dia e levou à suspensão do projeto no Google. Este script detecta a
# recaída em segundos.
#
# Uso:
#   bash scripts/check-secrets.sh          # verifica o dist/ atual
#   bash scripts/check-secrets.sh --build  # builda antes de verificar
#
# Saída: 0 = limpo | 1 = chave exposta (NÃO faça deploy)

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

RED=$'\033[0;31m'; GRN=$'\033[0;32m'; YLW=$'\033[0;33m'; NC=$'\033[0m'
fail=0

if [ "${1:-}" = "--build" ]; then
  echo "→ Buildando..."
  npm run build >/dev/null 2>&1 || { echo "${RED}✗ build falhou${NC}"; exit 1; }
fi

[ -d dist ] || { echo "${YLW}⚠ pasta dist/ não existe — rode com --build${NC}"; exit 1; }

echo "→ Verificando o bundle publicado (dist/)…"

# 1) Chave do Gemini/Google embutida. A chave WEB do Firebase é pública por
#    design, então ela é comparada à parte (abaixo) e não conta como falha.
#    A chave do Firebase pode vir do .env OU estar hardcoded no firebaseConfig
#    (os dois casos existem nos projetos), então coletamos das duas fontes.
FIREBASE_KEYS="$(
  { grep -hoE 'VITE_FIREBASE_API_KEY=[^[:space:]]+' .env 2>/dev/null | cut -d= -f2 | tr -d '"'"'"'';
    LC_ALL=C grep -rhoE 'apiKey: *"AIza[0-9A-Za-z_-]{35}"' src/ 2>/dev/null | grep -oE 'AIza[0-9A-Za-z_-]{35}';
  } | sort -u
)"

found_keys="$(LC_ALL=C grep -rhoE 'AIza[0-9A-Za-z_-]{35}|AQ\.[0-9A-Za-z_-]{20,}' dist 2>/dev/null | sort -u)"

while IFS= read -r k; do
  [ -z "$k" ] && continue
  if [ -n "$FIREBASE_KEYS" ] && printf '%s\n' "$FIREBASE_KEYS" | grep -qxF "$k"; then
    echo "  ${GRN}ok${NC}  chave Web do Firebase (pública por design)"
  else
    echo "  ${RED}FALHA${NC}  chave exposta no bundle: ${k:0:10}****"
    fail=1
  fi
done <<< "$found_keys"

# 2) Qualquer segredo do .env que tenha vazado para o bundle (rede de segurança:
#    pega chaves de outros serviços, não só Google).
if [ -f .env ]; then
  while IFS='=' read -r name value; do
    case "$name" in ''|\#*) continue ;; esac
    value="$(printf '%s' "$value" | tr -d '"'"'"' ' | tr -d '\r')"
    [ ${#value} -lt 20 ] && continue                    # curto demais p/ ser segredo
    printf '%s\n' "$FIREBASE_KEYS" | grep -qxF "$value" && continue
    case "$name" in *FIREBASE*|*PUBLIC*|*SENDER_ID*|*APP_ID*) continue ;; esac
    if LC_ALL=C grep -rqF "$value" dist 2>/dev/null; then
      echo "  ${RED}FALHA${NC}  $name está no bundle público"
      fail=1
    fi
  done < .env
fi

# 3) Uso de chave de IA no código do cliente (a causa raiz do vazamento).
#    Ignora comentários (// ou *), que só citam o nome da variável.
client_ai="$(LC_ALL=C grep -rn 'VITE_GEMINI_API_KEY\|VITE_OPENAI\|VITE_ANTHROPIC' src/ 2>/dev/null \
  | grep -v 'aiProxy' \
  | grep -vE ':[[:space:]]*(//|\*|/\*)' \
  | cut -d: -f1 | sort -u || true)"
if [ -n "$client_ai" ]; then
  echo "  ${RED}FALHA${NC}  chave de IA usada no cliente:"
  printf '           %s\n' $client_ai
  fail=1
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "${GRN}✓ Nenhum segredo exposto — pode publicar.${NC}"
else
  echo "${RED}✗ Segredo exposto no bundle — NÃO publique.${NC}"
  echo "  Mova a chamada para um endpoint no servidor (ex.: api/ai-proxy.js)."
fi
exit "$fail"
