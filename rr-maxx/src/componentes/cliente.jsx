import { FaSearch, FaPencilAlt, FaTrash } from 'react-icons/fa'

export function Cliente() {
    return (
        <main id="main-content" className="cliente-content">
            <div className="container">
                <h1>Gerenciamento de Clientes e Veículos</h1>

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
                            placeholder="Pesquisar cliente por nome"
                            aria-label="Pesquisar cliente por nome"
                            style={{ paddingLeft: '36px' }}
                        />
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
                        <tr>
                            <td>Ricardo Souza</td>
                            <td>ricardo@email.com</td>
                            <td>(11) 98888-7777</td>
                            <td>Toyota Corolla (ABC-1234)</td>
                            <td>
                                <button className="btn-detalhes" aria-label="Ver mais detalhes de Ricardo Souza">
                                    <FaPencilAlt />
                                </button>
                                <button className="btn-excluir" aria-label="Excluir Ricardo Souza">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>Ana Beatriz</td>
                            <td>ana.b@email.com</td>
                            <td>(11) 97777-6666</td>
                            <td>Honda Civic (XYZ-9876)</td>
                            <td>
                                <button className="btn-detalhes" aria-label="Ver mais detalhes de Ana Beatriz">
                                    <FaPencilAlt />
                                </button>
                                <button className="btn-excluir" aria-label="Excluir Ana Beatriz">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
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