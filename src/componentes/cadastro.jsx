import { useState, useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../style/style.css';
import Logo from '../assets/Logo.png';
import { apiRequest } from '../services/api';
import { clearAuth } from '../services/auth';
import acessibilidade from '../assets/image-acessibility.png'

export function Cadastro() {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [daltonico, setDaltonico] = useState(
        () => localStorage.getItem('daltonico') === 'true'
    )

    function toggleDaltonico() {
        const novo = !daltonico
        setDaltonico(novo)
        localStorage.setItem('daltonico', novo)
        if (novo) {
            document.body.classList.add('daltonico')
        } else {
            document.body.classList.remove('daltonico')
        }
    }

    useEffect(() => {
        if (localStorage.getItem('daltonico') === 'true') {
            document.body.classList.add('daltonico')
        }
    }, [])

    async function executarCadastro() {

        if (!nome || !email || !senha) {
            setFeedback({ message: 'Preencha nome, e-mail e senha.', type: 'error' });
            return;
        }

        setLoading(true);
        setFeedback({ message: 'Processando cadastro...', type: 'success' });

        try {
            await apiRequest('/auth/cadastro', {
                method: 'POST',
                data: { nome, email, senha }
            }, false);

            clearAuth();
            navigate('/login', {
                replace: true,
                state: { mensagemSucesso: 'Cadastro realizado com sucesso. Faça login para continuar.' }
            });
        } catch (error) {
            setFeedback({ message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    if (senha !== confirmarSenha) {
        setFeedback({ message: 'As senhas não coincidem.', type: 'error' });
        return;
    }

    return (
        <main className="page-shell">
            <button
                className={`btn-acessibilidade ${daltonico ? 'ativo' : ''}`}
                onClick={toggleDaltonico}
            >
            <img src={acessibilidade} alt="Acessibilidade" />
            </button>
            <button className="back-button" type="button" aria-label="Voltar" onClick={() => navigate('/login')}>
                <span></span>
            </button>

            <section className="auth-wrapper">
                <header className="brand-block">
                    <img className="brand-logo" src={Logo} alt="Logo RR Maxx" />
                </header>

                <article className="auth-card">
                    <section className="panel is-active">
                        <h1>Cadastro</h1>
                        <div style={{ display: 'grid', gap: '18px' }}>
                            <label htmlFor="register-name">Nome:</label>
                            <input
                                id="register-name"
                                name="name"
                                type="text"
                                required
                                value={nome}
                                onChange={(evento) => setNome(evento.target.value)}
                            />

                            <label htmlFor="register-email">E-mail:</label>
                            <input
                                id="register-email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(evento) => setEmail(evento.target.value)}
                            />

                            <label htmlFor="register-password">Senha:</label>
                            <input
                                id="register-password"
                                name="password"
                                type="password"
                                required
                                value={senha}
                                onChange={(evento) => setSenha(evento.target.value)}
                            />

                            <label htmlFor="register-confirm-password">Confirmar senha:</label>
                            <input
                                id="register-confirm-password"
                                name="confirm-password"
                                type="password"
                                required
                                value={confirmarSenha}
                                onChange={(evento) => setConfirmarSenha(evento.target.value)}
                            />

                            <button className="primary-button" type="button" disabled={loading} onClick={() => executarCadastro()}>
                                {loading ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </div>
                        <p className="helper-link">
                            Já possui conta? <Link to="/login">Entrar</Link>
                        </p>
                    </section>

                    <p className={`feedback ${feedback.type}`} aria-live="polite">
                        {feedback.message}
                    </p>
                </article>
            </section>
        </main>
    );
}
