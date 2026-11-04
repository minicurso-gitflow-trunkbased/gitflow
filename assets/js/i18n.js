/* =========================================================
   Minicurso Gitflow — internacionalização (pt-BR, en-US, es-ES).
   O HTML mantém o texto em pt-BR como padrão; este módulo troca
   o conteúdo a partir de assets/i18n/<idioma>.json.
   ========================================================= */
(function () {
  'use strict';

  var IDIOMAS = ['pt-BR', 'en-US', 'es-ES'];
  var PADRAO = 'en-US';
  var CHAVE_IDIOMA = 'minicurso:idioma';
  // Resolvido a partir do próprio script: funciona na raiz e em /docs/.
  var BASE = document.currentScript.src.replace(/js\/i18n\.js(\?.*)?$/, '');

  var dicionario = {};
  var atual = IDIOMAS[0];
  var cache = {};

  function normalizar(codigo) {
    if (!codigo) return null;
    var minusculo = String(codigo).toLowerCase();
    for (var i = 0; i < IDIOMAS.length; i++) {
      if (IDIOMAS[i].toLowerCase() === minusculo) return IDIOMAS[i];
    }
    var idioma = minusculo.split('-')[0];
    for (var j = 0; j < IDIOMAS.length; j++) {
      if (IDIOMAS[j].toLowerCase().split('-')[0] === idioma) return IDIOMAS[j];
    }
    return null;
  }

  function idiomaInicial() {
    try {
      var salvo = normalizar(localStorage.getItem(CHAVE_IDIOMA));
      if (salvo) return salvo;
    } catch (e) { /* modo privado */ }
    var preferidos = navigator.languages && navigator.languages.length
      ? navigator.languages : [navigator.language];
    for (var i = 0; i < preferidos.length; i++) {
      var achado = normalizar(preferidos[i]);
      if (achado) return achado;
    }
    return PADRAO;
  }

  function carregar(idioma) {
    if (cache[idioma]) return Promise.resolve(cache[idioma]);
    return fetch(BASE + 'i18n/' + idioma + '.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (dados) { cache[idioma] = dados; return dados; });
  }

  function t(chave, padrao) {
    return Object.prototype.hasOwnProperty.call(dicionario, chave)
      ? dicionario[chave] : (padrao !== undefined ? padrao : chave);
  }

  function aplicar() {
    document.documentElement.setAttribute('lang', atual);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var chave = el.getAttribute('data-i18n');
      if (chave in dicionario) el.textContent = dicionario[chave];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var chave = el.getAttribute('data-i18n-html');
      if (chave in dicionario) el.innerHTML = dicionario[chave];
    });
    // data-i18n-attr="aria-label:chave;content:outra.chave"
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (par) {
        var partes = par.split(':');
        if (partes.length === 2 && partes[1].trim() in dicionario) {
          el.setAttribute(partes[0].trim(), dicionario[partes[1].trim()]);
        }
      });
    });
  }

  // salvar=true só quando a pessoa escolhe: a detecção automática não fixa o idioma.
  function definir(codigo, salvar) {
    var idioma = normalizar(codigo) || PADRAO;
    return carregar(idioma).then(function (dados) {
      dicionario = dados;
      atual = idioma;
      if (salvar) {
        try { localStorage.setItem(CHAVE_IDIOMA, idioma); } catch (e) { /* ignora */ }
      }
      aplicar();
      document.dispatchEvent(new CustomEvent('i18n:mudou', { detail: { idioma: idioma } }));
    }).catch(function () { /* mantém o texto atual (pt-BR no HTML) */ });
  }

  /* ---------- seletor com bandeiras ---------- */
  var ROTULOS = {
    'pt-BR': { bandeira: 'br', nome: 'Português' },
    'en-US': { bandeira: 'us', nome: 'English' },
    'es-ES': { bandeira: 'es', nome: 'Español' }
  };

  function bandeira(idioma) {
    var img = document.createElement('img');
    img.src = BASE + 'img/flags/' + ROTULOS[idioma].bandeira + '.svg';
    img.alt = '';
    img.width = 22;
    img.height = 16;
    return img;
  }

  function montarSeletor() {
    var raiz = document.getElementById('seletor-idioma');
    if (!raiz) return;

    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'seletor-botao';
    botao.setAttribute('aria-haspopup', 'listbox');
    botao.setAttribute('aria-expanded', 'false');

    var lista = document.createElement('ul');
    lista.className = 'seletor-lista';
    lista.setAttribute('role', 'listbox');
    lista.tabIndex = -1;
    lista.hidden = true;

    var itens = IDIOMAS.map(function (idioma) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('lang', idioma);
      li.dataset.idioma = idioma;
      li.tabIndex = -1;
      li.appendChild(bandeira(idioma));
      var nome = document.createElement('span');
      nome.textContent = ROTULOS[idioma].nome;
      li.appendChild(nome);
      lista.appendChild(li);
      return li;
    });

    raiz.appendChild(botao);
    raiz.appendChild(lista);

    function atualizarBotao() {
      botao.textContent = '';
      botao.appendChild(bandeira(atual));
      var codigo = document.createElement('span');
      codigo.textContent = atual.slice(0, 2).toUpperCase();
      botao.appendChild(codigo);
      botao.setAttribute('aria-label', t('idioma.aria', 'Idioma do site') + ': ' + ROTULOS[atual].nome);
      itens.forEach(function (li) {
        li.setAttribute('aria-selected', String(li.dataset.idioma === atual));
      });
    }

    function abrir() {
      lista.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
      var selecionado = itens.filter(function (li) { return li.dataset.idioma === atual; })[0];
      (selecionado || itens[0]).focus();
    }

    function fechar(devolverFoco) {
      lista.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
      if (devolverFoco) botao.focus();
    }

    function escolher(li) {
      definir(li.dataset.idioma, true);
      fechar(true);
    }

    botao.addEventListener('click', function () { lista.hidden ? abrir() : fechar(false); });
    botao.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); abrir(); }
    });

    lista.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (li) escolher(li);
    });
    lista.addEventListener('keydown', function (e) {
      var i = itens.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); itens[(i + 1) % itens.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); itens[(i - 1 + itens.length) % itens.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); itens[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); itens[itens.length - 1].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i >= 0) escolher(itens[i]); }
      else if (e.key === 'Escape') { e.preventDefault(); fechar(true); }
      else if (e.key === 'Tab') { fechar(false); }
    });
    document.addEventListener('click', function (e) {
      if (!raiz.contains(e.target)) fechar(false);
    });

    document.addEventListener('i18n:mudou', atualizarBotao);
    atualizarBotao();
  }

  montarSeletor();

  window.i18n = {
    IDIOMAS: IDIOMAS,
    t: t,
    idioma: function () { return atual; },
    definir: definir
  };

  definir(idiomaInicial());
})();
