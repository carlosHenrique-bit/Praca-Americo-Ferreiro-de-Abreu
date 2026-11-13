(() => {
    'use strict';
    const formulario = document.getElementById('form-evento');
    if (!formulario) return;
    const campo = id => document.getElementById(id);
    const local = campo('local'), outro = campo('outro');
    const erro = campo('form-erro');
    erro.setAttribute('role', 'alert');
    erro.setAttribute('tabindex', '-1');
    function mostrarErro(mensagem) {
        erro.textContent = mensagem;
        erro.classList.remove('caixa-oculta');
        erro.focus();
    }
    function mostrarOutroLocal() {
        const mostrar = local.value === 'Outros';
        campo('campo-outro').classList.toggle('caixa-oculta', !mostrar);
        outro.disabled = !mostrar;
        outro.required = mostrar;
        if (!mostrar) outro.value = '';
    }
    const hoje = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const parte = nome => hoje.find(p => p.type === nome).value;
    campo('data').min = `${parte('year')}-${parte('month')}-${parte('day')}`;
    local.addEventListener('change', mostrarOutroLocal);
    formulario.addEventListener('reset', () => {
        erro.classList.add('caixa-oculta');
        setTimeout(mostrarOutroLocal, 0);
    });
    formulario.addEventListener('submit', event => {
        event.preventDefault();
        erro.classList.add('caixa-oculta');
        if (!formulario.reportValidity()) return;
        const evento = {
            nome: campo('nome').value.trim(), tipo: campo('tipo').value.trim(),
            data: campo('data').value, inicio: campo('inicio').value,
            termino: campo('termino').value, local: local.value,
            localDescricao: local.value === 'Outros' ? outro.value.trim() : local.value
        };
        if (!evento.nome || !evento.tipo || !evento.localDescricao) {
            mostrarErro('Preencha o responsável, o tipo e o local do evento.'); return;
        }
        if (evento.termino <= evento.inicio) {
            mostrarErro('O horário de término deve ser depois do início, no mesmo dia.'); return;
        }
        try {
            if (existeConflito(evento, lerEventos())) {
                mostrarErro('Já existe um evento nesse dia, local e horário. Escolha outro horário ou local.'); return;
            }
            const salvo = salvarEvento(evento);
            window.location.assign('index.html?evento=' + encodeURIComponent(salvo.id) + '#eventos-cadastrados');
        } catch (problema) {
            mostrarErro('Não foi possível salvar o evento. Verifique se o armazenamento do navegador está disponível e tente novamente.');
        }
    });
    mostrarOutroLocal();
})();
