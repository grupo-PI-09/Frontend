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

// Limites de tamanho aceitos pela API (usados como maxLength nos inputs).
export const LIMITES_CLIENTE = {
    nome: 50,
    email: 100,
    endereco: 255,
    logradouro: 120,
    numero: 10,
    complemento: 60,
    bairro: 80,
    cidade: 80,
    estado: 2
}

/** A API devolve o telefone só com dígitos; formata para exibição. */
export function formatarTelefone(valor) {
    const digitos = apenasDigitos(valor).slice(0, 11)

    if (digitos.length <= 2) return digitos

    const ddd = digitos.slice(0, 2)

    if (digitos.length <= 6) return `(${ddd}) ${digitos.slice(2)}`
    if (digitos.length <= 10) return `(${ddd}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`

    return `(${ddd}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

function cpfValido(cpf) {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false
    }

    const digitoVerificador = (tamanho) => {
        let soma = 0
        for (let i = 0; i < tamanho; i++) {
            soma += Number(cpf[i]) * (tamanho + 1 - i)
        }
        const resto = (soma * 10) % 11
        return resto === 10 ? 0 : resto
    }

    return digitoVerificador(9) === Number(cpf[9]) && digitoVerificador(10) === Number(cpf[10])
}

function dataNoPassado(data) {
    const hoje = new Date()
    const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
    return String(data) < hojeIso
}

/** Data máxima (ontem) para o input de data de nascimento, que precisa estar no passado. */
export function dataMaximaNascimento() {
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)
    return `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`
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
    const telefone = apenasDigitos(dados.telefone)
    const email = texto(dados.email).toLowerCase()
    const cep = apenasDigitos(endereco.cep)

    if (!nome) {
        throw new Error('Informe o nome do cliente.')
    }

    if (cpf.length !== 11) {
        throw new Error('Informe um CPF válido com 11 números.')
    }

    if (!cpfValido(cpf)) {
        throw new Error('CPF inválido. Confira os números digitados.')
    }

    if (!telefone) {
        throw new Error('Informe o telefone do cliente.')
    }

    if (telefone.length !== 10 && telefone.length !== 11) {
        throw new Error('Informe um telefone com DDD (10 ou 11 números).')
    }

    if (!email) {
        throw new Error('Informe o e-mail do cliente.')
    }

    const dtNascimento = vazioParaNull(dados.dtNascimento)
    if (dtNascimento && !dataNoPassado(dtNascimento)) {
        throw new Error('A data de nascimento precisa estar no passado.')
    }

    const estado = vazioParaNull(endereco.estado)?.toUpperCase() ?? null
    if (estado && !/^[A-Z]{2}$/.test(estado)) {
        throw new Error('Informe o estado como UF com 2 letras (ex.: SP).')
    }

    return {
        nome,
        cpf,
        dtNascimento,
        telefone,
        email,
        endereco: vazioParaNull(endereco.endereco),
        cep: vazioParaNull(cep),
        logradouro: vazioParaNull(endereco.logradouro),
        numero: vazioParaNull(endereco.numero),
        complemento: vazioParaNull(endereco.complemento),
        bairro: vazioParaNull(endereco.bairro),
        cidade: vazioParaNull(endereco.cidade),
        estado
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

/** Alternativa à exclusão quando o cliente tem vínculos (DELETE responde 409). */
export function desativarCliente(cliente) {
    return apiRequest(`/clientes/${cliente.id}`, {
        method: 'PUT',
        data: { ...mapClienteTelaParaApi(cliente, cliente), ativo: false }
    })
}
