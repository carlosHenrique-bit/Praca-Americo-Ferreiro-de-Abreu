(() => {
    'use strict';
    const faixa = document.getElementById('anuncio');
    if (!faixa) return;
    const janela = faixa.querySelector('.anuncio-janela');
    const trilha = faixa.querySelector('.anuncio-trilha');
    const botao = faixa.querySelector('.anuncio-pausa');
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
    let assinaturaAnterior = '', larguraAnterior = -1;
    let pausado = false;
    function item(texto, oculto = false) {
        const span = document.createElement('span');
        span.className = 'anuncio-item'; span.textContent = texto;
        if (oculto) span.setAttribute('aria-hidden', 'true');
        return span;
    }
    function atualizarBotao() {
        faixa.classList.toggle('anuncio-pausado', pausado);
        botao.textContent = pausado ? 'Retomar' : 'Pausar';
        botao.setAttribute('aria-pressed', String(pausado));
        botao.setAttribute('aria-label', pausado ? 'Retomar movimento dos anúncios' : 'Pausar movimento dos anúncios');
    }
    function atualizar(forcar = false) {
        let textos;
        try {
            textos = obterEventos().map(evento => {
                const data = /^\d{4}-\d{2}-\d{2}$/.test(evento.data) ? evento.data.split('-').reverse().join('/') : String(evento.data || 'Data a definir');
                const local = evento.localDescricao || (evento.local === 'Outros' ? evento.outro : evento.local) || 'Local a definir';
                return `${evento.tipo || 'Evento'} • ${data} • ${evento.inicio || '--:--'} às ${evento.termino || '--:--'} • ${local}`;
            });
        } catch {
            textos = ['Não foi possível carregar os eventos cadastrados.'];
        }
        const temEventos = textos.length > 0 && !textos[0].startsWith('Não foi possível');
        if (!textos.length) textos = ['Nenhum evento cadastrado. Cadastre um evento na praça!'];
        const assinatura = JSON.stringify(textos);
        const largura = janela.clientWidth;
        if (!forcar && assinatura === assinaturaAnterior && largura === larguraAnterior) return;
        assinaturaAnterior = assinatura; larguraAnterior = largura;
        faixa.classList.remove('anuncio-animado');
        const grupo = document.createElement('div'); grupo.className = 'anuncio-grupo';
        textos.forEach(texto => grupo.append(item(texto)));
        trilha.replaceChildren(grupo);
        botao.hidden = !temEventos || reduzirMovimento.matches;
        if (!temEventos) return;
        if (reduzirMovimento.matches) { atualizarBotao(); return; }
        // Duas sequências de largura idêntica evitam saltos e espaços vazios no loop.
        const larguraBase = grupo.getBoundingClientRect().width;
        if (larguraBase <= 0 || largura <= 0) return;
        const repeticoes = Math.max(1, Math.ceil(largura / larguraBase));
        for (let copia = 1; copia < repeticoes; copia++) textos.forEach(texto => grupo.append(item(texto, true)));
        const duplicado = grupo.cloneNode(true);
        duplicado.setAttribute('aria-hidden', 'true');
        trilha.append(duplicado);
        const duracao = grupo.getBoundingClientRect().width / 55;
        faixa.style.setProperty('--anuncio-duracao', `${duracao}s`);
        faixa.classList.add('anuncio-animado'); atualizarBotao();
    }
    botao.addEventListener('click', () => { pausado = !pausado; atualizarBotao(); });
    window.addEventListener('storage', event => { if (event.key === 'banco_eventos_praca' || event.key === null) atualizar(); });
    window.addEventListener('eventos-atualizados', () => atualizar());
    window.addEventListener('pageshow', () => atualizar());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) atualizar(); });
    reduzirMovimento.addEventListener('change', () => atualizar(true));
    if ('ResizeObserver' in window) new ResizeObserver(() => atualizar()).observe(janela);
    else window.addEventListener('resize', () => atualizar());
    if (document.fonts) document.fonts.ready.then(() => atualizar(true));
    atualizar();
})();
