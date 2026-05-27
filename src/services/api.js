import axios from 'axios'
import { clearAuth, getToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const apiClient = axios.create({
    baseURL: API_BASE_URL
})

function obterMensagemErro(error, authenticated) {
    const status = error.response?.status
    const dados = error.response?.data
    const mensagemBackend = dados?.mensagem || dados?.message
    const detalhes = dados?.detalhes

    if (authenticated && (status === 401 || status === 403)) {
        return 'Sua sessão expirou ou você não tem permissão para acessar esta área. Faça login novamente.'
    }

    if (status === 400) {
        return detalhes
            ? `${mensagemBackend || 'Dados inválidos'}: ${detalhes}`
            : mensagemBackend || 'Dados inválidos. Confira os campos preenchidos.'
    }

    if (status === 401) {
        return mensagemBackend || 'E-mail ou senha inválidos.'
    }

    if (status === 403) {
        return mensagemBackend || 'Acesso negado. Verifique seu login e tente novamente.'
    }

    if (status === 404) {
        return mensagemBackend || 'Registro não encontrado.'
    }

    if (status === 409) {
        return detalhes ? `${mensagemBackend}: ${detalhes}` : mensagemBackend || 'Já existe um registro com estes dados.'
    }

    if (status >= 500) {
        return detalhes
            ? `${mensagemBackend || 'Erro interno no servidor'}: ${detalhes}`
            : mensagemBackend || 'Erro interno no servidor. Tente novamente em instantes.'
    }

    return detalhes
        ? `${mensagemBackend || 'Erro ao processar a requisição'}: ${detalhes}`
        : mensagemBackend || error.message || 'Erro ao processar a requisição.'
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
        if (authenticated && [401, 403].includes(error.response?.status)) {
            clearAuth()
        }

        if (!error.response) {
            throw new Error('Não foi possível conectar ao backend. Verifique se a API Spring está rodando e se o CORS foi liberado.')
        }

        throw new Error(obterMensagemErro(error, authenticated))
    }
}
