import { useState } from 'react'
import { FaSearch, FaPencilAlt, FaTrash } from 'react-icons/fa'

const ITENS_POR_PAGINA = 8

export function Cliente() {
    const [busca, setBusca] = useState('')
    const [buscaAtiva, setBuscaAtiva] = useState('')
    const [paginaAtual, setPaginaAtual] = useState(1)

    const clientes = [] // será preenchido pelo back end 

    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(buscaAtiva.toLowerCase())
    )

    const totalPaginas = Math.ceil(clientesFiltrados.length / ITENS_POR_PAGINA)
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    const clientesPagina = clientesFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA)

    function handleBuscar() {
        setBuscaAtiva(busca)
        setPaginaAtual(1)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleBuscar()
    }

    return (
        <main id="main-content" className="cliente-content">
            <div className="container">
                <h1>Gerenciamento de Clientes e Veículos</h1>

                <div className="header-actions">
                    <div className="search-box" style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
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
                                placeholder="Pesquisar cliente por nome"
                                aria-label="Pesquisar cliente por nome"
                                style={{ paddingLeft: '36px' }}
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button
                            className="btn-new-client"
                            type="button"
                            onClick={handleBuscar}
                            aria-label="Pesquisar"
                            style={{ padding: '12px 16px' }}
                        >
                            Pesquisar
                        </button>
                    </div>
                    <button className="btn-new-client" type="button" aria-label="Adicionar novo cadastro">
                        + Novo Cadastro
                    </button>
                </div>

                <table className="client-table" id="tableClients">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Veículo - (Modelo/Placa)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientesPagina.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                    Nenhum cliente encontrado.
                                </td>
                            </tr>
                        ) : (
                            clientesPagina.map((cliente, index) => (
                                <tr key={index}>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.email}</td>
                                    <td>{cliente.telefone}</td>
                                    <td>{cliente.veiculo}</td>
                                    <td>
                                        <button className="btn-detalhes" aria-label={`Editar ${cliente.nome}`}>
                                            <FaPencilAlt />
                                        </button>
                                        <button className="btn-excluir" aria-label={`Excluir ${cliente.nome}`}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {totalPaginas > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '24px'
                    }}>
                        <button
                            onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
                            disabled={paginaAtual === 1}
                            aria-label="Página anterior"
                            style={{
                                padding: '8px 14px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                background: paginaAtual === 1 ? '#eee' : '#fff',
                                cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            ‹
                        </button>

                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                            <button
                                key={pagina}
                                onClick={() => setPaginaAtual(pagina)}
                                aria-label={`Página ${pagina}`}
                                aria-current={paginaAtual === pagina ? 'page' : undefined}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid #ccc',
                                    background: paginaAtual === pagina ? '#E31B13' : '#fff',
                                    color: paginaAtual === pagina ? '#fff' : '#141D24',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                {pagina}
                            </button>
                        ))}

                        <button
                            onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
                            disabled={paginaAtual === totalPaginas}
                            aria-label="Próxima página"
                            style={{
                                padding: '8px 14px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                background: paginaAtual === totalPaginas ? '#eee' : '#fff',
                                cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>

            <div id="modal-cadastro" className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 id="modal-titulo">Cadastro Cliente + Veículo</h2>
                        <span className="close-modal" aria-label="Fechar modal">&times;</span>
                    </div>

                    <div className="modal-body">
                        <div className="column-left">
                            <h3 className="section-title">DADOS DO CLIENTE</h3>

                            <div className="input-group full">
                                <label htmlFor="nome-completo">Nome Completo *</label>
                                <input id="nome-completo" type="text" placeholder="Ex: João Silva" aria-required="true" />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="cpf">CPF *</label>
                                    <input id="cpf" type="text" placeholder="000.000.000-00" aria-required="true" />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="telefone">Telefone</label>
                                    <input id="telefone" type="text" placeholder="(11) 99999-9999" />
                                </div>
                            </div>

                            <div className="input-group full">
                                <label htmlFor="email">E-mail</label>
                                <input id="email" type="email" placeholder="exemplo@email.com" />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="cep">CEP</label>
                                    <input id="cep" type="text" placeholder="00000-000" />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="complemento">Complemento</label>
                                    <input id="complemento" type="text" placeholder="Apto, bloco..." />
                                </div>
                            </div>

                            <div className="input-group full">
                                <label htmlFor="endereco">Endereço</label>
                                <input id="endereco" type="text" placeholder="Rua, número, bairro — UF" />
                            </div>
                        </div>

                        <div className="column-right">
                            <h3 className="section-title">DADOS DO VEÍCULO</h3>

                            <div id="vehicle-container">
                                <div className="vehicle-card">
                                    <span className="vehicle-badge">Veículo 1</span>

                                    <div className="row">
                                        <div className="input-group">
                                            <label htmlFor="modelo">Modelo *</label>
                                            <input id="modelo" type="text" placeholder="Ex: Civic EXL" aria-required="true" />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="marca">Marca *</label>
                                            <input id="marca" type="text" placeholder="Ex: Honda" aria-required="true" />
                                        </div>
                                    </div>

                                    <div className="row-triple">
                                        <div className="input-group">
                                            <label htmlFor="placa">Placa *</label>
                                            <input id="placa" type="text" placeholder="ABC-1234" aria-required="true" />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="ano">Ano</label>
                                            <input id="ano" type="text" placeholder="2022" />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="km">KM atual</label>
                                            <input id="km" type="text" placeholder="45.000" />
                                        </div>
                                    </div>

                                    <div className="input-group full">
                                        <label htmlFor="combustivel">Combustível</label>
                                        <select id="combustivel" aria-label="Selecione o tipo de combustível">
                                            <option value="">Selecione...</option>
                                            <option value="flex">Flex</option>
                                            <option value="gasolina">Gasolina</option>
                                            <option value="diesel">Diesel</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="button" className="btn-add-more" aria-label="Adicionar outro veículo">
                                + Adicionar outro veículo
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" aria-label="Cancelar cadastro">Cancelar</button>
                        <button type="button" className="btn-salvar" aria-label="Salvar cadastro">Salvar Cadastro</button>
                    </div>
                </div>
            </div>
        </main>
    )
}