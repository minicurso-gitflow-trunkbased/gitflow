Branch de release aberta automaticamente a partir da `develop`.

### Antes de integrar

- [ ] Revisar a seção desta versão no `CHANGELOG.md`
- [ ] Conferir o site rodando a partir desta branch
- [ ] CI verde (veja o aviso abaixo)
- [ ] Tirar o PR do modo rascunho

> Pull Requests criados pelo `GITHUB_TOKEN` não disparam workflows. Se a CI não tiver
> rodado aqui, empurre um commit nesta branch (ou feche e reabra o PR) antes do merge.

### Depois de integrar

O workflow **Release** cria a tag, o GitHub Release e o PR de back-merge para a `develop`.
Correções feitas nesta branch precisam voltar para a `develop` — é para isso que o back-merge existe.
