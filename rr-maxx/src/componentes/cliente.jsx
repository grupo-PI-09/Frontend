export function Cliente() {
    return (
        <main id="main-content">
            <div className="container">
                <h1>Gerenciamento de Clientes e Veículos</h1>

                <div className="header-actions">
                    <div className="search-box">
                        <input type="text" id="inputSearch" placeholder="Pesquisar cliente por nome" />
                    </div>
                    <button className="btn-new-client" type="button">
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
                                <button className="btn-detalhes">Ver mais</button>
                                <button className="btn-excluir">Excluir</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Ana Beatriz</td>
                            <td>ana.b@email.com</td>
                            <td>(11) 97777-6666</td>
                            <td>Honda Civic (XYZ-9876)</td>
                            <td>
                                <button className="btn-detalhes">Ver mais</button>
                                <button className="btn-excluir">Excluir</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div id="modal-cadastro" className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 id="modal-titulo">Cadastro Cliente + Veículo</h2>
                        <span className="close-modal">&times;</span>
                    </div>

                    <div className="modal-body">
                        <div className="column-left">
                            <h3 className="section-title">DADOS DO CLIENTE</h3>

                            <div className="input-group full">
                                <label>Nome Completo *</label>
                                <input type="text" placeholder="Ex: João Silva" />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label>CPF *</label>
                                    <input type="text" placeholder="000.000.000-00" />
                                </div>
                                <div className="input-group">
                                    <label>Telefone</label>
                                    <input type="text" placeholder="(11) 99999-9999" />
                                </div>
                            </div>

                            <div className="input-group full">
                                <label>E-mail</label>
                                <input type="email" placeholder="exemplo@email.com" />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label>CEP</label>
                                    <input type="text" placeholder="00000-000" />
                                </div>
                                <div className="input-group">
                                    <label>Complemento</label>
                                    <input type="text" placeholder="Apto, bloco..." />
                                </div>
                            </div>

                            <div className="input-group full">
                                <label>Endereço</label>
                                <input type="text" placeholder="Rua, número, bairro — UF" />
                            </div>
                        </div>

                        <div className="column-right">
                            <h3 className="section-title">DADOS DO VEÍCULO</h3>

                            <div id="vehicle-container">
                                <div className="vehicle-card">
                                    <span className="vehicle-badge">Veículo 1</span>

                                    <div className="row">
                                        <div className="input-group">
                                            <label>Modelo *</label>
                                            <input type="text" placeholder="Ex: Civic EXL" />
                                        </div>
                                        <div className="input-group">
                                            <label>Marca *</label>
                                            <input type="text" placeholder="Ex: Honda" />
                                        </div>
                                    </div>

                                    <div className="row-triple">
                                        <div className="input-group">
                                            <label>Placa *</label>
                                            <input type="text" placeholder="ABC-1234" />
                                        </div>
                                        <div className="input-group">
                                            <label>Ano</label>
                                            <input type="text" placeholder="2022" />
                                        </div>
                                        <div className="input-group">
                                            <label>KM atual</label>
                                            <input type="text" placeholder="45.000" />
                                        </div>
                                    </div>

                                    <div className="input-group full">
                                        <label>Combustível</label>
                                        <select>
                                            <option value="">Selecione...</option>
                                            <option value="flex">Flex</option>
                                            <option value="gasolina">Gasolina</option>
                                            <option value="diesel">Diesel</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="button" className="btn-add-more">
                                + Adicionar outro veículo
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar">Cancelar</button>
                        <button type="button" className="btn-salvar">Salvar Cadastro</button>
                    </div>
                </div>
            </div>
        </main>
    )
}