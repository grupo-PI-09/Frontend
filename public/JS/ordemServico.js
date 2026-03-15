const modalOS = document.getElementById("modal-os");
const btnAbrirOS = document.getElementById("btnOpenModal");
const btnFecharOS = document.getElementById("btn-fechar-modal-os");
const btnCancelarOS = document.getElementById("btn-cancelar-os");
const tituloModal = document.getElementById("modal-titulo");
const btnSalvarOS = document.getElementById("btn-salvar-os");
const formularioOS = document.getElementById("form-os");
const feedback = document.getElementById("feedback");
const tabelaBody = document.querySelector("#tableClients tbody");

const API_WORK_ORDERS_URL = "http://localhost:8080/workOrders";
const STORAGE_KEY = "RR_MAXX_WORK_ORDERS";

let ordemSendoEditadaId = null;
let ordensServico = [];

function setFeedback(message, type) {
    if (!feedback) {
        return;
    }

    feedback.textContent = message;
    feedback.className = "feedback";

    if (type) {
        feedback.classList.add(type);
    }
}

function normalizeWorkOrder(workOrder) {
    return {
        id: workOrder.id ?? Date.now(),
        orderNumber: Number(workOrder.orderNumber) || 90001,
        client: String(workOrder.client || "").trim(),
        phone: String(workOrder.phone || "").trim(),
        vehicle: String(workOrder.vehicle || "").trim(),
        entryDate: String(workOrder.entryDate || new Date().toLocaleDateString("pt-BR")).trim(),
        status: String(workOrder.status || "").trim(),
        description: String(workOrder.description || "").trim(),
        parts: String(workOrder.parts || "").trim(),
        notes: String(workOrder.notes || "").trim(),
    };
}

function readWorkOrdersFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return [];
    }

    try {
        const workOrders = JSON.parse(raw);
        return Array.isArray(workOrders) ? workOrders.map(normalizeWorkOrder) : [];
    } catch (error) {
        console.error("Erro ao ler ordens de servico salvas localmente:", error);
        return [];
    }
}

function writeWorkOrdersToStorage(workOrders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workOrders));
}

async function fetchWorkOrdersFromApi() {
    const response = await fetch(API_WORK_ORDERS_URL);

    if (!response.ok) {
        throw new Error("Nao foi possivel carregar as ordens de servico.");
    }

    const workOrders = await response.json();
    return Array.isArray(workOrders) ? workOrders.map(normalizeWorkOrder) : [];
}

async function createWorkOrderInApi(workOrder) {
    const response = await fetch(API_WORK_ORDERS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(workOrder),
    });

    if (!response.ok) {
        throw new Error("Nao foi possivel cadastrar a ordem de servico.");
    }

    return normalizeWorkOrder(await response.json());
}

async function updateWorkOrderInApi(workOrder) {
    const response = await fetch(`${API_WORK_ORDERS_URL}/${workOrder.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(workOrder),
    });

    if (!response.ok) {
        throw new Error("Nao foi possivel atualizar a ordem de servico.");
    }

    return normalizeWorkOrder(await response.json());
}

async function getWorkOrders() {
    try {
        const workOrders = await fetchWorkOrdersFromApi();
        writeWorkOrdersToStorage(workOrders);
        return workOrders;
    } catch (error) {
        console.warn("API indisponivel. Usando armazenamento local.", error);
        return readWorkOrdersFromStorage();
    }
}

function getNextOrderNumber(workOrders) {
    return workOrders.reduce((max, workOrder) => {
        return workOrder.orderNumber > max ? workOrder.orderNumber : max;
    }, 90000) + 1;
}

function getCurrentWorkOrder() {
    return ordensServico.find((item) => item.id === ordemSendoEditadaId) || null;
}

function buildWorkOrderPayload() {
    const currentWorkOrder = getCurrentWorkOrder();

    return normalizeWorkOrder({
        id: currentWorkOrder?.id ?? Date.now(),
        orderNumber: currentWorkOrder?.orderNumber ?? getNextOrderNumber(ordensServico),
        client: document.getElementById("os-cliente").value,
        phone: document.getElementById("os-telefone").value,
        vehicle: document.getElementById("os-veiculo").value,
        entryDate: currentWorkOrder?.entryDate ?? new Date().toLocaleDateString("pt-BR"),
        status: document.getElementById("os-status").value,
        description: document.getElementById("os-descricao").value,
        parts: document.getElementById("os-pecas").value,
        notes: document.getElementById("os-obs").value,
    });
}

function resetModal() {
    formularioOS.reset();
    ordemSendoEditadaId = null;
    tituloModal.innerText = "Nova Ordem de Servico";
    btnSalvarOS.innerText = "Cadastrar OS";
}

function abrirModalNovaOS() {
    resetModal();
    setFeedback("", "");
    modalOS.style.display = "block";
}

function fecharModal() {
    modalOS.style.display = "none";
}

function preencherModalOS(workOrderId) {
    const workOrder = ordensServico.find((item) => item.id === workOrderId);

    if (!workOrder) {
        return;
    }

    ordemSendoEditadaId = workOrder.id;
    document.getElementById("os-cliente").value = workOrder.client;
    document.getElementById("os-telefone").value = workOrder.phone;
    document.getElementById("os-veiculo").value = workOrder.vehicle;
    document.getElementById("os-status").value = workOrder.status;
    document.getElementById("os-descricao").value = workOrder.description;
    document.getElementById("os-pecas").value = workOrder.parts;
    document.getElementById("os-obs").value = workOrder.notes;

    tituloModal.innerText = "Detalhes / Editar Ordem de Servico";
    btnSalvarOS.innerText = "Salvar Alteracoes";
    modalOS.style.display = "block";
}

function renderTable(workOrders = ordensServico) {
    tabelaBody.innerHTML = "";

    workOrders.forEach((workOrder) => {
        const novaLinha = tabelaBody.insertRow();
        novaLinha.dataset.id = String(workOrder.id);
        novaLinha.innerHTML = `
            <td>${workOrder.orderNumber}</td>
            <td>${workOrder.client}</td>
            <td>${workOrder.vehicle}</td>
            <td>${workOrder.entryDate}</td>
            <td>${workOrder.status}</td>
            <td>
                <button class="btn-detalhes" type="button">Ver mais</button>
            </td>
        `;

        novaLinha.querySelector(".btn-detalhes").addEventListener("click", () => {
            preencherModalOS(workOrder.id);
        });
    });
}

async function saveWorkOrder(payload) {
    const isEditing = Boolean(ordemSendoEditadaId);

    if (isEditing) {
        try {
            const updatedWorkOrder = await updateWorkOrderInApi(payload);
            ordensServico = ordensServico.map((item) =>
                item.id === updatedWorkOrder.id ? updatedWorkOrder : item
            );
        } catch (error) {
            ordensServico = ordensServico.map((item) =>
                item.id === payload.id ? payload : item
            );
        }
    } else {
        try {
            const createdWorkOrder = await createWorkOrderInApi(payload);
            ordensServico = [...ordensServico, createdWorkOrder];
        } catch (error) {
            ordensServico = [...ordensServico, payload];
        }
    }

    ordensServico.sort((a, b) => b.orderNumber - a.orderNumber);
    writeWorkOrdersToStorage(ordensServico);
    renderTable();
}

async function carregarOrdensServico() {
    ordensServico = await getWorkOrders();
    ordensServico.sort((a, b) => b.orderNumber - a.orderNumber);
    renderTable();
}

btnAbrirOS.addEventListener("click", abrirModalNovaOS);
btnFecharOS.addEventListener("click", fecharModal);
btnCancelarOS.addEventListener("click", fecharModal);

window.addEventListener("click", (event) => {
    if (event.target === modalOS) {
        fecharModal();
    }
});

formularioOS.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = buildWorkOrderPayload();
    const isEditing = Boolean(ordemSendoEditadaId);

    if (!payload.client || !payload.phone || !payload.vehicle || !payload.status || !payload.description) {
        setFeedback("Preencha todos os campos obrigatorios da ordem de servico.", "error");
        return;
    }

    await saveWorkOrder(payload);
    setFeedback(
        isEditing
            ? "Ordem de servico atualizada com sucesso."
            : "Ordem de servico cadastrada com sucesso.",
        "success"
    );
    fecharModal();
});

function filterTable() {
    const input = document.getElementById("inputSearch");
    const filtro = input.value.trim().toLowerCase();

    if (!filtro) {
        renderTable();
        return;
    }

    const filtradas = ordensServico.filter((workOrder) =>
        workOrder.client.toLowerCase().includes(filtro)
    );

    renderTable(filtradas);

    Array.from(tabelaBody.rows).forEach((linha) => {
        const nomeCelula = linha.cells[1];
        const nomeOriginal = nomeCelula.innerText;
        const nomeMinusculo = nomeOriginal.toLowerCase();
        const indice = nomeMinusculo.indexOf(filtro);

        if (indice >= 0) {
            const parteAntes = nomeOriginal.substring(0, indice);
            const parteMeio = nomeOriginal.substring(indice, indice + filtro.length);
            const parteDepois = nomeOriginal.substring(indice + filtro.length);
            nomeCelula.innerHTML = `${parteAntes}<span class="highlight">${parteMeio}</span>${parteDepois}`;
        }
    });
}

window.filterTable = filterTable;

carregarOrdensServico();
