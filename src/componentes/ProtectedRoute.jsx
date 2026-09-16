import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getAuthUpdatedEventName, isAuthenticated } from '../services/auth'

export function ProtectedRoute({ children }) {
    const [autenticado, setAutenticado] = useState(isAuthenticated())

    useEffect(() => {
        function sincronizarAutenticacao() {
            setAutenticado(isAuthenticated())
        }

        const eventoAutenticacao = getAuthUpdatedEventName()
        window.addEventListener(eventoAutenticacao, sincronizarAutenticacao)
        window.addEventListener('storage', sincronizarAutenticacao)

        return () => {
            window.removeEventListener(eventoAutenticacao, sincronizarAutenticacao)
            window.removeEventListener('storage', sincronizarAutenticacao)
        }
    }, [])

    if (!autenticado) {
        return <Navigate to="/login" replace />
    }

    return children
}
