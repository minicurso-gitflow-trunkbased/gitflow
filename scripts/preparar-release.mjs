#!/usr/bin/env node
/**
 * Prepara uma versão: grava VERSION e transforma a seção "[Não lançado]" do
 * CHANGELOG em uma seção datada da nova versão.
 *
 * Uso: node scripts/preparar-release.mjs 1.1.0 [AAAA-MM-DD]
 *
 * É o passo 2 do ciclo de release. Rode-o dentro da branch release/x.y.z —
 * nunca na develop e nunca na main.
 */
import { readFile, writeFile } from 'node:fs/promises';

const versao = process.argv[2];
const data = process.argv[3] ?? new Date().toISOString().slice(0, 10);

if (!versao || !/^\d+\.\d+\.\d+$/.test(versao)) {
  console.error('Uso: node scripts/preparar-release.mjs <versao semver> [AAAA-MM-DD]');
  process.exit(1);
}

const changelog = await readFile('CHANGELOG.md', 'utf8');

if (changelog.includes(`## [${versao}]`)) {
  console.error(`❌ CHANGELOG.md já tem uma seção para ${versao}.`);
  process.exit(1);
}

const marcador = '## [Não lançado]';
if (!changelog.includes(marcador)) {
  console.error('❌ CHANGELOG.md não tem a seção "## [Não lançado]".');
  process.exit(1);
}

// O que estava em "Não lançado" vira a nova versão, e um "Não lançado" vazio
// é recriado no topo para o próximo ciclo.
const novoNaoLancado = `${marcador}\n\n### Adicionado\n\n### Corrigido\n\n## [${versao}] - ${data}`;
const atualizado = changelog.replace(marcador, novoNaoLancado);

await writeFile('CHANGELOG.md', atualizado);
await writeFile('VERSION', versao + '\n');
console.log(`✅ VERSION = ${versao} e CHANGELOG.md atualizado (${data}).`);
