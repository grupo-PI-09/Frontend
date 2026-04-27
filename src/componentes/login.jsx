import { useEffect, useState } from 'react';
import '../style/style.css';
import Logo from '../assets/Logo.png';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { saveAuth } from '../services/auth';

export function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    useEffect(() => {
        if (location.state?.mensagemSucesso) {
            setFeedback({ message: location.state.mensagemSucesso, type: 'success' });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname, location.state, navigate]);

    async function executarLogin() {
        const emailNormalizado = email.trim();

        if (!emailNormalizado || !senha) {
            setFeedback({ message: 'Informe e-mail e senha.', type: 'error' });
            return;
        }

        setLoading(true);
        setFeedback({ message: 'Processando login...', type: 'success' });

        try {
            const resposta = await apiRequest('/auth/login', {
                method: 'POST',
                data: { email: emailNormalizado, senha }
            }, false);

            saveAuth(resposta);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            setFeedback({ message: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="page-shell">
            <button className="back-button" type="button" aria-label="Voltar" onClick={() => navigate(-1)}>
                <span></span>
            </button>

            <section className="auth-wrapper">
                <header className="brand-block">
                    <img className="brand-logo" src={Logo} alt="Logo RR Maxx" />
                </header>

                <article className="auth-card">
                    <section className="panel is-active">
                        <h1>Login</h1>
                        <div style={{ display: 'grid', gap: '18px' }}>
                            <label htmlFor="login-email">E-mail:</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(evento) => setEmail(evento.target.value)}
                            />

                            <label htmlFor="login-password">Senha:</label>
                            <input
                                id="login-password"
                                name="password"
                                type="password"
                                required
                                value={senha}
                                onChange={(evento) => setSenha(evento.target.value)}
                            />

                            <button className="primary-button" type="button" disabled={loading} onClick={() => executarLogin()}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>
                        <p className="helper-link">
                            Ainda não tem conta? <Link to="/cadastro">Cadastrar</Link>
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
