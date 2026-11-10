const formulario = document.getElementById('form-evento');
const nome = document.getElementById('nome');
const tipo = document.getElementById('tipo');
const data = document.getElementById('data');
const inicio = document.getElementById('inicio');
const termino = document.getElementById('termino');
const local = document.getElementById('local');
const outro = document.getElementById('outro');
const campoOutro = document.getElementById('campo-outro');
const erroCampos = document.getElementById('erro-campos');
const erroEvento = document.getElementById('erro-evento');
const confirmacao = document.getElementById('confirmacao');
const caixaConfirmacao = document.querySelector('.caixa-confirmacao');
const fecharConfirmacao = document.getElementById('fechar-confirmacao');
const linkEmail = document.getElementById('abrir-email');
const avisoArmazenamento = document.getElementById('aviso-armazenamento');
const botaoEnviar = document.getElementById('enviar');

function mostrarOutroLocal() {
    if (local.value === 'Outros') {
        campoOutro.classList.remove('caixa-oculta');
        outro.disabled = false;
        outro.required = true;
    } else {
        campoOutro.classList.add('caixa-oculta');
        outro.disabled = true;
        outro.required = false;
        outro.value = '';
    }
}

function pegarValores() {
    let localEscolhido = local.value;
    if (local.value === 'Outros') localEscolhido = outro.value.trim();

    const evento = {
        nome: nome.value.trim(),
        tipo: tipo.value.trim(),
        data: data.value,
        inicio: inicio.value,
        termino: termino.value,
        local: local.value,
        localDescricao: localEscolhido
    };
    return evento;
}

function verificarCampos(evento) {
    termino.setCustomValidity('');
    if (!evento.nome || !evento.tipo || !evento.data || !evento.inicio ||
        !evento.termino || !evento.local || !evento.localDescricao) {
        erroCampos.textContent = 'Preencha todos os campos. Clique nesta mensagem para fechar.';
        erroCampos.classList.remove('caixa-oculta');
        erroCampos.focus();
        return false;
    }
    if (evento.termino <= evento.inicio) {
        erroCampos.textContent = 'O término deve ser depois do início, no mesmo dia. Clique para fechar.';
        erroCampos.classList.remove('caixa-oculta');
        erroCampos.focus();
        return false;
    }
    if (!formulario.checkValidity()) {
        erroCampos.textContent = 'Confira os dados: a data não pode ser anterior a hoje. Clique para fechar.';
        erroCampos.classList.remove('caixa-oculta');
        erroCampos.focus();
        return false;
    }
    return true;
}

function verificarCadastro(evento) {
    const eventosSalvos = lerEventos();
    if (existeConflito(evento, eventosSalvos)) {
        erroEvento.classList.remove('caixa-oculta');
        erroEvento.focus();
        return false;
    }
    return true;
}

function prepararEmail(evento) {
    const mensagem = 'Solicitação de evento na praça\n\n' +
        'Nome: ' + evento.nome + '\n' +
        'Evento: ' + evento.tipo + '\n' +
        'Data: ' + evento.data + '\n' +
        'Início: ' + evento.inicio + '\n' +
        'Término: ' + evento.termino + '\n' +
        'Local: ' + evento.localDescricao;
    linkEmail.href = 'mailto:ouvidoria@uberlandia.mg.gov.br?subject=' +
        encodeURIComponent('Solicitação de evento na praça') + '&body=' + encodeURIComponent(mensagem);
}

function salvarFormulario(clique) {
    clique.preventDefault();
    erroCampos.classList.add('caixa-oculta');
    erroEvento.classList.add('caixa-oculta');
    avisoArmazenamento.textContent = '';

    const evento = pegarValores();
    if (!verificarCampos(evento)) return;

    try {
        if (!verificarCadastro(evento)) return;
        salvarEvento(evento);
    } catch (problema) {
        avisoArmazenamento.textContent = 'Não foi possível salvar. Verifique o armazenamento do navegador.';
        return;
    }
    prepararEmail(evento);
    confirmacao.classList.remove('caixa-oculta');
    caixaConfirmacao.focus();
    formulario.reset();
}

function ocultarConfirmacao() {
    confirmacao.classList.add('caixa-oculta');
    botaoEnviar.focus();
}

erroCampos.addEventListener('click', function() {
    erroCampos.classList.add('caixa-oculta');
    nome.focus();
});
erroEvento.addEventListener('click', function() {
    erroEvento.classList.add('caixa-oculta');
    data.focus();
});
fecharConfirmacao.addEventListener('click', ocultarConfirmacao);
confirmacao.addEventListener('click', function(clique) {
    if (clique.target === confirmacao) ocultarConfirmacao();
});

document.addEventListener('keydown', function(tecla) {
    if (tecla.key === 'Escape') {
        erroCampos.classList.add('caixa-oculta');
        erroEvento.classList.add('caixa-oculta');
        if (!confirmacao.classList.contains('caixa-oculta')) ocultarConfirmacao();
    }
    if (tecla.key === 'Tab' && !confirmacao.classList.contains('caixa-oculta')) {
        if (tecla.shiftKey && (document.activeElement === linkEmail || document.activeElement === caixaConfirmacao)) {
            tecla.preventDefault();
            fecharConfirmacao.focus();
        } else if (!tecla.shiftKey && document.activeElement === fecharConfirmacao) {
            tecla.preventDefault();
            linkEmail.focus();
        }
    }
});
local.addEventListener('change', mostrarOutroLocal);
formulario.addEventListener('submit', salvarFormulario);
formulario.addEventListener('reset', function() {
    erroCampos.classList.add('caixa-oculta');
    erroEvento.classList.add('caixa-oculta');
    avisoArmazenamento.textContent = '';
    setTimeout(mostrarOutroLocal, 0);
});

const partesHoje = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
}).formatToParts(new Date());
let anoHoje = '', mesHoje = '', diaHoje = '';
for (let parte of partesHoje) {
    if (parte.type === 'year') anoHoje = parte.value;
    if (parte.type === 'month') mesHoje = parte.value;
    if (parte.type === 'day') diaHoje = parte.value;
}
data.min = anoHoje + '-' + mesHoje + '-' + diaHoje;
mostrarOutroLocal();
