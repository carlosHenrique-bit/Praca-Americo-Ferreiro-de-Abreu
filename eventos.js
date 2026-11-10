let eventosFiltrados = [];
let indiceAtual = 0;
let categoriaAtiva = 'todos';

function carregarCarrossel() {
    const todosEventos = obterEventos();
    
    // Filtra os eventos com base na categoria ativa
    if (categoriaAtiva === 'todos') {
        eventosFiltrados = todosEventos;
    } else {
        eventosFiltrados = todosEventos.filter(ev => ev.categoria === categoriaAtiva);
    }

    const conteudo = document.getElementById('evento-conteudo');
    const posicao = document.getElementById('evento-posicao');
    const containerBanner = document.getElementById('carrossel-eventos');

    if (eventosFiltrados.length === 0) {
        conteudo.innerHTML = `
            <div style="padding: 20px; text-align: center; width: 100%;">
                <span class="evento-tag">AGENDA VAZIA</span>
                <h3>Nenhum evento agendado</h3>
                <p>Não existem eventos cadastrados nesta categoria no momento.</p>
            </div>
        `;
        posicao.textContent = "0/0";
        containerBanner.style.setProperty('--foto-evento', "url('assets/img-banner.jpg')");
        return;
    }

    // Garante que o índice não saia dos limites após a filtragem
    if (indiceAtual >= eventosFiltrados.length) indiceAtual = 0;

    const evento = eventosFiltrados[indiceAtual];
    
    // Altera a foto de fundo do carrossel dinamicamente dependendo do tipo/categoria
    let fotoFundo = "url('assets/img-banner.jpg')";
    if (evento.categoria === 'esportivo') {
        fotoFundo = "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://unsplash.com')";
    } else if (evento.categoria === 'religioso') {
        fotoFundo = "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://unsplash.com')";
    } else {
        fotoFundo = "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://unsplash.com')";
    }
    
    containerBanner.style.setProperty('--foto-evento', fotoFundo);

    // Formata a exibição da data
    const dataFormatada = new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR');

    conteudo.innerHTML = `
        <div>
            <span class="evento-tag">${evento.categoria.toUpperCase()} • DE ${evento.inicio} ÀS ${evento.termino}</span>
            <h3>${evento.tipo}</h3>
            <p><strong>Organizador:</strong> ${evento.nome} <br>
                Tirado no local: <strong>${evento.local === 'Outros' ? evento.outro : evento.local}</strong> em <strong>${dataFormatada}</strong></p>
        </div>
    `;

    posicao.textContent = `${indiceAtual + 1}/${eventosFiltrados.length}`;
}

// Configura os ouvintes dos botões de filtro e navegação
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrossel();

    document.getElementById('evento-anterior').addEventListener('click', () => {
        if (eventosFiltrados.length > 0) {
            indiceAtual = (indiceAtual - 1 + eventosFiltrados.length) % eventosFiltrados.length;
            carregarCarrossel();
        }
    });

    document.getElementById('evento-proximo').addEventListener('click', () => {
        if (eventosFiltrados.length > 0) {
            indiceAtual = (indiceAtual + 1) % eventosFiltrados.length;
            carregarCarrossel();
        }
    });

    // Captura os cliques nos botões de filtro
    const botoesFiltro = document.querySelectorAll('.btn-filtro');
    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', (e) => {
            botoesFiltro.forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');
            categoriaAtiva = e.target.getAttribute('data-categoria');
            indiceAtual = 0;
            carregarCarrossel();
        });
    });
});
