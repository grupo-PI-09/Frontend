 // Variaveis Globais
    let linhaSendoEditada = null; // memoria
    const modalElemento = document.getElementById("modal-cadastro");
    const btnAbrir = document.getElementById("btnOpenModal");
    const btnFechar = document.getElementById("btn-fechar-modal");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnAddVehicle = document.getElementById("add-vehicle-btn");
    const vehicleContainer = document.getElementById("vehicle-container");
    const tituloModal = document.getElementById("modal-titulo");
    const btnSalvarPrincipal = document.getElementById("btn-salvar-principal");

    // Abrir modal para adicionar novo cliente
    btnAbrir.onclick = function() {
        document.getElementById("form-cadastro").reset();
        tituloModal.innerText = "Cadastro Cliente + Veículo";
        btnSalvarPrincipal.innerText = "Salvar Cadastro";
        modalElemento.style.display = "block";
        linhaSendoEditada = null;
    }

    // Fechar Modal
    btnFechar.onclick = () => modalElemento.style.display = "none";
    btnCancelar.onclick = () => modalElemento.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modalElemento) modalElemento.style.display = "none";
    }

    // Modal preenchido com os dados do cliente
    const botoesVerMais = document.querySelectorAll(".btn-detalhes");
    
    // Preenche o modal
        function preencherModalParaEditar(linha) {
            linhaSendoEditada = linha; // salva na memória

            const nome = linha.cells[0].innerText;
            const email = linha.cells[1].innerText;
            const telefone = linha.cells[2].innerText;
            const veiculoTexto = linha.cells[3].innerText;

            // Validação para não duplicar
            let partes = veiculoTexto.split(" ("); 
            let modeloPuro = partes[0]; 
            let placaPura = "";

            if (partes[1]) {
                placaPura = partes[1].replace(")", ""); 
            }

            // Inseri os dados nos campos do modal
            document.getElementById("modal-nome").value = nome;
            document.getElementById("modal-email").value = email;
            document.getElementById("modal-telefone").value = telefone;
            
            document.getElementById("modal-modelo").value = modeloPuro; 
            document.getElementById("modal-placa").value = placaPura;   

            tituloModal.innerText = "Detalhes / Editar Cliente";
            btnSalvarPrincipal.innerText = "Salvar Alterações";
            modalElemento.style.display = "block";
        }

        // Aplicar a função nos botões ver mais
        document.querySelectorAll(".btn-detalhes").forEach(botao => {
            botao.onclick = function() {
                const linha = botao.closest("tr");
                preencherModalParaEditar(linha);
            };
        });

    // Adicionar outro veículo
    btnAddVehicle.onclick = function() {
        const vehicleCount = vehicleContainer.getElementsByClassName("vehicle-card").length + 1;
        const newVehicleCard = document.createElement("div");
        newVehicleCard.classList.add("vehicle-card");
        
        // Cria outra div com os mesmos campos de veículo
        newVehicleCard.innerHTML = `
            <span class="remove-vehicle-btn">&times;</span>
            <span class="vehicle-badge">Veículo ${vehicleCount}</span>
            <div class="row">
                <div class="input-group"><label>Modelo *</label><input type="text" placeholder="Ex: Civic EXL"></div>
                <div class="input-group"><label>Marca *</label><input type="text" placeholder="Ex: Honda"></div>
            </div>
            <div class="row-triple">
                <div class="input-group"><label>Placa *</label><input type="text" placeholder="ABC-1234"></div>
                <div class="input-group"><label>Ano</label><input type="text" placeholder="2022"></div>
                <div class="input-group"><label>KM atual</label><input type="text" placeholder="45.000"></div>
            </div>
            <div class="input-group full">
                <label>Combustível</label>
                <select>
                    <option value="">Selecione...</option>
                    <option value="flex">Flex</option>
                    <option value="gasolina">Gasolina</option>
                    <option value="diesel">Diesel</option>
                </select>
            </div>
        `;

        // Caso precise excluir um veículo
        newVehicleCard.querySelector('.remove-vehicle-btn').onclick = () => newVehicleCard.remove();

        // adiciona o novo veículo
        vehicleContainer.appendChild(newVehicleCard);
    }

    const formulario = document.getElementById("form-cadastro");

    formulario.onsubmit = function(event) {
    event.preventDefault(); // salva as informações, s/recarregar

    // Coleta os dados informados
    const nome = document.getElementById("modal-nome").value;
    const email = document.getElementById("modal-email").value;
    const telefone = document.getElementById("modal-telefone").value;
    const modelo = document.getElementById("modal-modelo").value;
    const placa = document.getElementById("modal-placa").value;

    // Monta a frase na tabela - campo Veículo
    const veiculoCompleto = `${modelo} (${placa})`;

    // Se tem informações salvas é edição, se esta vazio é um novo cadastro
    if (linhaSendoEditada) {
        linhaSendoEditada.cells[0].innerText = nome;
        linhaSendoEditada.cells[1].innerText = email;
        linhaSendoEditada.cells[2].innerText = telefone;
        linhaSendoEditada.cells[3].innerText = veiculoCompleto;
    } else {
        const tabela = document.getElementById("tableClients").getElementsByTagName('tbody')[0];
        const novaLinha = tabela.insertRow();

        novaLinha.innerHTML = `
            <td>${nome}</td>
            <td>${email}</td>
            <td>${telefone}</td>
            <td>${veiculoCompleto}</td>
            <td>
                <button class="btn-detalhes">Ver mais</button>
                <button class="btn-excluir">Excluir</button>
            </td>
        `;

        // Ao adicionar uma nova linha, adiciona também a função dos botões ver mais e excluir nela
        const novoBotaoVer = novaLinha.querySelector(".btn-detalhes");
        novoBotaoVer.onclick = () => preencherModalParaEditar(novaLinha);

        const novoBotaoExcluir = novaLinha.querySelector(".btn-excluir");
        novoBotaoExcluir.onclick = () => {
            if(confirm("Deseja realmente excluir este cliente?")) novaLinha.remove();
        };
    }

    // Fecha o modal
    modalElemento.style.display = "none";
};

// filtrar por nome
function filterTable() {
    const input = document.getElementById("inputSearch");
    const filtro = input.value.toLowerCase();
    const tabela = document.getElementById("tableClients");
    const tbody = tabela.getElementsByTagName("tbody")[0];
    const linhas = Array.from(tbody.getElementsByTagName("tr"));

    // Aqui mostra a lista por completo se não tem filtro
    if (filtro === "") {
        linhas.forEach(linha => {
            linha.style.display = "";
            linha.cells[0].innerHTML = linha.cells[0].innerText;
        });
        return;
    }

    // Procura os nomes de acordo com o filtro
    linhas.forEach(linha => {
        const nomeOriginal = linha.cells[0].innerText;
        const nomeMinusculo = nomeOriginal.toLowerCase();

        // Se tiver, ele vai colocar no topo da lista e fica grifado
        if (nomeMinusculo.includes(filtro)) {
            linha.style.display = "";
            tbody.prepend(linha);

            const indice = nomeMinusculo.indexOf(filtro);
            const parteAntes = nomeOriginal.substring(0, indice);
            const parteMeio = nomeOriginal.substring(indice, indice + filtro.length);
            const parteDepois = nomeOriginal.substring(indice + filtro.length);
            
            linha.cells[0].innerHTML = `${parteAntes}<span class="highlight">${parteMeio}</span>${parteDepois}`;
        } else {
            // se não encontrar a lista fica vazia
            linha.style.display = "none";
        }
    });
}

// Função de excluir aplicada nos botões
document.querySelectorAll("tr").forEach(linha => {
    const btnExcluir = linha.querySelector(".btn-excluir");
    if (btnExcluir) {
        btnExcluir.onclick = function() {
            if (confirm("Deseja realmente excluir este cliente?")) {
                linha.remove();
            }
        };
    }
});