const CHAVE_EVENTOS = 'banco_eventos_praca';

const EVENTOS_PADRAO = [
    {
        nome: "Paróquia Santa Mônica",
        tipo: "Festa Junina Comunitária",
        data: "2026-06-15",
        inicio: "18:00",
        termino: "23:00",
        local: "Palco",
        outro: "",
        categoria: "cultural"
    },
    {
        nome: "Comunidade de Bairro",
        tipo: "Tríduo e Celebração de Fé",
        data: "2026-08-12",
        inicio: "19:00",
        termino: "21:00",
        local: "Quadra",
        outro: "",
        categoria: "religioso"
    },
    {
        nome: "Liga de Esportes Uberlândia",
        tipo: "Torneio de Basquete de Rua",
        data: "2026-10-05",
        inicio: "08:00",
        termino: "14:00",
        local: "Quadra",
        outro: "",
        categoria: "esportivo"
    }
];

function normalizarTexto(valor) {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function categoriaDoEvento(tipo) {
    const texto = normalizarTexto(tipo);

    if (/triduo|missa|reza|religio|culto|celebra|quermesse/.test(texto)) {
        return 'religioso';
    }

    if (/basquete|futebol|esport|treino|torneio|corrida|volei/.test(texto)) {
        return 'esportivo';
    }

    return 'cultural';
}

function eventoValido(evento) {
    return evento !== null &&
        typeof evento === 'object' &&
        !Array.isArray(evento);
}

function ehEventoPadrao(evento) {
    if (!eventoValido(evento)) return false;

    return EVENTOS_PADRAO.some(padrao =>
        padrao.nome === evento.nome &&
        padrao.tipo === evento.tipo &&
        padrao.data === evento.data &&
        padrao.inicio === evento.inicio &&
        padrao.termino === evento.termino &&
        padrao.local === evento.local
    );
}

function lerRegistrosSalvos() {
    const conteudo = localStorage.getItem(CHAVE_EVENTOS);

    if (conteudo === null) return [];

    const eventos = JSON.parse(conteudo);

    if (!Array.isArray(eventos)) {
        throw new Error('Formato inválido da agenda salva.');
    }

    return eventos;
}

function lerEventos() {
    const cadastrados = lerRegistrosSalvos()
        .filter(eventoValido)
        .filter(evento => !ehEventoPadrao(evento));

    // Os três exemplos aparecem sempre, sem duplicação.
    return [...EVENTOS_PADRAO, ...cadastrados].map(evento => ({
        ...evento,
        localDescricao:
            evento.localDescricao ||
            (evento.local === 'Outros' ? evento.outro : evento.local) ||
            '',
        categoria: ['cultural', 'religioso', 'esportivo']
            .includes(evento.categoria)
                ? evento.categoria
                : categoriaDoEvento(evento.tipo)
    }));
}

function obterEventos() {
    return lerEventos();
}

function existeConflito(novo, eventos) {
    const localNovo = normalizarTexto(
        novo.localDescricao ||
        (novo.local === 'Outros' ? novo.outro : novo.local)
    );

    return eventos.some(evento => {
        const localExistente = normalizarTexto(
            evento.localDescricao ||
            (evento.local === 'Outros' ? evento.outro : evento.local)
        );

        return evento.data === novo.data &&
            localExistente === localNovo &&
            novo.inicio < evento.termino &&
            novo.termino > evento.inicio;
    });
}

function avisarAtualizacao() {
    window.dispatchEvent(new Event('eventos-atualizados'));
}

function salvarEvento(novoEvento) {
    apagarEventosEncerrados();

    const eventos = lerEventos();

    if (existeConflito(novoEvento, eventos)) {
        throw new Error('Já existe evento nesse local e horário.');
    }

    const localDescricao =
        novoEvento.localDescricao ||
        (novoEvento.local === 'Outros'
            ? novoEvento.outro
            : novoEvento.local);

    const evento = {
        ...novoEvento,
        categoria: categoriaDoEvento(novoEvento.tipo),
        id: globalThis.crypto?.randomUUID?.() ||
            `evento-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        localDescricao,
        outro: novoEvento.local === 'Outros'
            ? localDescricao || ''
            : ''
    };

    // Salva os cadastros; os exemplos permanecem definidos no código.
    const registros = lerRegistrosSalvos();
    registros.push(evento);

    localStorage.setItem(CHAVE_EVENTOS, JSON.stringify(registros));
    avisarAtualizacao();

    return evento;
}

function apagarEventosEncerrados() {
    try {
        const registros = lerRegistrosSalvos();
        const agora = Date.now();

        const ativos = registros.filter(evento => {
            // Mantém os exemplos e registros que não possam ser interpretados.
            if (!eventoValido(evento) || ehEventoPadrao(evento)) {
                return true;
            }

            const termino = new Date(
                `${evento.data}T${evento.termino}:00-03:00`
            ).getTime();

            return !Number.isFinite(termino) || termino > agora;
        });

        if (ativos.length !== registros.length) {
            localStorage.setItem(CHAVE_EVENTOS, JSON.stringify(ativos));
            avisarAtualizacao();
        }
    } catch (erro) {
        console.error('Não foi possível verificar os eventos:', erro);
    }
}

apagarEventosEncerrados();
setInterval(apagarEventosEncerrados, 1000);