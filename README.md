# Minicurso: Gitflow (laboratório)

Site do lado **Gitflow** do minicurso, publicado em
**https://minicurso-gitflow-trunkbased.github.io/gitflow**.

É o par do repositório [trunk-based](https://github.com/minicurso-gitflow-trunkbased/trunk)
([site](https://minicurso-gitflow-trunkbased.github.io/trunk/)):
mesmo site, mesma stack, mesma turma com acesso de escrita — **processo oposto**.
Aqui ninguém commita na `main`; tudo passa por `develop`, por uma branch de release
e por uma tag antes de ir ao ar.

- **Stack:** HTML, CSS e JavaScript puros. Sem framework, sem bundler, sem dependências.
- **Branches permanentes:** `main` (publicado) e `develop` (próxima versão).
- **Versão atual:** arquivo [`VERSION`](VERSION) — mudado apenas em `release/*` e `hotfix/*`.

## Rodando localmente

```bash
git clone https://github.com/minicurso-gitflow-trunkbased/gitflow.git
cd gitflow
git switch develop

node scripts/gerar-manifesto.mjs   # gera data/participantes.json
python3 -m http.server 8000        # ou: npx serve .
```

Abra <http://localhost:8000>. Abrir o `index.html` pelo `file://` **não funciona**:
o navegador bloqueia o `fetch` dos arquivos de dados.

Antes de dar push, rode a mesma checagem da CI:

```bash
node scripts/validar.mjs
```

## Fluxo em uma tela

| Sua branch | Nasce de | PR para | Quando aparece no site |
|---|---|---|---|
| `feature/*` | `develop` | `develop` | só no próximo release |
| `release/*` | `develop` | `main` (e back-merge para `develop`) | ao integrar na `main` |
| `hotfix/*` | `main` | `main` (e back-merge para `develop`) | imediatamente |

A CI recusa Pull Requests com alvo errado — veja o job *Conferir o alvo do Pull Request*
em `.github/workflows/ci.yml`.

## Estrutura

```
index.html                    página inicial (modelo, branches, ciclo de release)
404.html                      página de erro do GitHub Pages
VERSION                       versão publicada — só muda em release/* e hotfix/*
CHANGELOG.md                  histórico; edite a seção "Não lançado" no seu PR
assets/css/style.css          estilos (adicione os seus no fim do arquivo)
assets/js/main.js             script principal, sem dependências
data/participantes/*.json     um arquivo por pessoa  ← é aqui que você começa
docs/gitflow.html             guia rápido do fluxo
scripts/gerar-manifesto.mjs   junta os JSONs em data/participantes.json
scripts/validar.mjs           checagens da CI (HTML, JSON, links, VERSION/CHANGELOG)
scripts/preparar-release.mjs  grava VERSION e fecha a seção do CHANGELOG
scripts/notas-da-versao.mjs   extrai as notas de uma versão do CHANGELOG
.github/workflows/            ci, deploy, abrir-release, release
```

`data/participantes.json` e `data/build.json` são **gerados** — estão no `.gitignore`.

## Workflows

| Workflow | Dispara em | O que faz |
|---|---|---|
| `ci.yml` | PRs e pushes em `develop`/`feature`/`release`/`hotfix` | Valida o site e confere o alvo do PR |
| `deploy.yml` | push na `main` | Publica no GitHub Pages |
| `abrir-release.yml` | manual (Actions → Abrir release) | Cria `release/x.y.z`, grava `VERSION`, fecha o `CHANGELOG` e abre o PR para a `main` |
| `release.yml` | push na `main` | Cria a tag `vX.Y.Z`, o GitHub Release e o PR de back-merge |

## Documentação

- [CONTRIBUTING.md](CONTRIBUTING.md) — fluxo de trabalho, convenção de commits, conflitos.
- [docs/gitflow.html](docs/gitflow.html) — as cinco regras e a colinha de comandos.
- [docs/ciclo-de-release.md](docs/ciclo-de-release.md) — o roteiro completo de um release e de um hotfix.
- [docs/configuracao-do-repositorio.md](docs/configuracao-do-repositorio.md) — o que quem administra precisa configurar no GitHub.
