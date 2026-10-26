import { apiRequest } from './api'

export const LIMITE_SERVICO = 150
export const DURACAO_MAXIMA = 8

function doisDigitos(valor) {
    return String(valor).padStart(2, '0')
}

/** Data local no formato do input type="date" (yyyy-mm-dd). */
export function dataIsoLocal(data) {
    return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
}

export function mesmoDia(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function mapAgendamentoApiParaTela(agendamento = {}) {
    // A API devolve LocalDateTime sem fuso ("2026-10-27T08:00:00"), lido como horário local.
    const inicio = new Date(agendamento.dataHora)

    return {
        ...agendamento,
        inicio,
        cliente: agendamento.nomeCliente ?? '',
        veiculo: agendamento.veiculoLabel ?? '',
        tipo: agendamento.tipoServico ?? 'corretiva',
        duracao: agendamento.duracaoHoras ?? 1,
        // A grade da semana tem uma linha por hora cheia
        hora: `${doisDigitos(inicio.getHours())}:00`,
        horario: `${doisDigitos(inicio.getHours())}:${doisDigitos(inicio.getMinutes())}`
    }
}

export function mapAgendamentoTelaParaApi(dados = {}) {
    const servico = String(dados.servico ?? '').trim()
    const duracaoHoras = Number(dados.duracao)

    if (!dados.clienteId) {
        throw new Error('Selecione o cliente.')
    }

    if (!dados.veiculoId) {
        throw new Error('Selecione o veículo.')
    }

    if (!dados.data || !dados.hora) {
        throw new Error('Informe a data e o horário.')
    }

    const dataHora = `${dados.data}T${dados.hora}:00`
    if (new Date(dataHora) < new Date()) {
        throw new Error('Escolha uma data e um horário que ainda não passaram.')
    }

    if (!servico) {
        throw new Error('Informe o serviço.')
    }

    if (servico.length > LIMITE_SERVICO) {
        throw new Error(`O serviço pode ter no máximo ${LIMITE_SERVICO} caracteres.`)
    }

    if (!Number.isInteger(duracaoHoras) || duracaoHoras < 1 || duracaoHoras > DURACAO_MAXIMA) {
        throw new Error(`A duração deve ser de 1 a ${DURACAO_MAXIMA} horas.`)
    }

    return {
        clienteId: Number(dados.clienteId),
        veiculoId: Number(dados.veiculoId),
        dataHora,
        duracaoHoras,
        tipoServico: dados.tipo === 'preventiva' ? 'preventiva' : 'corretiva',
        servico,
        observacoes: String(dados.observacoes ?? '').trim() || null,
        status: dados.status ?? 'agendado'
    }
}

/** Agendamentos ativos (cancelados ficam de fora da agenda), em ordem de data. */
export async function listarAgendamentos() {
    const agendamentos = await apiRequest('/agendamentos')
    return agendamentos
        .filter(agendamento => agendamento.status !== 'cancelado')
        .map(mapAgendamentoApiParaTela)
}

export async function criarAgendamento(dados) {
    return mapAgendamentoApiParaTela(await apiRequest('/agendamentos', {
        method: 'POST',
        data: mapAgendamentoTelaParaApi(dados)
    }))
}

/** Cancela mantendo o registro (status "cancelado") em vez de apagar o histórico. */
export function cancelarAgendamento(agendamento) {
    return apiRequest(`/agendamentos/${agendamento.id}`, {
        method: 'PUT',
        data: {
            clienteId: agendamento.clienteId,
            veiculoId: agendamento.veiculoId,
            usuarioId: agendamento.usuarioId,
            dataHora: agendamento.dataHora,
            duracaoHoras: agendamento.duracaoHoras,
            tipoServico: agendamento.tipoServico,
            servico: agendamento.servico,
            observacoes: agendamento.observacoes,
            status: 'cancelado'
        }
    })
}
