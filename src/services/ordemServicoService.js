import { apiRequest } from './api'
import { getUsuario } from './auth'

export const STATUS_ORDEM_SERVICO = [
    { value: 'aberta', label: 'Aberta' },
    { value: 'em_andamento', label: 'Em andamento' },
    { value: 'aguardando_aprovacao', label: 'Aguardando aprovação' },
    { value: 'aguardando_peca', label: 'Aguardando peça' },
    { value: 'finalizada', label: 'Finalizada' },
    { value: 'cancelada', label: 'Cancelada' }
]

function texto(valor) {
    return String(valor ?? '').trim()
}

function decimalOuNull(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return null
    }

    const normalizado = Number(String(valor).replace(',', '.'))
    if (!Number.isFinite(normalizado) || normalizado < 0) {
        throw new Error('Informe um valor monetário válido.')
    }

    return normalizado
}

function numeroInteiroObrigatorio(valor, campo) {
    const numero = Number(String(valor ?? '').replace(/\D/g, ''))
    if (!Number.isFinite(numero) || numero < 0) {
        throw new Error(`${campo} deve ser um número válido.`)
    }

    return numero
}

export function formatarStatusOrdem(status) {
    return STATUS_ORDEM_SERVICO.find(opcao => opcao.value === status)?.label ?? status
}

export function ordemEstaEncerrada(ordem = {}) {
    return ['finalizada', 'cancelada'].includes(ordem.statusBackend ?? ordem.status)
}

function formatarData(data) {
    if (!data) {
        return ''
    }

    return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}

export function mapOrdemApiParaTela(ordem = {}, clientes = [], veiculos = []) {
    const cliente = clientes.find(item => Number(item.id) === Number(ordem.clienteId))
    const veiculo = veiculos.find(item => Number(item.id) === Number(ordem.veiculoId))
    const statusBackend = ordem.status
    const garantia = ordem.observacoes?.match(/Garantia:\s*(.+)/)?.[1] ?? ''
    const proximaRevisao = ordem.observacoes?.match(/Próxima revisão:\s*(.+)/)?.[1] ?? ''

    return {
        ...ordem,
        numero: ordem.id,
        statusBackend,
        status: formatarStatusOrdem(statusBackend),
        encerrada: ordemEstaEncerrada({ statusBackend }),
        nomeCliente: ordem.nomeCliente ?? cliente?.nome ?? '',
        telefone: cliente?.telefone ?? '',
        carro: veiculo?.label ?? ordem.placaVeiculo ?? '',
        dataEntrada: formatarData(ordem.dataAbertura),
        dataEncerramento: formatarData(ordem.dataFechamento),
        descricao: ordem.problemaRelatado ?? '',
        orcamento: ordem.valorEstimado ?? '',
        valorFinal: ordem.valorTotal ?? '',
        km: ordem.quilometragem ?? '',
        garantia,
        proximaRevisao
    }
}

export function mapOrdemTelaParaApi(dados = {}, base = {}) {
    const clienteId = Number(dados.clienteId ?? base.clienteId)
    const veiculoId = Number(dados.veiculoId ?? base.veiculoId)
    const status = texto(dados.status ?? base.statusBackend ?? base.status)
    const problemaRelatado = texto(dados.problemaRelatado ?? dados.descricao ?? base.problemaRelatado)
    const quilometragem = numeroInteiroObrigatorio(dados.quilometragem ?? dados.km ?? base.quilometragem, 'Quilometragem')

    if (!clienteId) {
        throw new Error('Selecione um cliente para a ordem de serviço.')
    }

    if (!veiculoId) {
        throw new Error('Selecione um veículo para a ordem de serviço.')
    }

    if (!STATUS_ORDEM_SERVICO.some(opcao => opcao.value === status)) {
        throw new Error('Selecione um status válido para a ordem de serviço.')
    }

    if (!problemaRelatado) {
        throw new Error('Informe a descrição do serviço.')
    }

    const usuarioLocal = getUsuario()

    return {
        clienteId,
        veiculoId,
        usuarioId: dados.usuarioId ?? base.usuarioId ?? usuarioLocal?.id ?? null,
        status,
        problemaRelatado,
        diagnostico: dados.diagnostico ?? base.diagnostico ?? null,
        quilometragem,
        valorEstimado: decimalOuNull(dados.valorEstimado ?? dados.orcamento ?? base.valorEstimado),
        valorTotal: decimalOuNull(dados.valorTotal ?? base.valorTotal),
        formaPagamento: dados.formaPagamento ?? base.formaPagamento ?? null,
        observacoes: dados.observacoes ?? base.observacoes ?? null,
        dataFechamento: dados.dataFechamento ?? base.dataFechamento ?? null
    }
}

export function listarOrdensServico() {
    return apiRequest('/ordens')
}

export function buscarOrdemServicoPorId(id) {
    return apiRequest(`/ordens/${id}`)
}

export function criarOrdemServico(dados) {
    return apiRequest('/ordens', {
        method: 'POST',
        data: mapOrdemTelaParaApi(dados)
    })
}

export function atualizarOrdemServico(id, dados, ordemBase) {
    return apiRequest(`/ordens/${id}`, {
        method: 'PUT',
        data: mapOrdemTelaParaApi(dados, ordemBase)
    })
}

export function excluirOrdemServico(id) {
    return apiRequest(`/ordens/${id}`, { method: 'DELETE' })
}
