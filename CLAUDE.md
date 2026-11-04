# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A teaching lab for the Gitflow side of a Gitflow vs. trunk-based course (docs, commit messages and CHANGELOG are in Portuguese; keep that). It is a static site (plain HTML/CSS/JS, no framework, bundler or dependencies) published to GitHub Pages. The repo's real subject is the **branching/release process**, which the CI and workflows enforce.

## Commands

```bash
node scripts/validar.mjs           # the CI check; run before pushing
node scripts/gerar-manifesto.mjs   # builds data/participantes.json (gitignored)
python3 -m http.server 8000        # serve locally; file:// does NOT work (fetch is blocked)
node scripts/preparar-release.mjs 1.1.0 [AAAA-MM-DD]   # only on release/* or hotfix/*
node scripts/notas-da-versao.mjs 1.1.0                 # print a version's CHANGELOG notes
```

There is no test suite or linter; `validar.mjs` is the only check (Node 22 in CI). It verifies: required files exist, every `.json` parses, every `.html` has `<!DOCTYPE>`/`<title>`/`lang`, local `href`/`src` resolve, and `VERSION` is semver with a matching `## [x.y.z]` section in `CHANGELOG.md`.

## Gitflow rules (enforced by CI and branch protection)

- `main` = published, `develop` = next version; both protected, never commit to them directly.
- `feature/*` and `fix/*` branch from `develop` and PR into `develop`. `release/*` branches from `develop`, `hotfix/*` from `main`; both PR into `main` and are back-merged to `develop`.
- The `alvo-do-pr` job in `.github/workflows/ci.yml` rejects wrong source→target combos (e.g. `feature/*` → `main`).
- `VERSION` changes only on `release/*` / `hotfix/*`. Feature work edits only the `## [Não lançado]` section of `CHANGELOG.md` (never create versioned sections by hand).
- Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`). No force-push on shared branches.

## Architecture

**Release automation is a chain of workflows spanning several files:**
1. `abrir-release.yml` (manual dispatch) creates `release/x.y.z` from `develop`, runs `preparar-release.mjs` (writes `VERSION`, turns "Não lançado" into a dated section and recreates an empty one), validates, and opens a draft PR to `main`.
2. Merging into `main` triggers both `deploy.yml` (validate → generate manifest → write `data/build.json` → publish to Pages) and `release.yml` (create tag `vX.Y.Z` from `VERSION` if absent, GitHub Release using `notas-da-versao.mjs`, and a `backmerge/vX.Y.Z` PR into `develop` if they differ).
3. Only `main` is deployed; `develop` never reaches production.

**Participant data:** one JSON file per person in `data/participantes/` (copy `_exemplo.json`; fields `nome` required, `github`, `curiosidade`) to avoid merge conflicts. `gerar-manifesto.mjs` validates and merges them (files starting with `_` skipped) into `data/participantes.json`, which `assets/js/main.js` fetches. `data/participantes.json` and `data/build.json` are generated and gitignored — don't commit them.

**i18n:** Portuguese text stays in the HTML as the no-JS default; `assets/js/i18n.js` swaps it using `assets/i18n/{pt-BR,en-US,es-ES}.json` (flat dotted keys; `pt-BR.json` is the reference). Elements opt in via `data-i18n`, `data-i18n-html` or `data-i18n-attr="attr:key"`. Initial language = saved choice (`localStorage` `minicurso:idioma`, written only on manual selection) → `navigator.languages` prefix match → `en-US`. Strings built in JS use `window.i18n.t()` and re-render on the `i18n:mudou` event (`main.js`). New text needs its key in all three JSONs; `validar.mjs` enforces key parity and that HTML only uses existing keys. Shell commands in `<pre>` are intentionally not translated.

**Conflict-avoidance conventions:** new CSS goes at the end of `assets/css/style.css`, after the insertion-point comment; don't edit another person's participant file.

More detail: `CONTRIBUTING.md`, `docs/ciclo-de-release.md` (full release/hotfix walkthrough), `docs/configuracao-do-repositorio.md` (GitHub admin setup).
