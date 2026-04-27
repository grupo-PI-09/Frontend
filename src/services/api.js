import axios from 'axios'
import { clearAuth, getToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const apiClient = axios.create({
    baseURL: API_BASE_URL
})

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
        if (error.response?.status === 401) {
            clearAuth()
        }

        if (!error.response) {
            throw new Error('Nao foi possivel conectar ao backend. Verifique se a API Spring esta rodando e se o CORS foi liberado.')
        }

        throw new Error(
            error.response?.data?.mensagem ||
            error.response?.data?.message ||
            error.message ||
            'Erro ao processar a requisição'
        )
    }
}
