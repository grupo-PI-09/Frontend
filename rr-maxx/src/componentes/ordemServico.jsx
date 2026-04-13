export function OrdemServico() {
    return (
        <main id="main-content">
            <div className="container">
                <h1>Gerenciamento de Servicos</h1>

                <div className="header-actions">
                    <div className="search-box">
                        <input type="text" id="inputSearch" placeholder="Pesquisar por nome do cliente" />
                    </div>
                    <button className="btn-new-client" type="button">
                        + Nova Ordem de Servico
                    </button>
                </div>

                <p className="feedback" id="feedback" aria-live="polite"></p>

                <table className="client-table" id="tableClients">
                    <thead>
                        <tr>
                            <th>Nº OS</th>
                            <th>Nome Cliente</th>
                            <th>Carro</th>
                            <th>Data de entrada</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </main>
    )
}