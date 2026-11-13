// Banco de dados modelo com categorias integradas para os filtros
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

// Compatibilidade entre o formulário e a agenda da página inicial.
function lerEventos() {
    const conteudo = localStorage.getItem('banco_eventos_praca');
    if (conteudo === null) return EVENTOS_PADRAO.map(evento => ({ ...evento }));
    const eventos = JSON.parse(conteudo);
    if (!Array.isArray(eventos)) throw new Error('Formato inválido da agenda salva.');
    return eventos.filter(evento => evento && typeof evento === 'object');
}
function obterEventos() { return lerEventos(); }
function normalizarTexto(valor) {
    return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
function existeConflito(novo, eventos) {
    const localNovo = normalizarTexto(novo.localDescricao || (novo.local === 'Outros' ? novo.outro : novo.local));
    return eventos.some(evento => evento.data === novo.data &&
        normalizarTexto(evento.localDescricao || (evento.local === 'Outros' ? evento.outro : evento.local)) === localNovo &&
        novo.inicio < evento.termino && novo.termino > evento.inicio);
}
function salvarEvento(novoEvento) {
    const eventos = lerEventos();
    if (existeConflito(novoEvento, eventos)) throw new Error('Já existe evento nesse local e horário.');
    const tipo = normalizarTexto(novoEvento.tipo);
    const categoria = /triduo|missa|reza|religio|culto|celebra|quermesse/.test(tipo) ? 'religioso'
        : /basquete|futebol|esport|treino|torneio|corrida|volei/.test(tipo) ? 'esportivo' : 'cultural';
    const evento = { ...novoEvento, categoria,
        id: globalThis.crypto?.randomUUID?.() || 'evento-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        localDescricao: novoEvento.localDescricao || (novoEvento.local === 'Outros' ? novoEvento.outro : novoEvento.local),
        outro: novoEvento.local === 'Outros' ? (novoEvento.localDescricao || novoEvento.outro || '') : '' };
    eventos.push(evento);
    localStorage.setItem('banco_eventos_praca', JSON.stringify(eventos));
    return evento;
}
