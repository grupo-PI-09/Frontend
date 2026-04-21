import { useState } from 'react';
import '../style/style.css';
import Logo from '../assets/Logo.png';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
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
                        <form onSubmit={handleSubmit} noValidate>
                            <label htmlFor="login-email">E-mail:</label>
                            <input id="login-email" name="email" type="email" required />

                            <label htmlFor="login-password">Senha:</label>
                            <input id="login-password" name="password" type="password" required />

                            <button className="primary-button" type="submit">Entrar</button>
                        </form>
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