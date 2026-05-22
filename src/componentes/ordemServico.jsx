import { useState } from 'react'
import { FaSearch, FaPencilAlt, FaTrash, FaPowerOff, FaEye } from 'react-icons/fa'
import '../style/ordemServico.css'

const ITENS_POR_PAGINA = 8

const estadoInicialForm = {
    tipoCliente: 'cadastrado',
    buscaCliente: '',
    clienteSelecionado: null,
    telefone: '',
    dropdownAberto: false,
    veiculoSelecionado: null,
    novoVeiculo: '',
    mostrarNovoVeiculo: false,
    status: '',
    descricao: '',
    orcamento: '',
    km: '',
    nomeAvulso: '',
    telefoneAvulso: '',
    veiculoAvulso: '',
}

const estadoInicialEncerramento = {
    garantia: '',
    valorFinal: '',
    proximaRevisao: '',
    observacoes: '',
}

export function OrdemServico() {
    const [busca, setBusca] = useState('')
    const [paginaAtual, setPaginaAtual] = useState(1)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalEncerramentoOpen, setModalEncerramentoOpen] = useState(false)
    const [ordemParaEncerrar, setOrdemParaEncerrar] = useState(null)
    const [form, setForm] = useState(estadoInicialForm)
    const [formEncerramento, setFormEncerramento] = useState(estadoInicialEncerramento)
    const [clientes, setClientes] = useState([])
    const [ordens, setOrdens] = useState([])
    const [modalExcluirOpen, setModalExcluirOpen] = useState(false)
    const [ordemExcluindo, setOrdemExcluindo] = useState(null)

    const ordensFiltradas = ordens.filter(o =>
        o.nomeCliente.toLowerCase().includes(busca.toLowerCase())
    )
    const totalPaginas = Math.ceil(ordensFiltradas.length / ITENS_POR_PAGINA)
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    const ordensPagina = ordensFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA)

    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(form.buscaCliente.toLowerCase())
    )

    const estadoInicialEdicao = {
        status: '',
        descricao: '',
        orcamento: '',
    }

    const [modalEditarOpen, setModalEditarOpen] = useState(false)
    const [ordemEditando, setOrdemEditando] = useState(null)
    const [formEdicao, setFormEdicao] = useState(estadoInicialEdicao)

    function abrirModal() {
        setForm(estadoInicialForm)
        setModalOpen(true)
    }

    function fecharModal() {
        setModalOpen(false)
        setForm(estadoInicialForm)
    }

    function setField(field, value) {
        setForm(f => ({ ...f, [field]: value }))
    }

    function setFieldEncerramento(field, value) {
        setFormEncerramento(f => ({ ...f, [field]: value }))
    }

    function abrirModalEncerramento(ordem) {
        setOrdemParaEncerrar(ordem)
        setFormEncerramento(estadoInicialEncerramento)
        setModalEncerramentoOpen(true)
    }

    function fecharModalEncerramento() {
        setModalEncerramentoOpen(false)
        setOrdemParaEncerrar(null)
        setFormEncerramento(estadoInicialEncerramento)
    }

    function handleConfirmarEncerramento() {
        const { garantia, valorFinal, proximaRevisao } = formEncerramento
        if (!garantia || !valorFinal || !proximaRevisao) {
            alert('Preencha todos os campos obrigatórios.')
            return
        }
        // back end
        fecharModalEncerramento()
    }

    function selecionarCliente(cliente) {
        setForm(f => ({
            ...f,
            clienteSelecionado: cliente,
            buscaCliente: cliente.nome,
            telefone: cliente.telefone,
            dropdownAberto: false,
            veiculoSelecionado: null,
            mostrarNovoVeiculo: false,
            novoVeiculo: '',
        }))
    }

    function selecionarVeiculo(veiculo) {
        setForm(f => ({ ...f, veiculoSelecionado: veiculo, mostrarNovoVeiculo: false, novoVeiculo: '' }))
    }

    function toggleNovoVeiculo() {
        setForm(f => ({ ...f, mostrarNovoVeiculo: !f.mostrarNovoVeiculo, veiculoSelecionado: null, novoVeiculo: '' }))
    }

    function handleSalvar() {
        if (form.status === 'finalizado') {
            abrirModalEncerramento(null)
            return
        }
        // back end
    }

    function abrirModalEditar(ordem) {
        setOrdemEditando(ordem)
        setFormEdicao({
            status: ordem.status,
            descricao: ordem.descricao,
            orcamento: ordem.orcamento,
        })
        setModalEditarOpen(true)
    }

    function fecharModalEditar() {
        setModalEditarOpen(false)
        setOrdemEditando(null)
        setFormEdicao(estadoInicialEdicao)
    }

    function handleSalvarEdicao() {
        // back-end
    }

    function setFieldEdicao(field, value) {
        setFormEdicao(f => ({ ...f, [field]: value }))
    }

    function abrirModalExcluir(ordem) {
    setOrdemExcluindo(ordem)
    setModalExcluirOpen(true)
}

    function fecharModalExcluir() {
        setModalExcluirOpen(false)
        setOrdemExcluindo(null)
    }

    function handleExcluir() {
        // back end
        fecharModalExcluir()
    }

    return (
        <main id="main-content" className="os-content">
            <div className="container">
                <h1>Gerenciamento de Serviços</h1>

                <div className="header-actions">
                    <div className="search-box">
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '16px' }} />
                            <input
                                type="text"
                                id="inputSearch"
                                placeholder="Pesquisar por nome do cliente"
                                aria-label="Pesquisar ordem de serviço por nome do cliente"
                                style={{ paddingLeft: '36px' }}
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && setPaginaAtual(1)}
                            />
                        </div>
                        <button className="btn-new-client" type="button" onClick={() => setPaginaAtual(1)}>
                            Pesquisar
                        </button>
                    </div>
                    <button className="btn-new-client" type="button" onClick={abrirModal}>
                        + Nova Ordem de Serviço
                    </button>
                </div>

                <table className="client-table" id="tableClients" aria-label="Tabela de ordens de serviço">
                    <thead>
                        <tr>
                            <th scope="col">Nº OS</th>
                            <th scope="col">Nome Cliente</th>
                            <th scope="col">Telefone</th>
                            <th scope="col">Carro</th>
                            <th scope="col">Data de entrada</th>
                            <th scope="col">Status</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordensPagina.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="tabela-vazia">
                                    Nenhuma ordem de serviço encontrada.
                                </td>
                            </tr>
                        ) : (
                            ordensPagina.map((ordem, index) => (
                                <tr key={index}>
                                    <td>{ordem.numero}</td>
                                    <td>{ordem.nomeCliente}</td>
                                    <td>{ordem.telefone}</td>
                                    <td>{ordem.carro}</td>
                                    <td>{ordem.dataEntrada}</td>
                                    <td>{ordem.status}</td>
                                    <td>
                                        <button
                                            className="btn-detalhes"
                                            aria-label={`${ordem.status === 'Encerrado' ? 'Visualizar' : 'Editar'} OS ${ordem.numero}`}
                                            onClick={() => abrirModalEditar(ordem)}>
                                            {ordem.status === 'Encerrado' ? <FaEye /> : <FaPencilAlt />}
                                        </button>
                                        {ordem.status !== 'Encerrado' && (
                                            <>
                                                <button
                                                    className="btn-excluir"
                                                    aria-label={`Excluir OS ${ordem.numero}`}
                                                    onClick={() => abrirModalExcluir(ordem)}>
                                                    <FaTrash />
                                                </button>
                                                <button
                                                    className="btn-encerrar"
                                                    aria-label={`Encerrar OS ${ordem.numero}`}
                                                    onClick={() => abrirModalEncerramento(ordem)}>
                                                    <FaPowerOff />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {totalPaginas > 1 && (
                    <div className="paginacao">
                        <button
                            className={`btn-pagina ${paginaAtual === 1 ? 'desabilitado' : ''}`}
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
                        <button
                            className={`btn-pagina ${paginaAtual === totalPaginas ? 'desabilitado' : ''}`}
                            onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))}
                            disabled={paginaAtual === totalPaginas}>›
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Nova Ordem de Serviço */}
            <div className="modal" style={{ display: modalOpen ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Nova Ordem de Serviço</h2>
                        <span className="close-modal" onClick={fecharModal}>&times;</span>
                    </div>

                    <div className="modal-body-os">

                        <p className="modal-tipo-cliente-label">Tipo de cliente</p>
                        <div className="modal-tipo-buttons">
                            <button type="button"
                                className={`btn-tipo-cliente ${form.tipoCliente === 'cadastrado' ? 'ativo' : ''}`}
                                onClick={() => setField('tipoCliente', 'cadastrado')}>
                                👤 Cliente cadastrado
                            </button>
                            <button type="button"
                                className={`btn-tipo-cliente ${form.tipoCliente === 'avulso' ? 'ativo' : ''}`}
                                onClick={() => setField('tipoCliente', 'avulso')}>
                                👤 Cliente avulso
                            </button>
                        </div>

                        <p className="modal-dados-os-label">Dados da OS</p>

                        {form.tipoCliente === 'cadastrado' && (
                            <>
                                <div className="input-group busca-cliente-wrapper">
                                    <label htmlFor="os-busca-cliente">Cliente *</label>
                                    <div className="busca-cliente-wrapper">
                                        <FaSearch className="search-icon" />
                                        <input
                                            id="os-busca-cliente"
                                            type="text"
                                            placeholder="Buscar cliente pelo nome..."
                                            value={form.buscaCliente}
                                            onChange={e => setForm(f => ({ ...f, buscaCliente: e.target.value, dropdownAberto: true, clienteSelecionado: null }))}
                                            aria-required="true"
                                        />
                                    </div>
                                    {form.dropdownAberto && form.buscaCliente && clientesFiltrados.length > 0 && (
                                        <div className="dropdown-clientes">
                                            {clientesFiltrados.map(c => (
                                                <div key={c.id} className="dropdown-item" onClick={() => selecionarCliente(c)}>
                                                    {c.nome}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {form.clienteSelecionado && (
                                    <>
                                        <div className="input-group">
                                            <label htmlFor="os-telefone">Telefone para contato *</label>
                                            <input id="os-telefone" type="text"
                                                value={form.telefone}
                                                onChange={e => setField('telefone', e.target.value)}
                                                aria-required="true" />
                                        </div>

                                        <div className="input-group">
                                            <label>Veículo *</label>
                                            <div className="veiculos-lista">
                                                {form.clienteSelecionado.veiculos.map(v => (
                                                    <button key={v} type="button"
                                                        className={`btn-veiculo ${form.veiculoSelecionado === v ? 'ativo' : ''}`}
                                                        onClick={() => selecionarVeiculo(v)}>
                                                        {v}
                                                    </button>
                                                ))}
                                                <button type="button"
                                                    className={`btn-novo-veiculo ${form.mostrarNovoVeiculo ? 'ativo' : ''}`}
                                                    onClick={toggleNovoVeiculo}>
                                                    + Novo veículo
                                                </button>
                                            </div>
                                            {form.mostrarNovoVeiculo && (
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Ex: Toyota Corolla (ABC-1234)"
                                                        value={form.novoVeiculo}
                                                        onChange={e => setField('novoVeiculo', e.target.value)} />
                                                    <p className="novo-veiculo-hint">Este veículo será salvo no cadastro do cliente.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="input-group">
                                            <label htmlFor="os-km">Quilometragem atual *</label>
                                            <div className="input-sufixo-wrapper">
                                                <input id="os-km" type="number" placeholder="Ex: 45000" min="0"
                                                    value={form.km}
                                                    onChange={e => setField('km', e.target.value)}
                                                    aria-required="true" />
                                                <span className="input-sufixo">km</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {form.tipoCliente === 'avulso' && (
                            <>
                                <div className="aviso-avulso">
                                    <span>ℹ️</span>
                                    <p>Os dados deste cliente <strong>não serão salvos</strong> na plataforma, apenas nesta OS.</p>
                                </div>

                                <div className="row">
                                    <div className="input-group">
                                        <label htmlFor="os-nome-avulso">Nome do cliente *</label>
                                        <input id="os-nome-avulso" type="text" placeholder="Ex: João Silva"
                                            value={form.nomeAvulso}
                                            onChange={e => setField('nomeAvulso', e.target.value)}
                                            aria-required="true" />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="os-telefone-avulso">Telefone *</label>
                                        <input id="os-telefone-avulso" type="text" placeholder="(11) 99999-9999"
                                            value={form.telefoneAvulso}
                                            onChange={e => setField('telefoneAvulso', e.target.value)}
                                            aria-required="true" />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="input-group">
                                        <label htmlFor="os-veiculo-avulso">Veículo *</label>
                                        <input id="os-veiculo-avulso" type="text" placeholder="Toyota Corolla (ABC-1234)"
                                            value={form.veiculoAvulso}
                                            onChange={e => setField('veiculoAvulso', e.target.value)}
                                            aria-required="true" />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="os-km-avulso">Quilometragem atual *</label>
                                        <div className="input-sufixo-wrapper">
                                            <input id="os-km-avulso" type="number" placeholder="Ex: 45000" min="0"
                                                value={form.km}
                                                onChange={e => setField('km', e.target.value)}
                                                aria-required="true" />
                                            <span className="input-sufixo">km</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label htmlFor="os-status">Status *</label>
                            <select id="os-status" value={form.status} onChange={e => setField('status', e.target.value)} aria-required="true">
                                <option value="">Selecione...</option>
                                <option value="em-andamento">Em andamento</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="aguardando">Aguardando</option>
                                <option value="encerrado">Encerrado</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="os-descricao">Descrição do serviço *</label>
                            <textarea id="os-descricao" placeholder="Descreva o serviço a ser realizado..." rows="3"
                                value={form.descricao}
                                onChange={e => setField('descricao', e.target.value)} />
                        </div>

                        <div className="input-group">
                            <label htmlFor="os-orcamento">Orçamento (R$) *</label>
                            <div className="input-prefixo-wrapper">
                                <span className="input-prefixo">R$</span>
                                <input id="os-orcamento" type="number" placeholder="0,00" min="0" step="0.01"
                                    value={form.orcamento}
                                    onChange={e => setField('orcamento', e.target.value)}
                                    aria-required="true" />
                            </div>
                        </div>

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" onClick={fecharModal}>Cancelar</button>
                        <button type="button" className="btn-salvar" onClick={handleSalvar}>Cadastrar OS</button>
                    </div>
                </div>
            </div>

            {/* Modal Editar Ordem de Serviço */}
            <div className="modal" style={{ display: modalEditarOpen ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Editar Ordem de Serviço</h2>
                        <span className="close-modal" onClick={fecharModalEditar}>&times;</span>
                    </div>

                    <div className="modal-body-os">

                        {ordemEditando?.status === 'Encerrado' ? (
                            <>
                                <div className="aviso-encerrado">
                                    <i className="ti ti-lock"></i>
                                    <p>Esta OS está encerrada e não pode ser editada.</p>
                                </div>

                                <p className="modal-dados-os-label">Dados da OS</p>

                                <div className="row">
                                    <div className="input-group">
                                        <label>Nº OS</label>
                                        <input type="text" value={ordemEditando?.numero ?? ''} disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Cliente</label>
                                        <input type="text" value={ordemEditando?.nomeCliente ?? ''} disabled />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="input-group">
                                        <label>Telefone para contato</label>
                                        <input type="text" value={ordemEditando?.telefone ?? ''} disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Veículo</label>
                                        <input type="text" value={ordemEditando?.carro ?? ''} disabled />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="input-group">
                                        <label>Data de entrada</label>
                                        <input type="text" value={ordemEditando?.dataEntrada ?? ''} disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Data de encerramento</label>
                                        <input type="text" value={ordemEditando?.dataEncerramento ?? ''} disabled />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Descrição do serviço</label>
                                    <textarea rows="3" value={ordemEditando?.descricao ?? ''} disabled />
                                </div>

                                <p className="modal-dados-os-label" style={{ marginTop: '16px' }}>Informações do encerramento</p>

                                <div className="row">
                                    <div className="input-group">
                                        <label>Garantia</label>
                                        <input type="text" value={ordemEditando?.garantia ?? ''} disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Próxima revisão</label>
                                        <input type="text" value={ordemEditando?.proximaRevisao ?? ''} disabled />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="input-group">
                                        <label>Orçamento inicial</label>
                                        <input type="text" value={ordemEditando?.orcamento ? `R$ ${ordemEditando.orcamento}` : ''} disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Valor final cobrado</label>
                                        <div className="input-valor-final-wrapper">
                                            <input type="text" value={ordemEditando?.valorFinal ? `R$ ${ordemEditando.valorFinal}` : ''} disabled />
                                            {ordemEditando?.valorFinal && ordemEditando?.orcamento && (() => {
                                                const diff = parseFloat(ordemEditando.valorFinal) - parseFloat(ordemEditando.orcamento)
                                                if (diff === 0) return null
                                                return (
                                                    <span className={`tag-diferenca ${diff > 0 ? 'maior' : 'menor'}`}>
                                                        {diff > 0 ? '+' : ''}R$ {Math.abs(diff).toFixed(2)}
                                                    </span>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="modal-dados-os-label">Dados da OS</p>

                                <div className="row">
                                    <div className="input-group">
                                        <label>Nº OS</label>
                                        <input type="text" value={ordemEditando?.numero ?? ''} disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Cliente</label>
                                        <input type="text" value={ordemEditando?.nomeCliente ?? ''} disabled />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="input-group">
                                        <label>Telefone para contato</label>
                                        <input type="text" value={ordemEditando?.telefone ?? ''} disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Veículo</label>
                                        <input type="text" value={ordemEditando?.carro ?? ''} disabled />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="input-group">
                                        <label>Data de entrada</label>
                                        <input type="text" value={ordemEditando?.dataEntrada ?? ''} disabled />
                                    </div>
                                    <div className="input-group"></div>
                                </div>

                                <p className="modal-dados-os-label" style={{ marginTop: '16px' }}>Editar informações</p>

                                <div className="input-group">
                                    <label htmlFor="edit-status">Status *</label>
                                    <select id="edit-status" value={formEdicao.status} onChange={e => setFieldEdicao('status', e.target.value)} aria-required="true">
                                        <option value="">Selecione...</option>
                                        <option value="em-andamento">Em andamento</option>
                                        <option value="finalizado">Finalizado</option>
                                        <option value="aguardando">Aguardando</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="edit-descricao">Descrição do serviço *</label>
                                    <textarea id="edit-descricao" rows="3"
                                        value={formEdicao.descricao}
                                        onChange={e => setFieldEdicao('descricao', e.target.value)} />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="edit-orcamento">Orçamento (R$) *</label>
                                    <div className="input-prefixo-wrapper">
                                        <span className="input-prefixo">R$</span>
                                        <input id="edit-orcamento" type="number" placeholder="0,00" min="0" step="0.01"
                                            value={formEdicao.orcamento}
                                            onChange={e => setFieldEdicao('orcamento', e.target.value)}
                                            aria-required="true" />
                                    </div>
                                </div>
                            </>
                        )}

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" onClick={fecharModalEditar}>
                            {ordemEditando?.status === 'Encerrado' ? 'Fechar' : 'Cancelar'}
                        </button>
                        {ordemEditando?.status !== 'Encerrado' && (
                            <button type="button" className="btn-salvar" onClick={handleSalvarEdicao}>Salvar alterações</button>
                        )}
                    </div>
                </div>
            </div>


            {/* Modal Excluir OS */}
            <div className="modal" style={{ display: modalExcluirOpen ? 'flex' : 'none' }}>
                <div className="modal-content modal-content-excluir">
                    <div className="modal-header">
                        <h2>Excluir Ordem de Serviço</h2>
                        <span className="close-modal" onClick={fecharModalExcluir}>&times;</span>
                    </div>

                    <div className="modal-excluir-body">
                        <div className="aviso-excluir">
                            <span className="aviso-excluir-icone">⚠️</span>
                            <div>
                                <p className="aviso-excluir-titulo">Esta ação não pode ser revertida!</p>
                                <p className="aviso-excluir-texto">
                                    Você está prestes a excluir a Ordem de Serviço <strong>{ordemExcluindo?.numero}</strong>. Tem certeza que deseja continuar?
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" onClick={fecharModalExcluir}>Cancelar</button>
                        <button type="button" className="btn-excluir-confirmar" onClick={handleExcluir}>Sim, excluir</button>
                    </div>
                </div>
            </div>

            {/* Modal Encerrar OS */}
            <div className="modal" style={{ display: modalEncerramentoOpen ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Encerrar Ordem de Serviço</h2>
                        <span className="close-modal" onClick={fecharModalEncerramento}>&times;</span>
                    </div>

                    <div className="modal-body-os">

                        <div className="aviso-avulso aviso-atencao">
                            <span>⚠️</span>
                            <p>Ao encerrar, o status não poderá ser alterado.</p>
                        </div>

                        <div className="row">
                            <div className="input-group">
                                <label htmlFor="enc-garantia">Garantia do serviço *</label>
                                <select id="enc-garantia"
                                    value={formEncerramento.garantia}
                                    onChange={e => setFieldEncerramento('garantia', e.target.value)}
                                    aria-required="true">
                                    <option value="">Selecione...</option>
                                    <option value="1mes">Até 1 mês</option>
                                    <option value="3meses">3 meses</option>
                                    <option value="6meses">6 meses</option>
                                    <option value="9meses">9 meses</option>
                                    <option value="1ano">1 ano</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="enc-valor">Valor final cobrado (R$) *</label>
                                <div className="input-prefixo-wrapper">
                                    <span className="input-prefixo">R$</span>
                                    <input id="enc-valor" type="number" placeholder="0,00" min="0" step="0.01"
                                        value={formEncerramento.valorFinal}
                                        onChange={e => setFieldEncerramento('valorFinal', e.target.value)}
                                        aria-required="true" />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="enc-revisao">Próxima revisão recomendada *</label>
                            <input id="enc-revisao" type="date"
                                value={formEncerramento.proximaRevisao}
                                onChange={e => setFieldEncerramento('proximaRevisao', e.target.value)}
                                aria-required="true" />
                            <p className="novo-veiculo-hint">Informe quando o cliente deve retornar para revisão.</p>
                        </div>

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancelar" onClick={fecharModalEncerramento}>Cancelar</button>
                        <button type="button" className="btn-encerrar-confirmar" onClick={handleConfirmarEncerramento}>
                            ✓ Confirmar encerramento
                        </button>
                    </div>
                </div>
            </div>

        </main>
    )
}