import { apiRequest } from './api'

function numero(valor) {
    const normalizado = Number(valor)
    return Number.isFinite(normalizado) ? normalizado : 0
}

function lista(valores) {
    return Array.isArray(valores) ? valores.map(numero) : []
}

export function formatarMoedaDashboard(valor, opcoes = {}) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        ...opcoes
    }).format(numero(valor))
}

function sinal(valor) {
    return valor > 0 ? '+' : ''
}

/**
 * Monta o texto de comparação do card de faturamento, ex.: "+38% vs set/2025".
 * Sem base de comparação (período anterior zerado) retorna "sem base em set/2025".
 */
export function formatarComparacaoFaturamento(periodo = {}) {
    const variacao = periodo.variacaoPercentual
    const rotuloAnterior = periodo.rotuloPeriodoAnterior ?? 'período anterior'

    if (variacao === null || variacao === undefined) {
        return `sem base em ${rotuloAnterior}`
    }

    return `${sinal(variacao)}${numero(variacao).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% vs ${rotuloAnterior}`
}

function mapPeriodoFaturamento(periodo = {}) {
    return {
        periodo: periodo.periodo ?? '',
        rotulo: periodo.rotulo ?? '',
        valor: numero(periodo.valor),
        rotuloPeriodoAnterior: periodo.rotuloPeriodoAnterior ?? '',
        valorPeriodoAnterior: numero(periodo.valorPeriodoAnterior),
        variacaoPercentual: periodo.variacaoPercentual ?? null,
        comparacao: formatarComparacaoFaturamento(periodo)
    }
}

function mapEvolucao(evolucao = {}) {
    return {
        anoAtual: numero(evolucao.anoAtual),
        anoAnterior: numero(evolucao.anoAnterior),
        meses: evolucao.meses ?? [],
        mensalAnoAtual: lista(evolucao.mensalAnoAtual),
        mensalAnoAnterior: lista(evolucao.mensalAnoAnterior),
        acumuladoAnoAtual: lista(evolucao.acumuladoAnoAtual),
        acumuladoAnoAnterior: lista(evolucao.acumuladoAnoAnterior)
    }
}

/**
 * GET /dashboard/resumo — painel financeiro.
 * Retorna os dados já normalizados para os cards e gráficos da tela.
 */
export async function buscarResumoDashboard() {
    const resumo = await apiRequest('/dashboard/resumo')
    const faturamento = resumo.faturamento ?? {}
    const servicosPorTipo = resumo.servicosPorTipo ?? {}

    return {
        faturamento: {
            mensal: mapPeriodoFaturamento(faturamento.mensal),
            semestral: mapPeriodoFaturamento(faturamento.semestral),
            anual: mapPeriodoFaturamento(faturamento.anual)
        },
        totalClientes: numero(resumo.totalClientes),
        novosClientesMes: numero(resumo.novosClientesMes),
        faturamentoMensalComparativo: (resumo.faturamentoMensalComparativo ?? []).map(ponto => ({
            label: ponto.label ?? '',
            valor: numero(ponto.valor)
        })),
        evolucaoFaturamento: mapEvolucao(resumo.evolucaoFaturamento),
        servicosPorTipo: {
            periodo: servicosPorTipo.periodo ?? '',
            tipos: (servicosPorTipo.tipos ?? []).map(tipo => ({
                tipo: tipo.tipo ?? '',
                label: tipo.label ?? '',
                esperado: numero(tipo.esperado),
                realizado: numero(tipo.realizado)
            }))
        }
    }
}
