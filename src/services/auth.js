const TOKEN_KEY = 'rrmaxx.auth.token'
const USER_KEY = 'rrmaxx.auth.user'
const LEGACY_TOKEN_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2dhdGV3YXkuYXBpYnJhc2lsLmlvL2FwaS92Mi9hdXRoL2tleWNsb2FrL2V4Y2hhbmdlIiwiaWF0IjoxNzc3MjQzNDkzLCJleHAiOjE4MDg3Nzk0OTMsIm5iZiI6MTc3NzI0MzQ5MywianRpIjoidmM5WmlFOVRJYmlIc0VVUCIsInN1YiI6IjQwNDQyIn0.GNM9TTYfJmlA0BpoGblppGRRULeWrJevMcM-m67nW18'
const LEGACY_USER_KEY = '12345678901234567890123456789012'
const AUTH_UPDATED_EVENT = 'rrmaxx-auth-updated'

function limparChavesLegadas() {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
}

export function saveAuth(authResponse) {
    limparChavesLegadas()
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
    limparChavesLegadas()
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT))
}

export function getToken() {
    limparChavesLegadas()
    return localStorage.getItem(TOKEN_KEY)
}

export function getUsuario() {
    limparChavesLegadas()
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
