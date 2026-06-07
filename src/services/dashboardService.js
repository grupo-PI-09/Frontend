import { apiRequest } from './api'
import { formatarStatusOrdem } from './ordemServicoService'

function numero(valor) {
    const normalizado = Number(valor)
    return Number.isFinite(normalizado) ? normalizado : 0
}

function moeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(numero(valor))
}

function formatarData(data) {
    if (!data) {
        return 'Sem dados'
    }

    return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}

function mapOrdemDashboard(ordem = {}) {
    return {
        id: ordem.id,
        cliente: ordem.cliente || 'Sem cliente',
        veiculo: ordem.veiculo || ordem.placaVeiculo || 'Sem veículo',
        status: formatarStatusOrdem(ordem.status),
        statusBackend: ordem.status,
        data: formatarData(ordem.data),
        dataProximaRevisao: formatarData(ordem.dataProximaRevisao),
        valorTotal: moeda(ordem.valorTotal)
    }
}

export function formatarMoedaDashboard(valor) {
    return moeda(valor)
}

export async function buscarResumoDashboard() {
    const resumo = await apiRequest('/dashboard/resumo')

    return {
        ...resumo,
        totalClientes: numero(resumo.totalClientes),
        totalVeiculos: numero(resumo.totalVeiculos),
        totalOrdensServico: numero(resumo.totalOrdensServico),
        totalOrdensAbertasEmAndamento: numero(resumo.totalOrdensAbertasEmAndamento),
        totalOrdensFinalizadas: numero(resumo.totalOrdensFinalizadas),
        ordensFinalizadasMes: numero(resumo.ordensFinalizadasMes),
        novosClientesMes: numero(resumo.novosClientesMes),
        proximasRevisoes: numero(resumo.proximasRevisoes),
        notificacoesEnviadas: numero(resumo.notificacoesEnviadas),
        faturamentoTotal: numero(resumo.faturamentoTotal),
        faturamentoMes: numero(resumo.faturamentoMes),
        ultimasOrdens: (resumo.ultimasOrdens ?? []).map(mapOrdemDashboard),
        servicosProximosRevisao: (resumo.servicosProximosRevisao ?? []).map(mapOrdemDashboard),
        finalizacoesUltimosMeses: resumo.finalizacoesUltimosMeses ?? [],
        faturamentoUltimosMeses: resumo.faturamentoUltimosMeses ?? [],
        revisoesPreventivasUltimosMeses: resumo.revisoesPreventivasUltimosMeses ?? []
    }
}
