import { useState } from 'react'
import { FaSearch, FaPencilAlt, FaTrash } from 'react-icons/fa'
import axios from 'axios'
import { apiRequest } from '../services/api'
import '../style/cliente.css'

const ITENS_POR_PAGINA = 8

const estadoInicialEndereco = {
    cep: '', logradouro: '', bairro: '', cidade: '',
    estado: '', complemento: '', numero: ''
}

const estadoInicialVeiculo = {
    placa: '', modelo: '', marca: '', ano: '', km: '', combustivel: ''
}

function criarVeiculoVazio(localId = 1) {
    return { ...estadoInicialVeiculo, localId }
}

function prepararVeiculo(veiculo = {}, localId = 1) {
    if (typeof veiculo === 'string') {
        return { ...criarVeiculoVazio(localId), modelo: veiculo }
    }

    return { ...estadoInicialVeiculo, ...veiculo, localId: veiculo.localId ?? localId }
}

function proximoLocalId(lista) {
    return lista.reduce((maiorId, veiculo) => Math.max(maiorId, Number(veiculo.localId) || 0), 0) + 1
}

// Fica fora de Cliente para o React preservar os inputs entre re-renderizações.
function BlocoVeiculos({
    lista,
    onAtualizar,
    onAdicionar,
    onRemover,
    consultaPlaca = false,
    onConsultarPlaca,
    consultandoPlacaId = null,
    placaFeedback = { message: '', type: '', veiculoLocalId: null }
}) {
    return (
        <div>
            {lista.map((veiculo, index) => {
                const consultandoEsteVeiculo = consultandoPlacaId === veiculo.localId
                const feedbackDesteVeiculo = placaFeedback.veiculoLocalId === veiculo.localId

                return (
                    <div className="vehicle-card" key={veiculo.localId ?? veiculo.id ?? index}>
                        <span className="vehicle-badge">Veículo {index + 1}</span>
                        {lista.length > 1 && (
                            <span className="remove-vehicle-btn" onClick={() => onRemover(index)}>×</span>
                        )}

                        <div className="row">
                            <div className="input-group">
                                <label>Placa *</label>
                                <input type="text" placeholder="ABC1D23"
                                    value={veiculo.placa ?? ''}
                                    onChange={e => onAtualizar(index, 'placa', e.target.value.toUpperCase())}
                                    aria-required="true" />
                            </div>
                        </div>

                        {consultaPlaca && (
                            <div className="input-group full">
                                <button type="button" className="btn-salvar"
                                    onClick={() => onConsultarPlaca(index, veiculo.placa ?? '')}
                                    disabled={consultandoPlacaId !== null}>
                                    {consultandoEsteVeiculo ? 'Consultando placa...' : 'Consultar placa'}
                                </button>
                                <p className={`feedback ${feedbackDesteVeiculo ? placaFeedback.type : ''}`} aria-live="polite">
                                    {feedbackDesteVeiculo ? placaFeedback.message : ''}
                                </p>
                            </div>
                        )}

                        <div className="row">
                            <div className="input-group">
                                <label>Modelo *</label>
                                <input type="text" placeholder="Ex: Civic EXL"
                                    value={veiculo.modelo ?? ''}
                                    onChange={e => onAtualizar(index, 'modelo', e.target.value)}
                                    aria-required="true" />
                            </div>
                            <div className="input-group">
                                <label>Marca *</label>
                                <input type="text" placeholder="Ex: Honda"
                                    value={veiculo.marca ?? ''}
                                    onChange={e => onAtualizar(index, 'marca', e.target.value)}
                                    aria-required="true" />
                            </div>
                        </div>

                        <div className="row-triple">
                            <div className="input-group">
                                <label>Ano</label>
                                <input type="text" placeholder="2022"
                                    value={veiculo.ano ?? ''}
                                    onChange={e => onAtualizar(index, 'ano', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>KM atual</label>
                                <input type="text" placeholder="45.000"
                                    value={veiculo.km ?? ''}
                                    onChange={e => onAtualizar(index, 'km', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Combustível</label>
                                <select value={veiculo.combustivel ?? ''}
                                    onChange={e => onAtualizar(index, 'combustivel', e.target.value)}>
                                    <option value="">Selecione...</option>
                                    <option value="flex">Flex</option>
                                    <option value="gasolina">Gasolina</option>
                                    <option value="diesel">Diesel</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )
            })}
            <button type="button" className="btn-add-more" onClick={onAdicionar}>
                + Adicionar outro veículo
            </button>
        </div>
    )
}

export function Cliente() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalEditarOpen, setModalEditarOpen] = useState(false)
    const [modalExcluirOpen, setModalExcluirOpen] = useState(false)
    const [busca, setBusca] = useState('')
    const [paginaAtual, setPaginaAtual] = useState(1)
    const [clientes] = useState([])

    // ── Cadastro ──
    const [placaFeedback, setPlacaFeedback] = useState({ message: '', type: '', veiculoLocalId: null })
    const [cadastroFeedback, setCadastroFeedback] = useState({ message: '', type: '' })
    const [cepFeedback, setCepFeedback] = useState({ message: '', type: '' })
    const [consultandoPlacaId, setConsultandoPlacaId] = useState(null)
    const [buscandoCep, setBuscandoCep] = useState(false)
    const [ultimasPlacasConsultadas, setUltimasPlacasConsultadas] = useState({})
    const [veiculos, setVeiculos] = useState([criarVeiculoVazio()])
    const [formularioEndereco, setFormularioEndereco] = useState(estadoInicialEndereco)

    // ── Edição ──
    const [clienteEditando, setClienteEditando] = useState(null)
    const [clienteExcluindo, setClienteExcluindo] = useState(null)
    const [formularioEdicao, setFormularioEdicao] = useState({
        nomeCompleto: '', cpf: '', telefone: '', email: ''
    })
    const [formularioEnderecoEdicao, setFormularioEnderecoEdicao] = useState(estadoInicialEndereco)
    const [veiculosEdicao, setVeiculosEdicao] = useState([])
    const [cepFeedbackEdicao, setCepFeedbackEdicao] = useState({ message: '', type: '' })
    const [buscandoCepEdicao, setBuscandoCepEdicao] = useState(false)

    // ── Paginação ──
    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase())
    )
    const totalPaginas = Math.ceil(clientesFiltrados.length / ITENS_POR_PAGINA)
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    const clientesPagina = clientesFiltrados.slice(inicio, inicio + ITENS_POR_PAGINA)

    // ── Funções cadastro ──
    function abrirModal() {
        setFormularioEndereco(estadoInicialEndereco)
        setVeiculos([criarVeiculoVazio()])
        setPlacaFeedback({ message: '', type: '', veiculoLocalId: null })
        setCepFeedback({ message: '', type: '' })
        setCadastroFeedback({ message: '', type: '' })
        setUltimasPlacasConsultadas({})
        setConsultandoPlacaId(null)
        setModalOpen(true)
    }

    function fecharModal() {
        setModalOpen(false)
    }

    function adicionarVeiculo() {
        setVeiculos(vs => [...vs, criarVeiculoVazio(proximoLocalId(vs))])
    }

    function removerVeiculo(index) {
        const veiculoRemovido = veiculos[index]
        setVeiculos(vs => vs.filter((_, i) => i !== index))

        if (veiculoRemovido?.localId) {
            setUltimasPlacasConsultadas(placas => {
                const restante = { ...placas }
                delete restante[veiculoRemovido.localId]
                return restante
            })
            setPlacaFeedback(feedback =>
                feedback.veiculoLocalId === veiculoRemovido.localId
                    ? { message: '', type: '', veiculoLocalId: null }
                    : feedback
            )
        }
    }

    function atualizarCampoVeiculo(index, campo, valor) {
        const veiculoAtual = veiculos[index]

        if (campo === 'placa' && veiculoAtual?.localId) {
            const placaNormalizada = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

            setUltimasPlacasConsultadas(placas => {
                if (!placas[veiculoAtual.localId] || placas[veiculoAtual.localId] === placaNormalizada) return placas

                const restante = { ...placas }
                delete restante[veiculoAtual.localId]
                return restante
            })
            setPlacaFeedback(feedback =>
                feedback.veiculoLocalId === veiculoAtual.localId
                    ? { message: '', type: '', veiculoLocalId: null }
                    : feedback
            )
        }

        setVeiculos(vs => vs.map((veiculo, i) =>
            i === index ? { ...veiculo, [campo]: valor } : veiculo
        ))
    }

    function atualizarCampoEndereco(campo, valor) {
        setFormularioEndereco(f => ({ ...f, [campo]: valor }))
    }

    async function buscarEnderecoPorCep(cepInformado = formularioEndereco.cep) {
        const cepNormalizado = cepInformado.replace(/\D/g, '')
        if (!cepNormalizado) { setCepFeedback({ message: '', type: '' }); return }
        if (cepNormalizado.length !== 8) {
            setCepFeedback({ message: 'Digite um CEP válido com 8 números.', type: 'error' }); return
        }
        setBuscandoCep(true)
        setCepFeedback({ message: 'Buscando CEP...', type: 'success' })
        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cepNormalizado}/json/`)
            if (data.erro) { setCepFeedback({ message: 'CEP não encontrado.', type: 'error' }); return }
            setFormularioEndereco(f => ({
                ...f,
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || '',
                complemento: data.complemento || f.complemento
            }))
            setCepFeedback({ message: 'CEP encontrado.', type: 'success' })
        } catch {
            setCepFeedback({ message: 'Erro ao buscar CEP.', type: 'error' })
        } finally {
            setBuscandoCep(false)
        }
    }

    async function consultarPlaca(index, placaInformada) {
        const veiculoAtual = veiculos[index]
        if (!veiculoAtual) return

        const placaNormalizada = placaInformada.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
        if (placaNormalizada.length < 7) {
            setPlacaFeedback({ message: 'Digite uma placa válida para consultar.', type: 'error', veiculoLocalId: veiculoAtual.localId })
            setUltimasPlacasConsultadas(placas => {
                const restante = { ...placas }
                delete restante[veiculoAtual.localId]
                return restante
            })
            return
        }
        if (
            ultimasPlacasConsultadas[veiculoAtual.localId] === placaNormalizada &&
            placaFeedback.veiculoLocalId === veiculoAtual.localId &&
            placaFeedback.type === 'success'
        ) return

        setConsultandoPlacaId(veiculoAtual.localId)
        setPlacaFeedback({ message: '', type: '', veiculoLocalId: veiculoAtual.localId })
        try {
            const data = await apiRequest(`/placas/${placaNormalizada}`)

            setVeiculos(vs => vs.map(veiculo => {
                if (veiculo.localId !== veiculoAtual.localId) return veiculo

                return {
                    ...veiculo,
                    placa: placaNormalizada,
                    modelo: data.modelo || '',
                    marca: data.marca || '',
                    ano: data.ano || ''
                }
            }))
            setUltimasPlacasConsultadas(placas => ({ ...placas, [veiculoAtual.localId]: placaNormalizada }))
            setPlacaFeedback({ message: 'Placa consultada com sucesso.', type: 'success', veiculoLocalId: veiculoAtual.localId })
        } catch (error) {
            setUltimasPlacasConsultadas(placas => {
                const restante = { ...placas }
                delete restante[veiculoAtual.localId]
                return restante
            })
            setPlacaFeedback({ message: error.message, type: 'error', veiculoLocalId: veiculoAtual.localId })
        } finally {
            setConsultandoPlacaId(null)
        }
    }

    function handleSalvarCadastro() {
        // TODO: enviar ao back end
    }

    // ── Funções edição ──
    function abrirModalEditar(cliente) {
        setClienteEditando(cliente)
        setFormularioEdicao({
            nomeCompleto: cliente.nome ?? '',
            cpf: cliente.cpf ?? '',
            telefone: cliente.telefone ?? '',
            email: cliente.email ?? '',
        })
        setFormularioEnderecoEdicao({
            cep: cliente.cep ?? '',
            logradouro: cliente.logradouro ?? '',
            bairro: cliente.bairro ?? '',
            cidade: cliente.cidade ?? '',
            estado: cliente.estado ?? '',
            complemento: cliente.complemento ?? '',
            numero: cliente.numero ?? '',
        })
        setVeiculosEdicao(
            cliente.veiculos?.length
                ? cliente.veiculos.map((veiculo, index) => prepararVeiculo(veiculo, index + 1))
                : [criarVeiculoVazio()]
        )
        setCepFeedbackEdicao({ message: '', type: '' })
        setModalEditarOpen(true)
    }

    function fecharModalEditar() {
        setModalEditarOpen(false)
        setClienteEditando(null)
    }

    function atualizarCampoEdicao(campo, valor) {
        setFormularioEdicao(f => ({ ...f, [campo]: valor }))
    }

    function atualizarCampoEnderecoEdicao(campo, valor) {
        setFormularioEnderecoEdicao(f => ({ ...f, [campo]: valor }))
    }

    function atualizarCampoVeiculoEdicao(index, campo, valor) {
        setVeiculosEdicao(vs => vs.map((v, i) => i === index ? { ...v, [campo]: valor } : v))
    }

    function adicionarVeiculoEdicao() {
        setVeiculosEdicao(vs => [...vs, criarVeiculoVazio(proximoLocalId(vs))])
    }

    function removerVeiculoEdicao(index) {
        setVeiculosEdicao(vs => vs.filter((_, i) => i !== index))
    }

    async function buscarCepEdicao(cepInformado = formularioEnderecoEdicao.cep) {
        const cepNormalizado = cepInformado.replace(/\D/g, '')
        if (cepNormalizado.length !== 8) {
            setCepFeedbackEdicao({ message: 'Digite um CEP válido com 8 números.', type: 'error' }); return
        }
        setBuscandoCepEdicao(true)
        setCepFeedbackEdicao({ message: 'Buscando CEP...', type: 'success' })
        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cepNormalizado}/json/`)
            if (data.erro) { setCepFeedbackEdicao({ message: 'CEP não encontrado.', type: 'error' }); return }
            setFormularioEnderecoEdicao(f => ({
                ...f,
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                estado: data.uf || '',
                complemento: data.complemento || f.complemento
            }))
            setCepFeedbackEdicao({ message: 'CEP encontrado.', type: 'success' })
        } catch {
            setCepFeedbackEdicao({ message: 'Erro ao buscar CEP.', type: 'error' })
        } finally {
            setBuscandoCepEdicao(false)
        }
    }

    function handleSalvarEdicao() {
        if (!clienteEditando) return
        // TODO: enviar ao back end com clienteEditando.id
        fecharModalEditar()
    }

    // ── Funções exclusão ──
    function abrirModalExcluir(cliente) {
        setClienteExcluindo(cliente)
        setModalExcluirOpen(true)
    }

    function fecharModalExcluir() {
        setModalExcluirOpen(false)
        setClienteExcluindo(null)
    }

    function handleExcluirCliente() {
        // TODO: chamar back end para excluir clienteExcluindo.id
        fecharModalExcluir()
    }

    return (
        <main id="main-content" className="cliente-content">
            <div className="container">
                <h1>Gerenciamento de Clientes e Veículos</h1>

                <div className="header-actions">
                    <div className="search-box" style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '16px' }} />
                            <input
                                type="text"
                                id="inputSearch"
                                placeholder="Pesquisar cliente por nome"
                                aria-label="Pesquisar cliente por nome"
                                style={{ paddingLeft: '36px' }}
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && setPaginaAtual(1)}
                            />
                        </div>
                        <button className="btn-new-client" type="button"
                            onClick={() => setPaginaAtual(1)}
                            style={{ padding: '12px 16px' }}>
                            Pesquisar
                        </button>
                    </div>
                    <button className="btn-new-client" type="button" onClick={abrirModal}>
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
                                <td colSpan="5" className="tabela-vazia">
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
                                        <button className="btn-detalhes" aria-label={`Editar ${cliente.nome}`}
                                            onClick={() => abrirModalEditar(cliente)}>
                                            <FaPencilAlt />
                                        </button>
                                        <button className="btn-excluir" aria-label={`Excluir ${cliente.nome}`}
                                            onClick={() => abrirModalExcluir(cliente)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {totalPaginas > 1 && (
                    <div className="paginacao">
                        <button className={`btn-pagina ${paginaAtual === 1 ? 'desabilitado' : ''}`}
                            onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))}
                            disabled={paginaAtual === 1}>‹
                        </button>
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                            <button key={pagina}
                                className={`btn-pagina ${paginaAtual === pagina ? 'ativo' : ''}`}
                                onClick={() => setPaginaAtual(pagina)}>
                                {pagina}
                            </button>
                        ))}
                        <button className={`btn-pagina ${paginaAtual === totalPaginas ? 'desabilitado' : ''}`}
                            onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
                            disabled={paginaAtual === totalPaginas}>›
                        </button>
                    </div>
                )}
            </div>

            {/* ── Modal Cadastro ── */}
            <div className="modal" style={{ display: modalOpen ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Cadastro Cliente + Veículo</h2>
                        <span className="close-modal" onClick={fecharModal}>&times;</span>
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
                                    <input id="cep" type="text" placeholder="00000-000"
                                        value={formularioEndereco.cep}
                                        onChange={e => atualizarCampoEndereco('cep', e.target.value)}
                                        onBlur={e => buscarEnderecoPorCep(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="numero">Número</label>
                                    <input id="numero" type="text" placeholder="123"
                                        value={formularioEndereco.numero}
                                        onChange={e => atualizarCampoEndereco('numero', e.target.value)} />
                                </div>
                            </div>

                            <p className={`feedback ${cepFeedback.type}`} aria-live="polite">
                                {buscandoCep ? 'Buscando CEP...' : cepFeedback.message}
                            </p>

                            <div className="input-group full">
                                <label htmlFor="logradouro">Logradouro</label>
                                <input id="logradouro" type="text" placeholder="Rua, avenida..."
                                    value={formularioEndereco.logradouro}
                                    onChange={e => atualizarCampoEndereco('logradouro', e.target.value)} />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="bairro">Bairro</label>
                                    <input id="bairro" type="text" placeholder="Bairro"
                                        value={formularioEndereco.bairro}
                                        onChange={e => atualizarCampoEndereco('bairro', e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="cidade">Cidade</label>
                                    <input id="cidade" type="text" placeholder="Cidade"
                                        value={formularioEndereco.cidade}
                                        onChange={e => atualizarCampoEndereco('cidade', e.target.value)} />
                                </div>
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="estado">Estado</label>
                                    <input id="estado" type="text" placeholder="UF"
                                        value={formularioEndereco.estado}
                                        onChange={e => atualizarCampoEndereco('estado', e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="complemento">Complemento</label>
                                    <input id="complemento" type="text" placeholder="Apto, bloco..."
                                        value={formularioEndereco.complemento}
                                        onChange={e => atualizarCampoEndereco('complemento', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="column-right">
                            <h3 className="section-title">DADOS DO VEÍCULO</h3>
                            <BlocoVeiculos
                                lista={veiculos}
                                onAtualizar={atualizarCampoVeiculo}
                                onAdicionar={adicionarVeiculo}
                                onRemover={removerVeiculo}
                                consultaPlaca={true}
                                onConsultarPlaca={consultarPlaca}
                                consultandoPlacaId={consultandoPlacaId}
                                placaFeedback={placaFeedback}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" onClick={fecharModal}>Cancelar</button>
                        <button type="button" className="btn-salvar" onClick={handleSalvarCadastro}>Salvar Cadastro</button>
                    </div>
                    <p className={`feedback ${cadastroFeedback.type}`} aria-live="polite">
                        {cadastroFeedback.message}
                    </p>
                </div>
            </div>

            {/* ── Modal Editar ── */}
            <div className="modal" style={{ display: modalEditarOpen ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Editar Cliente</h2>
                        <span className="close-modal" onClick={fecharModalEditar}>&times;</span>
                    </div>

                    <div className="modal-body">
                        <div className="column-left">
                            <h3 className="section-title">DADOS DO CLIENTE</h3>

                            <div className="input-group full">
                                <label htmlFor="edit-nome">Nome Completo *</label>
                                <input id="edit-nome" type="text"
                                    value={formularioEdicao.nomeCompleto}
                                    onChange={e => atualizarCampoEdicao('nomeCompleto', e.target.value)}
                                    aria-required="true" />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="edit-cpf">CPF *</label>
                                    <input id="edit-cpf" type="text"
                                        value={formularioEdicao.cpf}
                                        onChange={e => atualizarCampoEdicao('cpf', e.target.value)}
                                        aria-required="true" />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="edit-telefone">Telefone</label>
                                    <input id="edit-telefone" type="text"
                                        value={formularioEdicao.telefone}
                                        onChange={e => atualizarCampoEdicao('telefone', e.target.value)} />
                                </div>
                            </div>

                            <div className="input-group full">
                                <label htmlFor="edit-email">E-mail</label>
                                <input id="edit-email" type="email"
                                    value={formularioEdicao.email}
                                    onChange={e => atualizarCampoEdicao('email', e.target.value)} />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="edit-cep">CEP</label>
                                    <input id="edit-cep" type="text"
                                        value={formularioEnderecoEdicao.cep}
                                        onChange={e => atualizarCampoEnderecoEdicao('cep', e.target.value)}
                                        onBlur={e => buscarCepEdicao(e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="edit-numero">Número</label>
                                    <input id="edit-numero" type="text"
                                        value={formularioEnderecoEdicao.numero}
                                        onChange={e => atualizarCampoEnderecoEdicao('numero', e.target.value)} />
                                </div>
                            </div>

                            <p className={`feedback ${cepFeedbackEdicao.type}`} aria-live="polite">
                                {buscandoCepEdicao ? 'Buscando CEP...' : cepFeedbackEdicao.message}
                            </p>

                            <div className="input-group full">
                                <label htmlFor="edit-logradouro">Logradouro</label>
                                <input id="edit-logradouro" type="text"
                                    value={formularioEnderecoEdicao.logradouro}
                                    onChange={e => atualizarCampoEnderecoEdicao('logradouro', e.target.value)} />
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="edit-bairro">Bairro</label>
                                    <input id="edit-bairro" type="text"
                                        value={formularioEnderecoEdicao.bairro}
                                        onChange={e => atualizarCampoEnderecoEdicao('bairro', e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="edit-cidade">Cidade</label>
                                    <input id="edit-cidade" type="text"
                                        value={formularioEnderecoEdicao.cidade}
                                        onChange={e => atualizarCampoEnderecoEdicao('cidade', e.target.value)} />
                                </div>
                            </div>

                            <div className="row">
                                <div className="input-group">
                                    <label htmlFor="edit-estado">Estado</label>
                                    <input id="edit-estado" type="text"
                                        value={formularioEnderecoEdicao.estado}
                                        onChange={e => atualizarCampoEnderecoEdicao('estado', e.target.value)} />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="edit-complemento">Complemento</label>
                                    <input id="edit-complemento" type="text"
                                        value={formularioEnderecoEdicao.complemento}
                                        onChange={e => atualizarCampoEnderecoEdicao('complemento', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="column-right">
                            <h3 className="section-title">DADOS DO VEÍCULO</h3>
                            <BlocoVeiculos
                                lista={veiculosEdicao}
                                onAtualizar={atualizarCampoVeiculoEdicao}
                                onAdicionar={adicionarVeiculoEdicao}
                                onRemover={removerVeiculoEdicao}
                                consultaPlaca={false}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" onClick={fecharModalEditar}>Cancelar</button>
                        <button type="button" className="btn-salvar" onClick={handleSalvarEdicao}>Salvar alterações</button>
                    </div>
                </div>
            </div>

            {/* ── Modal Excluir ── */}
            <div className="modal" style={{ display: modalExcluirOpen ? 'flex' : 'none' }}>
                <div className="modal-content modal-content-excluir">
                    <div className="modal-header">
                        <h2>Excluir Cliente</h2>
                        <span className="close-modal" onClick={fecharModalExcluir}>&times;</span>
                    </div>

                    <div className="modal-excluir-body">
                        <div className="aviso-excluir">
                            <span className="aviso-excluir-icone">⚠️</span>
                            <div>
                                <p className="aviso-excluir-titulo">Esta ação não pode ser revertida!</p>
                                <p className="aviso-excluir-texto">
                                    Você está prestes a excluir o cliente <strong>{clienteExcluindo?.nome}</strong> e todos os seus veículos vinculados. Tem certeza que deseja continuar?
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" onClick={fecharModalExcluir}>Cancelar</button>
                        <button type="button" className="btn-excluir-confirmar" onClick={handleExcluirCliente}>Sim, excluir</button>
                    </div>
                </div>
            </div>

        </main>
    )
}
