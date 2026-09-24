import axios from 'axios'
import { clearAuth, getToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const apiClient = axios.create({
    baseURL: API_BASE_URL
})

/**
 * Erro padronizado da API. Corpo de erro do backend:
 * { erro: true, mensagem: string, detalhes?: string }
 */
export class ApiError extends Error {
    constructor(mensagem, status = null, detalhes = null) {
        super(mensagem)
        this.name = 'ApiError'
        this.status = status
        this.detalhes = detalhes
    }
}

export function isErroApiExterna(error) {
    return [502, 503, 504].includes(error?.status)
}

const MENSAGENS_PADRAO = {
    400: 'Dados inválidos. Confira os campos preenchidos.',
    401: 'Sua sessão expirou. Faça login novamente.',
    403: 'Acesso negado.',
    404: 'Registro não encontrado.',
    409: 'Esta operação conflita com dados já cadastrados.',
    502: 'Serviço externo indisponível no momento. Tente novamente em instantes.',
    503: 'Serviço externo indisponível no momento. Tente novamente em instantes.',
    504: 'O serviço externo demorou para responder. Tente novamente em instantes.'
}

function obterMensagemErro(error, authenticated) {
    const status = error.response?.status
    const dados = error.response?.data
    const mensagemBackend = dados?.mensagem || dados?.message
    const detalhes = dados?.detalhes

    if (status === 401 && authenticated) {
        return MENSAGENS_PADRAO[401]
    }

    if (status === 401) {
        return mensagemBackend || 'E-mail ou senha inválidos.'
    }

    const mensagem = mensagemBackend
        || MENSAGENS_PADRAO[status]
        || (status >= 500 ? 'Erro interno no servidor. Tente novamente em instantes.' : null)
        || error.message
        || 'Erro ao processar a requisição.'

    // Em 400, `detalhes` traz as mensagens de validação separadas por vírgula.
    return status === 400 && detalhes ? `${mensagem}: ${detalhes}` : mensagem
}

export async function apiRequest(path, options = {}, authenticated = true) {
    const headers = {
        ...(options.headers || {})
    }

    if (!headers['Content-Type'] && options.data) {
        headers['Content-Type'] = 'application/json'
    }

    if (authenticated) {
        const token = getToken()
        if (token) {
            headers.Authorization = `Bearer ${token}`
        }
    }

    try {
        const response = await apiClient.request({
            url: path,
            method: options.method || 'GET',
            data: options.data,
            headers
        })

        return response.data
    } catch (error) {
        const status = error.response?.status

        // Só 401 encerra a sessão; demais erros (403, 409, 502...) mantêm o usuário logado.
        if (authenticated && status === 401) {
            clearAuth()
        }

        if (!error.response) {
            throw new ApiError('Não foi possível conectar ao backend. Verifique se a API Spring está rodando e se o CORS foi liberado.')
        }

        throw new ApiError(obterMensagemErro(error, authenticated), status, error.response.data?.detalhes ?? null)
    }
}
