# Changelog

Todas as mudanças relevantes deste site são registradas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e versionamento [SemVer](https://semver.org/lang/pt-BR/).

> **Onde editar:** adicione sua linha em **[Não lançado]** dentro do seu PR para a
> `develop`. As seções versionadas só são criadas dentro de uma branch `release/*`.

## [Não lançado]

### Adicionado

- Página sobre as desvantagens do Gitflow em docs/desvantagens.html.
- Suporte a tradução (pt-BR, en-US e es-ES) com dicionários JSON, detecção do idioma do dispositivo e seletor com bandeiras no header.
- Seção "Como o Gitflow surgiu" com a história do modelo na página inicial.

### Corrigido

## [1.0.0] - 2026-08-25

### Adicionado

- Estrutura inicial do site: página do modelo Gitflow, tabela de branches e ciclo de release.
- Lista de participantes gerada a partir de `data/participantes/`.
- Pipeline de CI (validação) e de deploy a partir da `main`.
- Automação do ciclo de release: abertura de `release/*`, tag e back-merge.
