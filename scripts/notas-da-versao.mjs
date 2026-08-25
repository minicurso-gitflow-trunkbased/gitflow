#!/usr/bin/env node
/**
 * Imprime a seção do CHANGELOG referente a uma versão.
 * Usado pela Action de release para preencher as notas do GitHub Release.
 *
 * Uso: node scripts/notas-da-versao.mjs 1.1.0
 */
import { readFile } from 'node:fs/promises';

const versao = process.argv[2];
if (!versao) {
  console.error('Uso: node scripts/notas-da-versao.mjs <versao>');
  process.exit(1);
}

const linhas = (await readFile('CHANGELOG.md', 'utf8')).split('\n');
const inicio = linhas.findIndex((l) => l.startsWith(`## [${versao}]`));

if (inicio === -1) {
  console.error(`❌ Seção "## [${versao}]" não encontrada no CHANGELOG.md.`);
  process.exit(1);
}

const resto = linhas.slice(inicio + 1);
const fim = resto.findIndex((l) => l.startsWith('## '));
const corpo = (fim === -1 ? resto : resto.slice(0, fim)).join('\n').trim();

console.log(corpo || '_Sem notas registradas para esta versão._');
