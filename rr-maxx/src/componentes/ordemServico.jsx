import { FaSearch, FaPencilAlt, FaTrash } from 'react-icons/fa'

export function OrdemServico() {
    return (
        <main id="main-content" className="os-content">
            <div className="container">
                <h1>Gerenciamento de Serviços</h1>

                <div className="header-actions">
                    <div className="search-box" style={{ position: 'relative' }}>
                        <FaSearch style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#888',
                            fontSize: '16px'
                        }} />
                        <input
                            type="text"
                            id="inputSearch"
                            placeholder="Pesquisar por nome do cliente"
                            aria-label="Pesquisar ordem de serviço por nome do cliente"
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>
                    <button className="btn-new-client" type="button" aria-label="Adicionar nova ordem de serviço">
                        + Nova Ordem de Serviço
                    </button>
                </div>

                <p className="feedback" id="feedback" aria-live="polite"></p>

                <table className="client-table" id="tableClients" aria-label="Tabela de ordens de serviço">
                    <thead>
                        <tr>
                            <th scope="col">Nº OS</th>
                            <th scope="col">Nome Cliente</th>
                            <th scope="col">Carro</th>
                            <th scope="col">Data de entrada</th>
                            <th scope="col">Status</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>001</td>
                            <td>Ricardo Souza</td>
                            <td>Toyota Corolla (ABC-1234)</td>
                            <td>10/04/2026</td>
                            <td>Em andamento</td>
                            <td>
                                <button className="btn-detalhes" aria-label="Ver mais detalhes da OS 001 de Ricardo Souza">
                                    <FaPencilAlt />
                                </button>
                                <button className="btn-excluir" aria-label="Excluir OS 001 de Ricardo Souza">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>002</td>
                            <td>Ana Beatriz</td>
                            <td>Honda Civic (XYZ-9876)</td>
                            <td>15/04/2026</td>
                            <td>Finalizado</td>
                            <td>
                                <button className="btn-detalhes" aria-label="Ver mais detalhes da OS 002 de Ana Beatriz">
                                    <FaPencilAlt />
                                </button>
                                <button className="btn-excluir" aria-label="Excluir OS 002 de Ana Beatriz">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    )
}