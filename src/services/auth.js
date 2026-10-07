const TOKEN_KEY = 'rrmaxx.auth.token'
const USER_KEY = 'rrmaxx.auth.user'
const AUTH_UPDATED_EVENT = 'rrmaxx-auth-updated'

export function saveAuth(authResponse) {
    localStorage.setItem(TOKEN_KEY, authResponse.token)
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.usuario))
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT))
}

export function saveUsuario(usuario) {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario))
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT))
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT))
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function getUsuario() {
    const raw = localStorage.getItem(USER_KEY)

    if (!raw) {
        return null
    }

    try {
        return JSON.parse(raw)
    } catch {
        clearAuth()
        return null
    }
}

export function isAuthenticated() {
    return Boolean(getToken())
}

export function getAuthUpdatedEventName() {
    return AUTH_UPDATED_EVENT
}
