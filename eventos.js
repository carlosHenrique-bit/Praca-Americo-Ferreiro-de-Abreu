(() => {
    'use strict';
    const conteudo = document.getElementById('evento-conteudo');
    if (!conteudo) return;
    const posicao = document.getElementById('evento-posicao');
    const anterior = document.getElementById('evento-anterior');
    const proximo = document.getElementById('evento-proximo');
    const banner = document.getElementById('carrossel-eventos');
    const filtros = [...document.querySelectorAll('.btn-filtro')];
    const selecionado = new URLSearchParams(window.location.search).get('evento');
    let eventos = [], indice = 0, categoria = 'todos', selecionarNovo = true;
    function elemento(tag, texto) {
        const el = document.createElement(tag);
        if (texto !== undefined) el.textContent = texto;
        return el;
    }
    function mensagem(titulo, texto) {
        conteudo.replaceChildren(elemento('h3', titulo), elemento('p', texto));
        posicao.textContent = '0/0';
        anterior.disabled = proximo.disabled = true;
    }
    function renderizar() {
        banner.style.setProperty('--foto-evento', "linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.65)),url('assets/img-banner.jpg')");
        let todos;
        try { todos = obterEventos(); }
        catch { mensagem('Não foi possível carregar a agenda', 'O armazenamento do navegador não está disponível ou os dados salvos precisam ser verificados.'); return; }
        eventos = todos.filter(ev => categoria === 'todos' || ev.categoria === categoria);
        if (selecionarNovo) {
            const encontrado = eventos.findIndex(ev => ev.id === selecionado);
            if (encontrado >= 0) indice = encontrado;
            selecionarNovo = false;
        }
        if (!eventos.length) { mensagem('Nenhum evento cadastrado', 'Não existem eventos cadastrados nesta categoria no momento.'); return; }
        indice = Math.max(0, Math.min(indice, eventos.length - 1));
        const evento = eventos[indice];
        const bloco = elemento('div');
        const tag = elemento('span', `${String(evento.categoria || 'cultural').toUpperCase()} • DE ${evento.inicio} ÀS ${evento.termino}`);
        tag.className = 'evento-tag';
        const titulo = elemento('h3', evento.tipo);
        const data = /^\d{4}-\d{2}-\d{2}$/.test(evento.data) ? evento.data.split('-').reverse().join('/') : evento.data;
        const local = evento.localDescricao || (evento.local === 'Outros' ? evento.outro : evento.local);
        bloco.append(tag, titulo, elemento('p', `Organizador: ${evento.nome}`),
            elemento('p', `Local: ${local || 'Não informado'} • Data: ${data}`));
        if (evento.id === selecionado) {
            const aviso = elemento('p', 'Evento cadastrado com sucesso neste navegador.');
            aviso.setAttribute('role', 'status'); bloco.append(aviso);
        }
        conteudo.replaceChildren(bloco);
        posicao.textContent = `${indice + 1}/${eventos.length}`;
        anterior.disabled = proximo.disabled = eventos.length <= 1;
    }
    anterior.addEventListener('click', () => {
        if (!eventos.length) return;
        indice = (indice - 1 + eventos.length) % eventos.length; renderizar();
    });
    proximo.addEventListener('click', () => {
        if (!eventos.length) return;
        indice = (indice + 1) % eventos.length; renderizar();
    });
    filtros.forEach(botao => botao.addEventListener('click', () => {
        categoria = botao.dataset.categoria; indice = 0;
        filtros.forEach(filtro => { const ativo = filtro === botao; filtro.classList.toggle('ativo', ativo); filtro.setAttribute('aria-pressed', String(ativo)); });
        renderizar();
    }));
    window.addEventListener('pageshow', renderizar);
    window.addEventListener('storage', event => { if (event.key === 'banco_eventos_praca' || event.key === null) renderizar(); });
    renderizar();
})();
