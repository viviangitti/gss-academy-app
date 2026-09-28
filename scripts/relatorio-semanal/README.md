# Relatório semanal de uso do Eleva (Ramasa)

PDF de 7 páginas sobre a semana (segunda a domingo), com comparação com a
semana anterior, placar das metas do plano de ação e ações recomendadas.

```bash
npm run relatorio-semanal                        # última semana completa
npm run relatorio-semanal -- --semana 2026-09-07  # uma semana específica (segunda-feira)
npm run relatorio-semanal -- --loja omoda        # só uma loja: omoda, toyota, mitsubishi, grupo
```

- O recorte por loja usa o DOMÍNIO DO E-MAIL (@tigeromoda.com.br etc.), o mesmo
  critério do relatório diário: o campo `loja` do perfil só existe para parte do
  time e separa UNIDADE (Goiânia, Itumbiara), não bandeira. Quem usa e-mail
  pessoal não entra em loja nenhuma, e a capa diz quantos são.
- Grava em `~/.claude/eleva-uso/relatorios/<segunda>/` e copia o PDF para `~/Downloads`.
- As páginas saem também em imagem (`paginas/`), para conferir antes de mandar.
- Dados ao vivo do Firebase (Auth + elevaStats), pelo acesso do perfil — não pelo carimbo de marca do elevaStats.
- Roda toda segunda às 7h30 pela tarefa agendada `eleva-relatorio-semanal`.
- `scripts/relatorio-uso/` é a versão antiga (06/09), que não é mais usada.
