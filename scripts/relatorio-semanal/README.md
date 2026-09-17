# Relatório semanal de uso do Eleva (Ramasa)

PDF de 7 páginas sobre a semana (segunda a domingo), com comparação com a
semana anterior, placar das metas do plano de ação e ações recomendadas.

```bash
npm run relatorio-semanal                        # última semana completa
npm run relatorio-semanal -- --semana 2026-09-07  # uma semana específica (segunda-feira)
```

- Grava em `~/.claude/eleva-uso/relatorios/<segunda>/` e copia o PDF para `~/Downloads`.
- As páginas saem também em imagem (`paginas/`), para conferir antes de mandar.
- Dados ao vivo do Firebase (Auth + elevaStats), pelo acesso do perfil — não pelo carimbo de marca do elevaStats.
- Roda toda segunda às 7h30 pela tarefa agendada `eleva-relatorio-semanal`.
- `scripts/relatorio-uso/` é a versão antiga (06/09), que não é mais usada.
