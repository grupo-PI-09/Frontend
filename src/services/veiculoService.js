import { apiRequest, isErroApiExterna } from './api'

export const TIPOS_COMBUSTIVEL = ['gasolina', 'etanol', 'flex', 'diesel']

export const LIMITES_VEICULO = { modelo: 50, marca: 50, placa: 8 }
export const ANO_MINIMO_VEICULO = 1900
export const ANO_MAXIMO_VEICULO = 2100

// Formato antigo (ABC1234) ou Mercosul (ABC1D23), já sem hífen e em maiúsculas.
const REGEX_PLACA = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/

export function placaValida(placa) {
    return REGEX_PLACA.test(normalizarPlaca(placa))
}

function apenasDigitos(valor) {
    return String(valor ?? '').replace(/\D/g, '')
}

function numeroObrigatorio(valor, campo) {
    const numero = Number(apenasDigitos(valor))
    if (!Number.isFinite(numero) || numero <= 0) {
        throw new Error(`${campo} deve ser um número maior que zero.`)
    }

    return numero
}

export function normalizarPlaca(placa) {
    return String(placa ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

export function mapVeiculoApiParaTela(veiculo = {}) {
    // Registros antigos podem vir com tipoCombustivel, clienteId e nomeCliente nulos.
    const placa = veiculo.placa ? String(veiculo.placa).toUpperCase() : ''

    return {
        ...veiculo,
        placa,
        km: veiculo.quilometragem ?? '',
        combustivel: veiculo.tipoCombustivel ?? '',
        nomeCliente: veiculo.nomeCliente ?? '',
        label: `${veiculo.modelo ?? 'Veículo'}${placa ? ` (${placa})` : ''}`
    }
}

export function mapVeiculoTelaParaApi(veiculo = {}, clienteId) {
    const placa = normalizarPlaca(veiculo.placa)
    const modelo = String(veiculo.modelo ?? '').trim()
    const marca = String(veiculo.marca ?? '').trim()
    const tipoCombustivel = String(veiculo.tipoCombustivel ?? veiculo.combustivel ?? '').trim().toLowerCase()

    if (!REGEX_PLACA.test(placa)) {
        throw new Error('Informe uma placa válida (ABC1234 ou ABC1D23).')
    }

    if (!modelo) {
        throw new Error('Informe o modelo do veículo.')
    }

    if (!marca) {
        throw new Error('Informe a marca do veículo.')
    }

    if (!TIPOS_COMBUSTIVEL.includes(tipoCombustivel)) {
        throw new Error('Informe um tipo de combustível válido.')
    }

    if (!clienteId) {
        throw new Error('Selecione um cliente para vincular o veículo.')
    }

    const ano = numeroObrigatorio(veiculo.ano, 'Ano')
    if (ano < ANO_MINIMO_VEICULO || ano > ANO_MAXIMO_VEICULO) {
        throw new Error(`O ano do veículo deve estar entre ${ANO_MINIMO_VEICULO} e ${ANO_MAXIMO_VEICULO}.`)
    }

    return {
        placa,
        modelo,
        marca,
        ano,
        quilometragem: numeroObrigatorio(veiculo.quilometragem ?? veiculo.km, 'Quilometragem'),
        tipoCombustivel,
        clienteId: Number(clienteId)
    }
}

export async function listarVeiculos() {
    const veiculos = await apiRequest('/veiculos')
    return veiculos.map(mapVeiculoApiParaTela)
}

export async function listarVeiculosPorCliente(clienteId) {
    const veiculos = await apiRequest(`/veiculos/cliente/${clienteId}`)
    return veiculos.map(mapVeiculoApiParaTela)
}

export function buscarVeiculoPorId(id) {
    return apiRequest(`/veiculos/${id}`)
}

export function consultarPlacaBackend(placa) {
    return apiRequest(`/placas/${normalizarPlaca(placa)}`)
}

/**
 * Mensagem para quando a consulta de placa falha. Em 404 (placa não encontrada)
 * ou 502/503/504 (APIBrasil fora do ar) o usuário preenche marca e modelo à mão.
 */
export function mensagemFalhaConsultaPlaca(error) {
    if (error?.status === 404 || isErroApiExterna(error)) {
        return { message: `${error.message} Preencha marca e modelo manualmente.`, type: 'warning' }
    }

    return { message: error?.message ?? 'Erro ao consultar placa.', type: 'error' }
}

export function criarVeiculo(veiculo, clienteId) {
    return apiRequest('/veiculos', {
        method: 'POST',
        data: mapVeiculoTelaParaApi(veiculo, clienteId)
    })
}

export function atualizarVeiculo(id, veiculo, clienteId) {
    return apiRequest(`/veiculos/${id}`, {
        method: 'PUT',
        data: mapVeiculoTelaParaApi(veiculo, clienteId)
    })
}

export function excluirVeiculo(id) {
    return apiRequest(`/veiculos/${id}`, { method: 'DELETE' })
}

/** Alternativa à exclusão quando o veículo tem OSs ou notificações (DELETE responde 409). */
export function desativarVeiculo(veiculo) {
    return apiRequest(`/veiculos/${veiculo.id}`, {
        method: 'PUT',
        data: { ...mapVeiculoTelaParaApi(veiculo, veiculo.clienteId), ativo: false }
    })
}

export async function salvarVeiculosDoCliente(clienteId, veiculosAtuais = [], veiculosOriginais = []) {
    const veiculosValidos = veiculosAtuais.filter(veiculo =>
        veiculo.id ||
        veiculo.placa ||
        veiculo.modelo ||
        veiculo.marca ||
        veiculo.ano ||
        veiculo.km ||
        veiculo.quilometragem ||
        veiculo.combustivel ||
        veiculo.tipoCombustivel
    )

    if (veiculosValidos.length === 0) {
        throw new Error('Informe pelo menos um veículo completo para o cliente.')
    }

    const idsAtuais = new Set(veiculosValidos.map(veiculo => veiculo.id).filter(Boolean))
    const veiculosRemovidos = veiculosOriginais.filter(veiculo => veiculo.id && !idsAtuais.has(veiculo.id))

    const salvos = []
    for (const veiculo of veiculosValidos) {
        const salvo = veiculo.id
            ? await atualizarVeiculo(veiculo.id, veiculo, clienteId)
            : await criarVeiculo(veiculo, clienteId)

        salvos.push(mapVeiculoApiParaTela(salvo))
    }

    // Exclusões bloqueadas por vínculos (409) não interrompem o salvamento;
    // voltam para a tela oferecer a desativação.
    const bloqueados = []
    for (const veiculo of veiculosRemovidos) {
        try {
            await excluirVeiculo(veiculo.id)
        } catch (error) {
            if (error.status !== 409) throw error
            bloqueados.push({ veiculo: { ...veiculo, clienteId: veiculo.clienteId ?? clienteId }, mensagem: error.message })
        }
    }

    return { salvos, bloqueados }
}
