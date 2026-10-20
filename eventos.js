const camposDoEvento = ['nome', 'tipo', 'data', 'inicio', 'termino', 'local', 'localDescricao'];

function lerEventos() {
    const eventos = [];
    const quantidade = Number(localStorage.getItem('eventos-simples-quantidade')) || 0;

    for (let numero = 0; numero < quantidade; numero++) {
        const evento = {};
        for (let campo of camposDoEvento) {
            evento[campo] = localStorage.getItem('evento-simples-' + numero + '-' + campo) || '';
        }
        eventos.push(evento);
    }
    return eventos;
}

function salvarEvento(evento) {
    const numero = Number(localStorage.getItem('eventos-simples-quantidade')) || 0;
    for (let campo of camposDoEvento) {
        localStorage.setItem('evento-simples-' + numero + '-' + campo, evento[campo]);
    }

    localStorage.setItem('eventos-simples-quantidade', numero + 1);
}

function eventoTerminou(evento) {
    const fim = new Date(evento.data + 'T' + evento.termino + ':00-03:00');
    return Date.now() >= fim.getTime();
}

function compararLocal(local) {
    return local.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

function existeConflito(novoEvento, eventos) {
    for (let evento of eventos) {
        const mesmoDia = evento.data === novoEvento.data;
        const mesmoLocal = compararLocal(evento.localDescricao) === compararLocal(novoEvento.localDescricao);
        const horariosSeCruzam = novoEvento.inicio < evento.termino && novoEvento.termino > evento.inicio;
        if (mesmoDia && mesmoLocal && horariosSeCruzam) {
            return true;
        }
    }
    return false;
}

const formulario = document.getElementById('form-evento');

if (formulario) {
    const nome = document.getElementById('nome');
    const tipo = document.getElementById('tipo');
    const data = document.getElementById('data');
    const inicio = document.getElementById('inicio');
    const termino = document.getElementById('termino');
    const local = document.getElementById('local');
    const outro = document.getElementById('outro');
    const campoOutro = document.getElementById('campo-outro');
    const erro = document.getElementById('form-erro');
    const caixa = document.getElementById('confirmacao');
    const linkEmail = document.getElementById('abrir-email');

    const hoje = new Date();
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(hoje);
    let anoHoje = '', mesHoje = '', diaHoje = '';
    for (let parte of partes) {
        if (parte.type === 'year') anoHoje = parte.value;
        if (parte.type === 'month') mesHoje = parte.value;
        if (parte.type === 'day') diaHoje = parte.value;
    }
    data.min = anoHoje + '-' + mesHoje + '-' + diaHoje;

    function mostrarOutroLocal() {
        const escolheuOutros = local.value === 'Outros';
        campoOutro.hidden = !escolheuOutros;
        outro.disabled = !escolheuOutros;
        outro.required = escolheuOutros;
        if (!escolheuOutros) outro.value = '';
    }
    local.addEventListener('change', mostrarOutroLocal);

    formulario.addEventListener('submit', function(eventoDoFormulario) {
        eventoDoFormulario.preventDefault();
        erro.textContent = '';

        if (termino.value <= inicio.value) {
            erro.textContent = 'O horário de término deve ser depois do início, no mesmo dia.';
            return;
        }
        let localEscolhido = local.value;
        if (local.value === 'Outros') localEscolhido = outro.value.trim();

        const novoEvento = {
            nome: nome.value.trim(),
            tipo: tipo.value.trim(),
            data: data.value,
            inicio: inicio.value,
            termino: termino.value,
            local: local.value,
            localDescricao: localEscolhido
        };

        if (!novoEvento.nome || !novoEvento.tipo || !localEscolhido) {
            erro.textContent = 'Preencha todos os campos com informações válidas.';
            return;
        }

        try {
            const eventosSalvos = lerEventos();
            if (existeConflito(novoEvento, eventosSalvos)) {
                erro.textContent = 'Já existe outro evento nesse dia, horário e local. Escolha outro horário ou local.';
                return;
            }
            salvarEvento(novoEvento);
        } catch (problema) {
            erro.textContent = 'Não foi possível salvar. Verifique se o navegador permite o armazenamento local.';
            return;
        }

        // mailto prepara a mensagem. O usuário conclui o envio no aplicativo de e-mail.
        const mensagem = 'Solicitação de evento na praça\n\n' +
            'Nome: ' + novoEvento.nome + '\n' +
            'Evento: ' + novoEvento.tipo + '\n' +
            'Data: ' + novoEvento.data + '\n' +
            'Início: ' + novoEvento.inicio + '\n' +
            'Término: ' + novoEvento.termino + '\n' +
            'Local: ' + novoEvento.localDescricao;

        linkEmail.href = 'mailto:ouvidoria@uberlandia.mg.gov.br?subject=' +
            encodeURIComponent('Solicitação de evento na praça') + '&body=' + encodeURIComponent(mensagem);
        linkEmail.hidden = false;
        document.getElementById('confirmacao-titulo').textContent = 'Evento salvo neste navegador';
        document.getElementById('confirmacao-texto').textContent = 'Use o botão abaixo para preparar o e-mail e concluir o envio à Prefeitura. O cadastro não confirma autorização.';
        caixa.showModal();
        formulario.reset();
    });

    formulario.addEventListener('reset', function() {
        setTimeout(function() {
            mostrarOutroLocal();
            erro.textContent = '';
        }, 0);
    });
    document.getElementById('fechar-confirmacao').addEventListener('click', function() {
        caixa.close();
    });
    caixa.addEventListener('click', function(clique) {
        const limites = caixa.getBoundingClientRect();
        if (clique.clientX < limites.left || clique.clientX > limites.right ||
            clique.clientY < limites.top || clique.clientY > limites.bottom) {
            caixa.close();
        }
    });
}

const bannerEventos = document.getElementById('carrossel-eventos');
if (bannerEventos) {
    const conteudo = document.getElementById('evento-conteudo');
    const controles = document.getElementById('carrossel-controles');
    const posicao = document.getElementById('evento-posicao');
    const botaoPausa = document.getElementById('evento-pausa');
    let eventosAtivos = [];
    let indiceAtual = 0;
    let pausado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const fotos = {
        Quadra: 'assets/img-banner.jpg',
        Estadio: 'assets/img-banner.jpg',
        Palco: 'assets/img-banner.jpg',
        Outros: 'assets/img-banner.jpg'
    };

    function adicionarTexto(tag, texto) {
        const elemento = document.createElement(tag);
        elemento.textContent = texto;
        conteudo.appendChild(elemento);
    }

    function mostrarEvento() {
        conteudo.replaceChildren();
        controles.hidden = eventosAtivos.length < 2;
        if (eventosAtivos.length === 0) {
            bannerEventos.style.removeProperty('--foto-evento');
            adicionarTexto('h3', 'Vamos movimentar a praça?');
            adicionarTexto('p', 'Nenhum evento em andamento ou futuro.');
            return;
        }
        const evento = eventosAtivos[indiceAtual];
        bannerEventos.style.setProperty('--foto-evento', 'url("' + fotos[evento.local] + '")');
        adicionarTexto('p', 'SOLICITAÇÃO CADASTRADA');
        adicionarTexto('h3', evento.tipo);
        adicionarTexto('p', 'Dia: ' + evento.data.split('-').reverse().join('/'));
        adicionarTexto('p', 'Horário: ' + evento.inicio + ' às ' + evento.termino);
        adicionarTexto('p', 'Local: ' + evento.localDescricao);
        posicao.textContent = (indiceAtual + 1) + ' de ' + eventosAtivos.length;
    }

    function carregarCarrossel() {
        eventosAtivos = [];
        try {
            const eventosSalvos = lerEventos();
            for (let evento of eventosSalvos) {
                if (!eventoTerminou(evento)) eventosAtivos.push(evento);
            }
        } catch (problema) {
            
        }
        if (indiceAtual >= eventosAtivos.length) indiceAtual = 0;
        mostrarEvento();
    }

    function proximoEvento() {
        if (eventosAtivos.length === 0) return;
        indiceAtual++;
        if (indiceAtual >= eventosAtivos.length) indiceAtual = 0;
        mostrarEvento();
    }

    document.getElementById('evento-proximo').addEventListener('click', proximoEvento);
    document.getElementById('evento-anterior').addEventListener('click', function() {
        if (eventosAtivos.length === 0) return;
        indiceAtual--;
        if (indiceAtual < 0) indiceAtual = eventosAtivos.length - 1;
        mostrarEvento();
    });
    function atualizarBotaoPausa() {
        botaoPausa.textContent = 'Pausar';
        if (pausado) botaoPausa.textContent = 'Reproduzir';
    }
    botaoPausa.addEventListener('click', function() {
        pausado = !pausado;
        atualizarBotaoPausa();
    });

    setInterval(function() {
        for (let evento of eventosAtivos) {
            if (eventoTerminou(evento)) {
                carregarCarrossel();
                break;
            }
        }
    }, 1000);

    setInterval(function() {
        const secao = document.getElementById('eventos');
        if (!pausado && !document.hidden && !bannerEventos.matches(':hover') &&
            !secao.contains(document.activeElement)) {
            proximoEvento();
        }
    }, 3000);

    window.addEventListener('storage', carregarCarrossel);
    window.addEventListener('pageshow', carregarCarrossel);
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) carregarCarrossel();
    });
    atualizarBotaoPausa();
    carregarCarrossel();
}
