import { apiRequest } from './api'
import { listarVeiculos, mapVeiculoApiParaTela } from './veiculoService'

function texto(valor) {
    return String(valor ?? '').trim()
}

function vazioParaNull(valor) {
    const normalizado = texto(valor)
    return normalizado === '' ? null : normalizado
}

function apenasDigitos(valor) {
    return String(valor ?? '').replace(/\D/g, '')
}

export function mapClienteApiParaTela(cliente = {}, veiculos = []) {
    const veiculosTela = veiculos.map(mapVeiculoApiParaTela)

    return {
        ...cliente,
        nomeCompleto: cliente.nome ?? '',
        cpf: cliente.cpf ?? '',
        veiculos: veiculosTela,
        veiculo: veiculosTela.length
            ? veiculosTela.map(veiculo => veiculo.label).join(', ')
            : 'Nenhum veículo cadastrado'
    }
}

export function mapClienteTelaParaApi(dados = {}, endereco = {}) {
    const nome = texto(dados.nome ?? dados.nomeCompleto)
    const cpf = apenasDigitos(dados.cpf)
    const telefone = texto(dados.telefone)
    const email = texto(dados.email).toLowerCase()

    if (!nome) {
        throw new Error('Informe o nome do cliente.')
    }

    if (cpf.length !== 11) {
        throw new Error('Informe um CPF válido com 11 números.')
    }

    if (!telefone) {
        throw new Error('Informe o telefone do cliente.')
    }

    if (!email) {
        throw new Error('Informe o e-mail do cliente.')
    }

    return {
        nome,
        cpf,
        dtNascimento: vazioParaNull(dados.dtNascimento),
        telefone,
        email,
        endereco: vazioParaNull(endereco.endereco),
        cep: vazioParaNull(endereco.cep),
        logradouro: vazioParaNull(endereco.logradouro),
        numero: vazioParaNull(endereco.numero),
        complemento: vazioParaNull(endereco.complemento),
        bairro: vazioParaNull(endereco.bairro),
        cidade: vazioParaNull(endereco.cidade),
        estado: vazioParaNull(endereco.estado)?.toUpperCase() ?? null
    }
}

export async function listarClientes() {
    const clientes = await apiRequest('/clientes')
    return clientes.map(cliente => mapClienteApiParaTela(cliente))
}

export async function listarClientesComVeiculos() {
    const [clientes, veiculos] = await Promise.all([
        apiRequest('/clientes'),
        listarVeiculos()
    ])

    return clientes.map(cliente =>
        mapClienteApiParaTela(
            cliente,
            veiculos.filter(veiculo => Number(veiculo.clienteId) === Number(cliente.id))
        )
    )
}

export function buscarClientePorId(id) {
    return apiRequest(`/clientes/${id}`)
}

export function criarCliente(dados, endereco) {
    return apiRequest('/clientes', {
        method: 'POST',
        data: mapClienteTelaParaApi(dados, endereco)
    })
}

export function atualizarCliente(id, dados, endereco) {
    return apiRequest(`/clientes/${id}`, {
        method: 'PUT',
        data: mapClienteTelaParaApi(dados, endereco)
    })
}

export function excluirCliente(id) {
    return apiRequest(`/clientes/${id}`, { method: 'DELETE' })
}
