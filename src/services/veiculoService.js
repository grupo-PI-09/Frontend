import { apiRequest } from './api'

export const TIPOS_COMBUSTIVEL = ['gasolina', 'etanol', 'flex', 'diesel']

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
    return {
        ...veiculo,
        km: veiculo.quilometragem ?? '',
        combustivel: veiculo.tipoCombustivel ?? '',
        label: `${veiculo.modelo ?? 'Veículo'}${veiculo.placa ? ` (${veiculo.placa})` : ''}`
    }
}

export function mapVeiculoTelaParaApi(veiculo = {}, clienteId) {
    const placa = normalizarPlaca(veiculo.placa)
    const modelo = String(veiculo.modelo ?? '').trim()
    const marca = String(veiculo.marca ?? '').trim()
    const tipoCombustivel = String(veiculo.tipoCombustivel ?? veiculo.combustivel ?? '').trim().toLowerCase()

    if (!placa || placa.length < 7) {
        throw new Error('Informe uma placa válida para o veículo.')
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

    return {
        placa,
        modelo,
        marca,
        ano: numeroObrigatorio(veiculo.ano, 'Ano'),
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

    for (const veiculo of veiculosRemovidos) {
        await excluirVeiculo(veiculo.id)
    }

    return salvos
}
