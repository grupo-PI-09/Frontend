import '../style/perfil.css'

export function EditarPerfil() {
    return (
        <main id="main-content" className="perfil-content">
            <section className="profile-shell">
                <article className="profile-card">
                    <header>
                        <h1>Editar Perfil</h1>
                        <p>Atualize seus dados de acesso ou exclua a conta atual.</p>
                    </header>

                    <form className="profile-form" noValidate>
                        <div className="profile-field">
                            <label htmlFor="profile-name">Nome</label>
                            <input id="profile-name" name="name" type="text" required />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-email">E-mail</label>
                            <input id="profile-email" name="email" type="email" required />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-password">Senha</label>
                            <input id="profile-password" name="password" type="password" required />
                        </div>

                        <div className="profile-actions">
                            <button className="profile-button primary" type="submit">Salvar Alterações</button>
                            <button className="profile-button danger" type="button">Excluir Conta</button>
                        </div>
                    </form>

                    <p className="profile-feedback" aria-live="polite"></p>
                </article>
            </section>
        </main>
    )
}