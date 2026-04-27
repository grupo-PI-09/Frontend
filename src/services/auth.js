const TOKEN_KEY = 'rrmaxx.auth.token'
const USER_KEY = 'rrmaxx.auth.user'
const LEGACY_TOKEN_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2dhdGV3YXkuYXBpYnJhc2lsLmlvL2FwaS92Mi9hdXRoL2tleWNsb2FrL2V4Y2hhbmdlIiwiaWF0IjoxNzc3MjQzNDkzLCJleHAiOjE4MDg3Nzk0OTMsIm5iZiI6MTc3NzI0MzQ5MywianRpIjoidmM5WmlFOVRJYmlIc0VVUCIsInN1YiI6IjQwNDQyIn0.GNM9TTYfJmlA0BpoGblppGRRULeWrJevMcM-m67nW18'
const LEGACY_USER_KEY = '12345678901234567890123456789012'
const AUTH_UPDATED_EVENT = 'rrmaxx-auth-updated'

function obterItemStorage(chaveAtual, chaveLegada) {
    const valorAtual = localStorage.getItem(chaveAtual)
    if (valorAtual) {
        return valorAtual
    }

    const valorLegado = localStorage.getItem(chaveLegada)
    if (valorLegado) {
        localStorage.setItem(chaveAtual, valorLegado)
        return valorLegado
    }

    return null
}

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
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT))
}

export function getToken() {
    return obterItemStorage(TOKEN_KEY, LEGACY_TOKEN_KEY)
}

export function getUsuario() {
    const raw = obterItemStorage(USER_KEY, LEGACY_USER_KEY)
    return raw ? JSON.parse(raw) : null
}

export function isAuthenticated() {
    return Boolean(getToken())
}

export function getAuthUpdatedEventName() {
    return AUTH_UPDATED_EVENT
}
