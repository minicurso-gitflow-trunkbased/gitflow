# Configuração do repositório (para quem administra)

Passos que **precisam ser feitos na interface do GitHub** — não dá para versionar em arquivo.

## 1. Criar o repositório

- Organização: `minicurso-gitflow-trunkbased` (a mesma do repositório trunk-based)
- Repositório: `gitflow` (público)

A URL publicada fica `https://minicurso-gitflow-trunkbased.github.io/gitflow`. Todos os
caminhos do site são relativos, então funciona nessa subpasta sem ajuste.

```bash
git remote add origin git@github.com:minicurso-gitflow-trunkbased/gitflow.git
git push -u origin main
git push -u origin develop
```

Depois, em **Settings → General → Default branch**, mude a branch padrão para
**`develop`**. É o detalhe que faz o Gitflow funcionar na prática: PRs abertos pela
interface passam a mirar a `develop` por padrão, e clones novos já caem nela.

## 2. Ativar o GitHub Pages via Actions

**Settings → Pages → Build and deployment → Source: `GitHub Actions`.**

Se ficar em "Deploy from a branch", o workflow `deploy.yml` falha em `configure-pages`.

## 3. Dar acesso de escrita à turma

**Settings → Collaborators and teams** → time `alunos` com permissão **Write**.

Permissão `Write` deixa criar branches e abrir PRs. As proteções do próximo passo é que
impedem o push direto nas branches permanentes.

## 4. Proteger `main` e `develop`

Aqui está a diferença central em relação ao repositório trunk-based, onde quase nada é
protegido. **Settings → Rules → Rulesets → New branch ruleset:**

### Ruleset `main`

| Regra | Valor |
|---|---|
| Target | `main` |
| Require a pull request before merging | ✅ (1 aprovação) |
| Require status checks to pass | ✅ → `Validar`, `Conferir o alvo do Pull Request` |
| Require branches to be up to date | ✅ |
| Block force pushes | ✅ |
| Restrict deletions | ✅ |

### Ruleset `develop`

Mesmas regras, com **0 aprovações obrigatórias** — senão a aula trava esperando revisão
de trinta PRs. Se a turma for pequena, mantenha 1 aprovação e faça da revisão parte do
exercício.

> Os nomes dos status checks só aparecem na lista depois que os workflows rodarem pelo
> menos uma vez. Se a lista estiver vazia, abra um PR de teste primeiro.

### Bypass

Adicione a si mesmo (ou o time de organizadores) na lista de *bypass* dos dois rulesets.
Se algo travar no meio da aula, você precisa conseguir destravar.

## 5. Permissões de Actions

**Settings → Actions → General:**

- *Actions permissions*: Allow all actions.
- *Workflow permissions*: **Read and write permissions** e marque
  **Allow GitHub Actions to create and approve pull requests**.

Sem essas duas opções, os workflows `abrir-release.yml` e `release.yml` falham ao criar
branches, tags e Pull Requests.

## 6. Checagem final

1. Push da `main` e da `develop`; branch padrão = `develop`.
2. **Actions** → `Deploy` verde; o site carrega em
   `https://minicurso-gitflow-trunkbased.github.io/gitflow` mostrando o selo `v1.0.0`.
3. **Actions** → `Release` deve ter criado a tag `v1.0.0` e o GitHub Release.
4. Abra um PR de teste de uma `feature/*` para a `main` — a CI **precisa falhar** no job
   *Conferir o alvo do Pull Request*. Se passar, o workflow não está ativo.
5. Tente `git push origin develop` direto — precisa ser recusado.

## 7. Sugestão de condução da aula

Rode os dois repositórios na mesma sessão, com a turma dividida ou em dois momentos:

1. Primeiro o trunk-based: todos commitam, o site muda em minutos, os conflitos são
   pequenos e frequentes.
2. Depois o Gitflow: as mesmas mudanças, agora com PR, espera pela revisão e release.
3. Feche comparando os números: tempo até a publicação, número de passos, tamanho dos
   conflitos, e — do outro lado — rastreabilidade de versão e facilidade de rollback.
