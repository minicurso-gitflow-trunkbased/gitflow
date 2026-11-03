/* =========================================================
   Minicurso Gitflow — script principal.
   Sem dependências externas, sem build de bundler.
   ========================================================= */
(function () {
  'use strict';

  // i18n.js é carregado antes; o fallback mantém o pt-BR se ele falhar.
  function t(chave, padrao) {
    return window.i18n ? window.i18n.t(chave, padrao) : padrao;
  }

  /* ---------- tema claro/escuro ---------- */
  var CHAVE_TEMA = 'minicurso:tema';

  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    try { localStorage.setItem(CHAVE_TEMA, tema); } catch (e) { /* modo privado */ }
  }

  function temaInicial() {
    try {
      var salvo = localStorage.getItem(CHAVE_TEMA);
      if (salvo) return salvo;
    } catch (e) { /* ignora */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }

  aplicarTema(temaInicial());

  var botaoTema = document.getElementById('alternar-tema');
  if (botaoTema) {
    botaoTema.addEventListener('click', function () {
      var atual = document.documentElement.getAttribute('data-tema');
      aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
    });
  }

  /* ---------- participantes ---------- */
  var grade = document.getElementById('grade-participantes');

  function iniciais(nome) {
    return nome.trim().split(/\s+/).slice(0, 2).map(function (p) {
      return p.charAt(0).toUpperCase();
    }).join('');
  }

  function criarCartao(p) {
    var artigo = document.createElement('article');
    artigo.className = 'participante';

    var avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = iniciais(p.nome || '?');
    artigo.appendChild(avatar);

    var titulo = document.createElement('h3');
    titulo.textContent = p.nome || t('participantes.semNome', 'Sem nome');
    artigo.appendChild(titulo);

    if (p.github) {
      var link = document.createElement('a');
      link.className = 'usuario';
      link.href = 'https://github.com/' + encodeURIComponent(p.github);
      link.rel = 'noopener';
      link.textContent = '@' + p.github;
      artigo.appendChild(link);
    }

    if (p.curiosidade) {
      var texto = document.createElement('p');
      texto.className = 'curiosidade';
      texto.textContent = p.curiosidade;
      artigo.appendChild(texto);
    }

    return artigo;
  }

  // Guardados para redesenhar a grade quando o idioma muda.
  var ultimaLista = null;
  var carregouComErro = false;

  function renderizar(lista) {
    ultimaLista = lista;
    carregouComErro = false;
    grade.innerHTML = '';
    if (!lista.length) {
      var vazio = document.createElement('p');
      vazio.className = 'vazio';
      vazio.textContent = t('participantes.vazio', 'Ninguém por aqui ainda — seja a primeira pessoa a adicionar um arquivo em data/participantes/.');
      grade.appendChild(vazio);
      return;
    }
    var fragmento = document.createDocumentFragment();
    lista.forEach(function (p) { fragmento.appendChild(criarCartao(p)); });
    grade.appendChild(fragmento);

    var metrica = document.querySelector('[data-metrica="participantes"]');
    if (metrica) metrica.textContent = String(lista.length);
  }

  function erro() {
    carregouComErro = true;
    grade.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'vazio';
    p.textContent = t('participantes.erro', 'Não foi possível carregar a lista. Rode "node scripts/gerar-manifesto.mjs" e sirva a pasta com um servidor HTTP local.');
    grade.appendChild(p);
  }

  if (grade) {
    fetch('data/participantes.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (dados) {
        renderizar(Array.isArray(dados) ? dados : (dados.participantes || []));
      })
      .catch(function () {
        erro();
      });
  }

  /* ---------- versão publicada ---------- */
  // A versão vem do arquivo VERSION, versionado no git e alterado apenas
  // dentro de uma branch release/* ou hotfix/*. É o contrato do Gitflow:
  // a versão é uma decisão explícita, não o hash do último commit.
  var seloVersao = document.getElementById('versao');
  var versaoFalhou = false;
  if (seloVersao) {
    fetch('VERSION', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (texto) { seloVersao.textContent = 'v' + texto.trim(); })
      .catch(function () {
        versaoFalhou = true;
        seloVersao.textContent = t('versao.desconhecida', 'desconhecida');
      });
  }

  /* ---------- informação de build ---------- */
  var infoBuild = document.getElementById('build-info');
  var build = null;
  function textoBuild() {
    return t('build.commit', 'commit') + ' ' + build.commit.slice(0, 7) + ' · ' + build.data;
  }
  if (infoBuild) {
    fetch('data/build.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (b) {
        if (b && b.commit) {
          build = b;
          // Passa a ser texto dinâmico: o i18n não deve sobrescrevê-lo com "build local".
          infoBuild.removeAttribute('data-i18n');
          infoBuild.textContent = textoBuild();
        }
      })
      .catch(function () { /* build local, mantém o texto padrão */ });
  }

  /* ---------- troca de idioma ---------- */
  // Só o que é gerado por JS precisa ser refeito; o resto o i18n.js já traduziu.
  document.addEventListener('i18n:mudou', function () {
    if (grade) {
      if (carregouComErro) erro();
      else if (ultimaLista) renderizar(ultimaLista);
    }
    if (seloVersao && versaoFalhou) seloVersao.textContent = t('versao.desconhecida', 'desconhecida');
    if (infoBuild && build) infoBuild.textContent = textoBuild();
  });
})();
