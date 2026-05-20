import { useState } from 'react'
import { FaSearch, FaPencilAlt, FaTrash } from 'react-icons/fa'
import axios from 'axios'
import { apiRequest } from '../services/api'
import '../style/cliente.css'

export function Cliente() {
    const [modalOpen, setModalOpen] = useState(false)
    const [busca, setBusca] = useState('')
    const [placaFeedback, setPlacaFeedback] = useState({ message: '', type: '' })
    const [cadastroFeedback, setCadastroFeedback] = useState({ message: '', type: '' })
    const [cepFeedback, setCepFeedback] = useState({ message: '', type: '' })
    const [consultandoPlaca, setConsultandoPlaca] = useState(false)
    const [buscandoCep, setBuscandoCep] = useState(false)
    const [ultimaPlacaConsultada, setUltimaPlacaConsultada] = useState('')
    const [veiculos, setVeiculos] = useState([{ id: 1 }])
    const [paginaAtual, setPaginaAtual] = useState(1)
    const ITENS_POR_PAGINA = 8
    const clientes = []
    const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
    )
    const totalPaginas = Math.ceil(clientesFiltrados.length / ITENS_POR_PAGINA)
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    const clientesPagina = clientesFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA)
    const [formularioEndereco, setFormularioEndereco] = useState({
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: '',
        complemento: '',
        numero: ''
    })
    const [formularioVeiculo, setFormularioVeiculo] = useState({
        placa: '',
        modelo: '',
        marca: '',
        ano: '',
        km: '',
        combustivel: ''
    })

    function adicionarVeiculo() {
        setVeiculos([...veiculos, {
            placa: '', modelo: '', marca: '', ano: '', km: '', combustivel: ''
        }])
    }

    function removerVeiculo(index) {
        setVeiculos(veiculos.filter((_, i) => i !== index))
    }

    function atualizarCampoVeiculo(campo, valor) {
        setFormularioVeiculo((atual) => ({ ...atual, [campo]: valor }))
    }

    function atualizarCampoEndereco(campo, valor) {
        setFormularioEndereco((atual) => ({ ...atual, [campo]: valor }))
    }

    async function buscarEnderecoPorCep(cepInformado = formularioEndereco.cep) {
        const cepNormalizado = cepInformado.replace(/\D/g, '')

        if (!cepNormalizado) {
            setCepFeedback({ message: '', type: '' })
            return
        }

        if (cepNormalizado.length !== 8) {
            setCepFeedback({ message: 'Digite um CEP válido com 8 números.', type: 'error' })
            return
        }

        setBuscandoCep(true)
        setCepFeedback({ message: 'Buscando CEP...', type: 'success' })

        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cepNormalizado}/json/`)

            if (data.erro) {
                setCepFeedback({ message: 'CEP não encontrado.', type: 'error' })
                return
            }

            setFormularioEndereco((atual) => ({
                ...atual,
                cep: cepNormalizado,
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || '',
                complemento: data.complemento || atual.complemento
            }))
            setCepFeedback({ message: 'CEP encontrado.', type: 'success' })
        } catch {
            setCepFeedback({ message: 'Erro ao buscar CEP.', type: 'error' })
        } finally {
            setBuscandoCep(false)
        }
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
                                onKeyDown={e => e.key === 'Enter' && console.log('buscar:', busca)}
                            />
                        </div>
                        <button
                            className="btn-new-client"
                            type="button"
                            onClick={() => console.log('buscar:', busca)}
                            aria-label="Pesquisar"
                            style={{ padding: '12px 16px' }}
                        >
                            Pesquisar
                        </button>
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
                                        <button className="btn-detalhes" aria-label={`Editar ${cliente.nome}`}><FaPencilAlt /></button>
                                        <button className="btn-excluir" aria-label={`Excluir ${cliente.nome}`}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {totalPaginas > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                        <button
                            onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
                            disabled={paginaAtual === 1}
                            style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ccc', background: paginaAtual === 1 ? '#eee' : '#fff', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                        >‹</button>

                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                            <button key={pagina} onClick={() => setPaginaAtual(pagina)}
                                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ccc', background: paginaAtual === pagina ? '#E31B13' : '#fff', color: paginaAtual === pagina ? '#fff' : '#141D24', cursor: 'pointer', fontWeight: '600' }}>
                                {pagina}
                            </button>
                        ))}

                        <button
                            onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
                            disabled={paginaAtual === totalPaginas}
                            style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #ccc', background: paginaAtual === totalPaginas ? '#eee' : '#fff', cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                        >›</button>
                    </div>
                )}
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
                                    <input
                                        id="cep"
                                        type="text"
                                        placeholder="00000-000"
                                        value={formularioEndereco.cep}
                                        onChange={(e) => atualizarCampoEndereco('cep', e.target.value)}
                                        onBlur={(e) => buscarEnderecoPorCep(e.target.value)}
                                        aria-describedby="cep-feedback"
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="numero">Número</label>
                                    <input
                                        id="numero"
                                        type="text"
                                        placeholder="123"
                                        value={formularioEndereco.numero}
                                        onChange={(e) => atualizarCampoEndereco('numero', e.target.value)}
                                    />
                                </div>
                            </div>

                            <p id="cep-feedback" className={`feedback ${cepFeedback.type}`} aria-live="polite">
                                {buscandoCep ? 'Buscando CEP...' : cepFeedback.message}
                            </p>

                            <div className="input-group full">
                                <label htmlFor="logradouro">Logradouro</label>
                                <input
                                    id="logradouro"
                                    type="text"
                                    placeholder="Rua, avenida..."
                                    value={formularioEndereco.logradouro}
                                    onChange={(e) => atualizarCampoEndereco('logradouro', e.target.value)}
                                />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="bairro">Bairro</label>
                                    <input
                                        id="bairro"
                                        type="text"
                                        placeholder="Bairro"
                                        value={formularioEndereco.bairro}
                                        onChange={(e) => atualizarCampoEndereco('bairro', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="cidade">Cidade</label>
                                    <input
                                        id="cidade"
                                        type="text"
                                        placeholder="Cidade"
                                        value={formularioEndereco.cidade}
                                        onChange={(e) => atualizarCampoEndereco('cidade', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="estado">Estado</label>
                                    <input
                                        id="estado"
                                        type="text"
                                        placeholder="UF"
                                        value={formularioEndereco.estado}
                                        onChange={(e) => atualizarCampoEndereco('estado', e.target.value)}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="complemento">Complemento</label>
                                    <input
                                        id="complemento"
                                        type="text"
                                        placeholder="Apto, bloco..."
                                        value={formularioEndereco.complemento}
                                        onChange={(e) => atualizarCampoEndereco('complemento', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="column-right">
                            <h3 className="section-title">DADOS DO VEÍCULO</h3>

                            <div id="vehicle-container">
                                {veiculos.map((veiculo, index) => (
                                    <div className="vehicle-card" key={index}>
                                        <span className="vehicle-badge">Veículo {index + 1}</span>
                                        {veiculos.length > 1 && (
                                            <span className="remove-vehicle-btn" onClick={() => removerVeiculo(index)}>×</span>
                                        )}

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
                                ))}
                            </div>

                            <button type="button" className="btn-add-more" onClick={adicionarVeiculo} aria-label="Adicionar outro veículo">
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
