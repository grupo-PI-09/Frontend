import { apiRequest } from './api'

export const TIPOS_SERVICO = {
    preventiva: 'Preventiva',
    corretiva: 'Corretiva'
}

export const TIPOS_NOTIFICACAO = {
    pos_servico: 'Pós-serviço',
    aniversario: 'Aniversário',
    oferta: 'Oferta',
    revisao_preventiva: 'Revisão preventiva',
    status_os: 'Status da OS',
    retorno: 'Retorno'
}

/**
 * Paginação por cursor no backend. A resposta é { content, nextPage, hasNext }:
 * `nextPage` é o cursor da página seguinte (null na última) e deve ser reenviado
 * em `cursor`. Filtros em branco ou 'todos' não são enviados.
 */
export function listarNotificacoesPaginado({ cursor, tamanho = 8, lida, tipoServico, statusOs, dataInicio, dataFim } = {}) {
    const semFiltro = valor => (valor === '' || valor === 'todos' ? undefined : valor)

    return apiRequest('/notificacoes/paginado', {
        params: {
            size: tamanho,
            cursor: cursor || undefined,
            lida,
            tipoServico: semFiltro(tipoServico),
            statusOs: semFiltro(statusOs),
            dataInicio: semFiltro(dataInicio),
            dataFim: semFiltro(dataFim)
        }
    })
}

export function marcarNotificacaoComoLida(id, lida = true) {
    return apiRequest(`/notificacoes/${id}/lida`, { method: 'PUT', params: { lida } })
}

export function reenviarNotificacao(id) {
    return apiRequest(`/notificacoes/${id}/reenviar`, { method: 'POST' })
}

function formatarData(data) {
    return data ? new Intl.DateTimeFormat('pt-BR').format(new Date(data)) : ''
}

export function mapNotificacaoApiParaTela(notificacao = {}) {
    return {
        ...notificacao,
        enviadaEm: formatarData(notificacao.dataEnvio ?? notificacao.dataAgendamento ?? notificacao.dataCriacao)
    }
}
