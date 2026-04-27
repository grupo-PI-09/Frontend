import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../style/perfil.css'
import { apiRequest } from '../services/api'
import { clearAuth, getUsuario, saveAuth, saveUsuario } from '../services/auth'

export function EditarPerfil() {
    const navigate = useNavigate()
    const [carregandoPerfil, setCarregandoPerfil] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [excluindo, setExcluindo] = useState(false)
    const [feedback, setFeedback] = useState({ message: '', type: '' })
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')

    useEffect(() => {
        async function carregarPerfil() {
            setCarregandoPerfil(true)

            try {
                const usuarioLocal = getUsuario()
                if (usuarioLocal) {
                    setNome(usuarioLocal.nome || '')
                    setEmail(usuarioLocal.email || '')
                }

                const usuarioAtual = await apiRequest('/usuarios/me')
                setNome(usuarioAtual.nome || '')
                setEmail(usuarioAtual.email || '')
                saveUsuario(usuarioAtual)
            } catch (error) {
                setFeedback({ message: error.message, type: 'error' })
            } finally {
                setCarregandoPerfil(false)
            }
        }

        carregarPerfil()
    }, [])

    async function salvarAlteracoes(evento) {
        evento.preventDefault()

        if (!nome.trim() || !email.trim()) {
            setFeedback({ message: 'Informe nome e e-mail.', type: 'error' })
            return
        }

        setSalvando(true)
        setFeedback({ message: 'Salvando alterações...', type: 'success' })

        try {
            const resposta = await apiRequest('/usuarios/me', {
                method: 'PUT',
                data: {
                    nome: nome.trim(),
                    email: email.trim(),
                    senha: senha === '' ? null : senha
                }
            })

            saveAuth(resposta)
            setSenha('')
            setFeedback({ message: 'Perfil atualizado com sucesso.', type: 'success' })
        } catch (error) {
            setFeedback({ message: error.message, type: 'error' })
        } finally {
            setSalvando(false)
        }
    }

    async function excluirConta() {
        const confirmou = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita.')
        if (!confirmou) {
            return
        }

        setExcluindo(true)
        setFeedback({ message: 'Excluindo conta...', type: 'success' })

        try {
            await apiRequest('/usuarios/me', { method: 'DELETE' })
            clearAuth()
            navigate('/login', {
                replace: true,
                state: { mensagemSucesso: 'Conta excluída com sucesso.' }
            })
        } catch (error) {
            setFeedback({ message: error.message, type: 'error' })
            setExcluindo(false)
        }
    }

    return (
        <main id="main-content" className="perfil-content">
            <section className="profile-shell">
                <article className="profile-card">
                    <header>
                        <h1>Editar Perfil</h1>
                        <p>Atualize seus dados de acesso ou exclua a conta atual.</p>
                    </header>

                    <form className="profile-form" noValidate onSubmit={salvarAlteracoes}>
                        <div className="profile-field">
                            <label htmlFor="profile-name">Nome</label>
                            <input
                                id="profile-name"
                                name="name"
                                type="text"
                                required
                                value={nome}
                                onChange={(evento) => setNome(evento.target.value)}
                                disabled={carregandoPerfil || salvando || excluindo}
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-email">E-mail</label>
                            <input
                                id="profile-email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(evento) => setEmail(evento.target.value)}
                                disabled={carregandoPerfil || salvando || excluindo}
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-password">Nova senha</label>
                            <input
                                id="profile-password"
                                name="password"
                                type="password"
                                value={senha}
                                onChange={(evento) => setSenha(evento.target.value)}
                                placeholder="Deixe em branco para manter a senha atual"
                                disabled={carregandoPerfil || salvando || excluindo}
                            />
                        </div>

                        <div className="profile-actions">
                            <button className="profile-button primary" type="submit" disabled={carregandoPerfil || salvando || excluindo}>
                                {salvando ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <button className="profile-button danger" type="button" disabled={carregandoPerfil || salvando || excluindo} onClick={excluirConta}>
                                {excluindo ? 'Excluindo...' : 'Excluir Conta'}
                            </button>
                        </div>
                    </form>

                    <p className={`profile-feedback ${feedback.type}`} aria-live="polite">
                        {carregandoPerfil ? 'Carregando perfil...' : feedback.message}
                    </p>
                </article>
            </section>
        </main>
    )
}
