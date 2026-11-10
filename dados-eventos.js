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

// Inicializa o banco de dados no LocalStorage se estiver vazio
function inicializarBancoDados() {
    if (!localStorage.getItem('banco_eventos_praca')) {
        localStorage.setItem('banco_eventos_praca', JSON.stringify(EVENTOS_PADRAO));
    }
}

// Busca todos os eventos ativos
function obterEventos() {
    inicializarBancoDados();
    return JSON.parse(localStorage.getItem('banco_eventos_praca'));
}

// Salva um novo evento de forma real
function salvarEvento(novoEvento) {
    const eventosAtuais = obterEventos();
    
    // Identifica automaticamente a categoria com base nas palavras-chave do tipo
    const tipoLower = novoEvento.tipo.toLowerCase();
    let categoria = 'cultural'; // Categoria padrão
    if (tipoLower.includes('triduo') || tipoLower.includes('missa') || tipoLower.includes('reza') || tipoLower.includes('religios')) {
        categoria = 'religioso';
    } else if (tipoLower.includes('basquete') || tipoLower.includes('futebol') || tipoLower.includes('esporte') || tipoLower.includes('treino')) {
        categoria = 'esportivo';
    }
    
    novoEvento.categoria = categoria;
    eventosAtuais.push(novoEvento);
    localStorage.setItem('banco_eventos_praca', JSON.stringify(eventosAtuais));
    return true;
}
