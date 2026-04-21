import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../style/style.css';
import Logo from '../assets/Logo.png';

export function Cadastro() {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;
    }

    return (
        <main className="page-shell">
            <button className="back-button" type="button" aria-label="Voltar" onClick={() => navigate('/index')}>
                <span></span>
            </button>

            <section className="auth-wrapper">
                <header className="brand-block">
                    <img className="brand-logo" src={Logo} alt="Logo RR Maxx" />
                </header>

                <article className="auth-card">
                    <section className="panel is-active">
                        <h1>Cadastro</h1>
                        <form onSubmit={handleSubmit} noValidate>
                            <label htmlFor="register-name">Nome:</label>
                            <input id="register-name" name="name" type="text" required />

                            <label htmlFor="register-email">E-mail:</label>
                            <input id="register-email" name="email" type="email" required />

                            <label htmlFor="register-password">Senha:</label>
                            <input id="register-password" name="password" type="password" required />

                            <button className="primary-button" type="submit">Cadastrar</button>
                        </form>
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