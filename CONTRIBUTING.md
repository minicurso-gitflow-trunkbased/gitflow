# Como contribuir

Você tem acesso de escrita a este repositório, mas — diferente do repositório
trunk-based — esse acesso **não** inclui empurrar direto para a `main` ou para a
`develop`. As duas são protegidas. Tudo passa por Pull Request.

## A regra de ouro

**Sua branch nasce da `develop` e volta para a `develop`.** As exceções (`release/*`
e `hotfix/*`) existem para publicar versões, não para trabalho do dia a dia.

## Seu primeiro Pull Request

```bash
# 1. Clone (uma vez só)
git clone https://github.com/minicurso-gitflow-trunkbased/gitflow.git
cd gitflow

# 2. Parta sempre da develop atualizada
git switch develop
git pull

# 3. Uma branch por tarefa
git switch -c feature/seu-usuario

# 4. Crie SEU arquivo (nome = seu usuário do GitHub)
cp data/participantes/_exemplo.json data/participantes/seu-usuario.json
# edite o arquivo com seus dados

# 5. Registre a mudança no CHANGELOG, na seção "Não lançado"
#    (uma linha em "### Adicionado")

# 6. Verifique antes de empurrar
node scripts/validar.mjs

# 7. Commit e push
git add data/participantes/seu-usuario.json CHANGELOG.md
git commit -m "feat: adiciona participante seu-usuario"
git push -u origin feature/seu-usuario
```

Abra o Pull Request **com base na `develop`**. A CI vai validar o site e conferir o
alvo do PR. Depois do merge, sua mudança está na `develop` — mas **ainda não no site**.
Ela vai ao ar no próximo release. Essa espera é o ponto da aula.

### Limpe a branch depois do merge

```bash
git switch develop
git pull
git branch -d feature/seu-usuario
git push origin --delete feature/seu-usuario
```

## Nomes de branch

| Prefixo | Nasce de | PR para | Exemplo |
|---|---|---|---|
| `feature/` | `develop` | `develop` | `feature/secao-quiz` |
| `fix/` | `develop` | `develop` | `fix/link-do-rodape` |
| `release/` | `develop` | `main` | `release/1.1.0` |
| `hotfix/` | `main` | `main` | `hotfix/1.0.1` |

## Convenção de commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/) — prefixo, dois
pontos, uma frase no imperativo:

| Prefixo | Quando usar |
|---|---|
| `feat:` | nova seção, novo componente, novo conteúdo |
| `fix:` | correção de bug, link quebrado, erro de digitação em código |
| `docs:` | README, CONTRIBUTING, comentários |
| `style:` | CSS e ajustes visuais que não mudam comportamento |
| `refactor:` | reorganização sem mudança de comportamento |
| `chore:` | CI, scripts, configuração, preparação de release |

## O que você **não** deve fazer

- ❌ Editar `VERSION` em uma feature. Só `release/*` e `hotfix/*` mexem nele.
- ❌ Criar seções novas no `CHANGELOG.md`. Escreva em **[Não lançado]**; a seção
  versionada é criada pelo `scripts/preparar-release.mjs` durante o release.
- ❌ Abrir PR de `feature/*` para a `main`. A CI recusa.
- ❌ `git push --force` em qualquer branch compartilhada.
- ❌ Editar o arquivo de participante de outra pessoa.

## Evitando conflitos

1. **Um arquivo por pessoa** em `data/participantes/`.
2. **CSS novo vai no fim** do `assets/css/style.css`, depois do comentário que marca o
   ponto de inserção.
3. **Branch curta mesmo assim.** Gitflow permite branches longas — e é justamente por
   isso que os conflitos aqui são maiores. Não use isso como desculpa para sumir por
   uma semana.
4. **Atualize sua branch** com a `develop` antes de pedir revisão:

```bash
git switch develop && git pull
git switch feature/sua-branch
git merge develop        # ou: git rebase develop
```

O `CHANGELOG.md` é o arquivo que mais conflita, porque todo mundo escreve na mesma
seção. Quando acontecer: **mantenha as duas linhas**, uma embaixo da outra.

### Deu conflito, e agora?

```bash
git merge develop
# Git aponta o arquivo em conflito. Abra, escolha o que fica, e então:
git add <arquivo>
git commit
git push
```

Para desistir e voltar ao estado anterior: `git merge --abort`.

## Quebrou a `main`?

Na `main` só entra release ou hotfix, então quebrar aqui é raro — e caro. O caminho é
um `hotfix/`:

```bash
git switch main && git pull
git switch -c hotfix/1.0.1
# corrija o problema
node scripts/preparar-release.mjs 1.0.1
git commit -am "fix: corrige ..."
git push -u origin hotfix/1.0.1
# PR para main; depois do merge, a Action abre o back-merge para a develop
```

Compare com o repositório trunk-based, onde a mesma correção seria um `git revert`
seguido de `git push`. Anote a diferença de esforço: ela é metade da conclusão do
minicurso.

## O que a CI verifica

`scripts/validar.mjs` confere que:

- os arquivos essenciais do site existem;
- todo `.json` do repositório é parseável;
- todo `.html` tem `<!DOCTYPE>`, `<title>` e `lang`;
- nenhum `href`/`src` local aponta para arquivo inexistente;
- `VERSION` é semver e tem uma seção correspondente no `CHANGELOG.md`.

O job *Conferir o alvo do Pull Request* valida a combinação origem → destino.
