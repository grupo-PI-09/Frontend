// Variaveis Globais
let linhaOSendoEditada = null; // memoria
const modalOS = document.getElementById("modal-os");
const btnAbrirOS = document.getElementById("btnOpenModal");
const btnFecharOS = document.getElementById("btn-fechar-modal-os");
const btnCancelarOS = document.getElementById("btn-cancelar-os");
const tituloModal = document.getElementById("modal-titulo");
const btnSalvarOS = document.getElementById("btn-salvar-os");
const formularioOS = document.getElementById("form-os");

// Abrir modal para adicionar nova ordem de serviço
btnAbrirOS.onclick = function() {
    formularioOS.reset();
    tituloModal.innerText = "Nova Ordem de Serviço";
    btnSalvarOS.innerText = "Cadastrar OS";
    linhaOSendoEditada = null; 
    modalOS.style.display = "block";
}

// Fechar Modal
const fecharModal = () => modalOS.style.display = "none";
btnFecharOS.onclick = fecharModal;
btnCancelarOS.onclick = fecharModal;
window.onclick = (event) => {
    if (event.target == modalOS) fecharModal();
}

// Modal preenchido com os dados da ordem de serviço
function preencherModalOS(linha) {
    linhaOSendoEditada = linha; // salva na memória

    const nomeCliente = linha.cells[1].innerText;
    const carro = linha.cells[2].innerText;
    const status = linha.cells[4].innerText;

    // Inseri os dados nos campos do modal
    document.getElementById("os-cliente").value = nomeCliente;
    document.getElementById("os-status").value = status;
    document.getElementById("os-veiculo").value = carro;
    document.getElementById("os-descricao").value = "Reparo solicitado pelo cliente.";

    tituloModal.innerText = "Detalhes / Editar Ordem de Serviço";
    btnSalvarOS.innerText = "Salvar Alterações";
    modalOS.style.display = "block";
}


formularioOS.onsubmit = function(event) {
    event.preventDefault(); // salva as informações, s/recarregar

    // Coleta os dados informados
    const cliente = document.getElementById("os-cliente").value;
    const telefone = document.getElementById("os-telefone").value;
    const veiculoNome = document.getElementById("os-veiculo").value;
    const status = document.getElementById("os-status").value;
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    // Se tem informações salvas é edição, se esta vazio é um novo cadastro
    if (linhaOSendoEditada) {
        linhaOSendoEditada.cells[1].innerText = cliente;
        linhaOSendoEditada.cells[2].innerText = veiculoNome;
        linhaOSendoEditada.cells[4].innerText = status;
    } else {
        const tabelaBody = document.getElementById("tableClients").getElementsByTagName('tbody')[0];
        const todasAsLinhas = Array.from(tabelaBody.querySelectorAll("tr"));
        let maiorNumero = 90000; // Valor inicial caso a tabela esteja vazia

        todasAsLinhas.forEach(linha => {
            const textoOS = linha.cells[0].innerText;
            const numAtual = parseInt(textoOS);
            // Se o número da linha for válido e maior que o atual maiorNumero, atualizamos
            if (!isNaN(numAtual) && numAtual > maiorNumero) {
                maiorNumero = numAtual;
            }
        });

        const numOS = maiorNumero + 1;
        const novaLinha = tabelaBody.insertRow();

        novaLinha.innerHTML = `
            <td>${numOS}</td>
            <td>${cliente}</td>
            <td>${veiculoNome}</td>
            <td>${dataHoje}</td>
            <td>${status}</td>
            <td>
                <button class="btn-detalhes">Ver mais</button>
            </td>
        `;

        // Ao adicionar uma nova linha, adiciona também a função do novo botão
        novaLinha.querySelector(".btn-detalhes").onclick = () => preencherModalOS(novaLinha);
    }

    fecharModal();
};

// Filtrar por nome
function filterTable() {
    const input = document.getElementById("inputSearch");
    const filtro = input.value.toLowerCase();
    const tabela = document.getElementById("tableClients");
    const tbody = tabela.getElementsByTagName("tbody")[0];
    const linhas = Array.from(tbody.getElementsByTagName("tr"));

    // Aqui mostra a lista por completo se não tem filtro
    if (filtro === "") {
        linhas.forEach(l => {
            l.style.display = "";
            l.cells[1].innerHTML = l.cells[1].innerText;
        });
        return;
    }

    // Procura os nomes de acordo com o filtro
    linhas.forEach(linha => {
        const nomeOriginal = linha.cells[1].innerText;
        const nomeMinusculo = nomeOriginal.toLowerCase();

        // Se tiver, ele vai colocar no topo da lista e fica grifado
        if (nomeMinusculo.includes(filtro)) {
            linha.style.display = "";
            tbody.prepend(linha);

            const indice = nomeMinusculo.indexOf(filtro);
            const parteAntes = nomeOriginal.substring(0, indice);
            const parteMeio = nomeOriginal.substring(indice, indice + filtro.length);
            const parteDepois = nomeOriginal.substring(indice + filtro.length);
            linha.cells[1].innerHTML = `${parteAntes}<span class="highlight">${parteMeio}</span>${parteDepois}`;
        } else {
            // se não encontrar a lista fica vazia
            linha.style.display = "none";
        }
    });
}

// Ativa os botões dos que ja estão na lista
document.querySelectorAll(".btn-detalhes").forEach(botao => {
    botao.onclick = function() {
        const linha = botao.closest("tr");
        preencherModalOS(linha);
    };
});