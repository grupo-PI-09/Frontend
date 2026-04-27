import { useState } from 'react'
import { FaSearch, FaPencilAlt, FaTrash } from 'react-icons/fa'
import { apiRequest } from '../services/api'
import '../style/cliente.css'

export function Cliente() {
    const [modalOpen, setModalOpen] = useState(false)
    const [placaFeedback, setPlacaFeedback] = useState({ message: '', type: '' })
    const [cadastroFeedback, setCadastroFeedback] = useState({ message: '', type: '' })
    const [consultandoPlaca, setConsultandoPlaca] = useState(false)
    const [ultimaPlacaConsultada, setUltimaPlacaConsultada] = useState('')
    const [formularioVeiculo, setFormularioVeiculo] = useState({
        placa: '',
        modelo: '',
        marca: '',
        ano: '',
        km: '',
        combustivel: ''
    })

    function atualizarCampoVeiculo(campo, valor) {
        setFormularioVeiculo((atual) => ({ ...atual, [campo]: valor }))
    }

    function informarEscopoDaPoc() {
        setCadastroFeedback({
            message: 'Esta POC valida cadastro/login e consulta de placa. A persistência completa de cliente e veículo ainda não foi integrada.',
            type: 'success'
        })
    }

    async function consultarPlaca(placaInformada = formularioVeiculo.placa) {
        const placaNormalizada = placaInformada.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

        if (placaNormalizada.length < 7) {
            setPlacaFeedback({ message: 'Digite uma placa válida para consultar.', type: 'error' })
            setUltimaPlacaConsultada('')
            return
        }

        if (placaNormalizada === ultimaPlacaConsultada && placaFeedback.type === 'success') {
            return
        }

        setConsultandoPlaca(true)
        setPlacaFeedback({ message: '', type: '' })

        try {
            const data = await apiRequest(`/placas/${placaNormalizada}`)
            setFormularioVeiculo((atual) => ({
                ...atual,
                placa: placaNormalizada,
                modelo: data.modelo || '',
                marca: data.marca || '',
                ano: data.ano || ''
            }))
            setUltimaPlacaConsultada(placaNormalizada)
            setPlacaFeedback({ message: 'Placa consultada com sucesso.', type: 'success' })
        } catch (error) {
            setUltimaPlacaConsultada('')
            setPlacaFeedback({ message: error.message, type: 'error' })
        } finally {
            setConsultandoPlaca(false)
        }
    }

    function aoAlterarPlaca(evento) {
        const valorFormatado = evento.target.value.toUpperCase()
        const placaNormalizada = valorFormatado.replace(/[^a-zA-Z0-9]/g, '')

        setFormularioVeiculo((atual) => ({ ...atual, placa: valorFormatado }))

        if (placaNormalizada.length < 7) {
            setUltimaPlacaConsultada('')
        }

        if (placaNormalizada.length === 7 && placaNormalizada !== ultimaPlacaConsultada) {
            consultarPlaca(valorFormatado)
        }
    }

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
                    <button className="btn-new-client" type="button" aria-label="Adicionar novo cadastro" onClick={() => setModalOpen(true)}>
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

            <div id="modal-cadastro" className="modal" style={{ display: modalOpen ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 id="modal-titulo">Cadastro Cliente + Veículo</h2>
                        <span className="close-modal" aria-label="Fechar modal" onClick={() => setModalOpen(false)}>&times;</span>
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
                                <input id="endereco" type="text" placeholder="Rua, número, bairro - UF" />
                            </div>
                        </div>

                        <div className="column-right">
                            <h3 className="section-title">DADOS DO VEÍCULO</h3>

                            <div id="vehicle-container">
                                <div className="vehicle-card">
                                    <span className="vehicle-badge">Veículo 1</span>

                                    <div className="row">
                                        <div className="input-group">
                                            <label htmlFor="placa">Placa *</label>
                                            <input
                                                id="placa"
                                                type="text"
                                                placeholder="ABC1D23"
                                                aria-required="true"
                                                value={formularioVeiculo.placa}
                                                onChange={aoAlterarPlaca}
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group full">
                                        <button type="button" className="btn-salvar" onClick={() => consultarPlaca()} disabled={consultandoPlaca}>
                                            {consultandoPlaca ? 'Consultando placa...' : 'Consultar placa'}
                                        </button>
                                        <p className={`feedback ${placaFeedback.type}`} aria-live="polite">
                                            {placaFeedback.message}
                                        </p>
                                    </div>

                                    <div className="row">
                                        <div className="input-group">
                                            <label htmlFor="modelo">Modelo *</label>
                                            <input id="modelo" type="text" placeholder="Ex: Civic EXL" aria-required="true" value={formularioVeiculo.modelo} readOnly />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="marca">Marca *</label>
                                            <input id="marca" type="text" placeholder="Ex: Honda" aria-required="true" value={formularioVeiculo.marca} readOnly />
                                        </div>
                                    </div>

                                    <div className="row-triple">
                                        <div className="input-group">
                                            <label htmlFor="ano">Ano</label>
                                            <input id="ano" type="text" placeholder="2022" value={formularioVeiculo.ano} readOnly />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="km">KM atual</label>
                                            <input
                                                id="km"
                                                type="text"
                                                placeholder="45.000"
                                                value={formularioVeiculo.km}
                                                onChange={(e) => atualizarCampoVeiculo('km', e.target.value)}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label htmlFor="combustivel">Combustível</label>
                                            <select
                                                id="combustivel"
                                                aria-label="Selecione o tipo de combustível"
                                                value={formularioVeiculo.combustivel}
                                                onChange={(e) => atualizarCampoVeiculo('combustivel', e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="flex">Flex</option>
                                                <option value="gasolina">Gasolina</option>
                                                <option value="diesel">Diesel</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="button" className="btn-add-more" aria-label="Adicionar outro veículo">
                                + Adicionar outro veículo
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" aria-label="Cancelar cadastro" onClick={() => setModalOpen(false)}>Cancelar</button>
                        <button type="button" className="btn-salvar" aria-label="Salvar cadastro" onClick={informarEscopoDaPoc}>Salvar Cadastro</button>
                    </div>
                    <p className={`feedback ${cadastroFeedback.type}`} aria-live="polite">
                        {cadastroFeedback.message}
                    </p>
                </div>
            </div>
        </main>
    )
}
