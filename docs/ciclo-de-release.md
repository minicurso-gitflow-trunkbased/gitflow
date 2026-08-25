# Ciclo de release (roteiro de aula)

Roteiro para conduzir uma versão do início ao fim. Dá para fazer tudo pela interface do
GitHub ou pela linha de comando — as duas formas estão descritas.

## 1. Congelar a `develop`

**Pelo GitHub:** Actions → **Abrir release** → Run workflow → versão `1.1.0`.

O workflow cria `release/1.1.0` a partir da `develop`, grava `VERSION`, transforma a
seção *Não lançado* do `CHANGELOG.md` em `## [1.1.0] - AAAA-MM-DD` e abre um PR em
rascunho para a `main`.

**Pela linha de comando:**

```bash
git switch develop && git pull
git switch -c release/1.1.0
node scripts/preparar-release.mjs 1.1.0
git commit -am "chore(release): prepara a versão 1.1.0"
git push -u origin release/1.1.0
```

A partir daqui, **nenhuma feature nova entra nesta versão**. Quem terminar uma feature
agora integra na `develop` e ela sai na 1.2.0. Esse é o momento em que a turma sente o
que "congelar escopo" significa.

## 2. Estabilizar

Correções vão direto na branch `release/1.1.0` (commit ou PR, como a turma preferir).
Cada correção precisa voltar para a `develop` — o back-merge automático do passo 4
cuida disso de uma vez só, no fim.

Para revisar o site desta versão antes de publicar:

```bash
git switch release/1.1.0
node scripts/gerar-manifesto.mjs
python3 -m http.server 8000
```

## 3. Publicar

Tire o PR do rascunho e faça o merge na `main`.

> **Atenção:** PRs criados pelo `GITHUB_TOKEN` não disparam workflows automaticamente.
> Se a CI não tiver rodado no PR de release, empurre um commit qualquer na branch (ou
> feche e reabra o PR) para forçar a validação antes do merge.

O merge dispara dois workflows:

- **Deploy** — publica o site. Em ~1 minuto a nova versão está no ar.
- **Release** — cria a tag `v1.1.0`, o GitHub Release com as notas do `CHANGELOG` e o
  PR de back-merge.

## 4. Fechar o ciclo

Integre o PR **Back-merge da v1.1.0 para a develop**. Enquanto ele estiver aberto, a
`develop` está atrás da produção — e qualquer feature nova nasce de uma base incompleta.

Depois, apague a branch de release:

```bash
git push origin --delete release/1.1.0
```

## Hotfix: o caminho de emergência

Quando a produção quebra e não dá para esperar o próximo release:

```bash
git switch main && git pull
git switch -c hotfix/1.0.1
# corrija o problema
node scripts/preparar-release.mjs 1.0.1
git commit -am "fix: corrige ..."
git push -u origin hotfix/1.0.1
```

PR para a `main`. Depois do merge, o workflow **Release** cria a tag `v1.0.1` e o
back-merge para a `develop`. O incremento é de *patch* (1.0.0 → 1.0.1), não de *minor*.

## Numeração (SemVer)

| Mudança | Incremento | Exemplo |
|---|---|---|
| Correção de bug | patch | 1.1.0 → 1.1.1 |
| Conteúdo ou seção nova | minor | 1.1.0 → 1.2.0 |
| Reestruturação que quebra links existentes | major | 1.2.0 → 2.0.0 |

## Para a discussão final

Cronometre. Do primeiro commit de uma feature até ela estar visível no site publicado,
quanto tempo passou e quantas pessoas precisaram agir? Faça a mesma medição no
repositório trunk-based e compare os dois números — é isso que decide qual modelo
serve para qual projeto.
