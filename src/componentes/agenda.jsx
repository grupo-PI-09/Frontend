import { useEffect, useRef, useState } from 'react'
import { criarCliente, formatarTelefone, listarClientes, mapClienteTelaParaApi, LIMITES_CLIENTE } from '../services/clienteService'
import {
    LIMITES_VEICULO,
    TIPOS_COMBUSTIVEL,
    consultarPlacaBackend,
    criarVeiculo,
    listarVeiculosPorCliente,
    mapVeiculoTelaParaApi,
    mensagemFalhaConsultaPlaca,
    normalizarPlaca,
    placaValida
} from '../services/veiculoService'
import {
    LIMITE_SERVICO,
    cancelarAgendamento,
    criarAgendamento,
    dataIsoLocal,
    listarAgendamentos,
    mapAgendamentoTelaParaApi,
    mesmoDia
} from '../services/agendamentoService'
import '../style/agenda.css'

const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES_NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const FEEDBACK_VAZIO = { message: '', type: '' }

const formVazio = (data = '', hora = '08:00') => ({
    buscaCliente: '', clienteSelecionado: null, dropdownAberto: false,
    veiculosCliente: [], carregandoVeiculos: false, erroVeiculos: '', veiculoId: '',
    novoCliente: { nome: '', cpf: '', telefone: '', email: '' },
    novoVeiculo: { placa: '', marca: '', modelo: '', ano: '', km: '', tipoCombustivel: '' },
    data, hora, tipo: 'preventiva', duracao: '1', servico: '', observacoes: ''
})

function formatarData(data) {
    return data.toLocaleDateString('pt-BR')
}

export function Agenda() {
    const [agendamentos, setAgendamentos] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [feedback, setFeedback] = useState(FEEDBACK_VAZIO)
    const [offset, setOffset] = useState(0)
    const [view, setView] = useState('semana')
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTipo, setModalTipo] = useState('ver')
    const [modalFeedback, setModalFeedback] = useState(FEEDBACK_VAZIO)
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null)
    const [tipoCliente, setTipoCliente] = useState('cadastrado')
    const [clientes, setClientes] = useState([])
    const [form, setForm] = useState(formVazio())
    const [salvando, setSalvando] = useState(false)
    const [cancelando, setCancelando] = useState(false)
    // Cliente novo já gravado numa tentativa anterior que falhou depois (ex.: placa repetida):
    // a próxima tentativa reaproveita em vez de esbarrar no CPF duplicado.
    const clienteNovoCriado = useRef(null)

    async function carregarAgendamentos() {
        setCarregando(true)
        try {
            setAgendamentos(await listarAgendamentos())
            setFeedback(atual => atual.type === 'error' ? FEEDBACK_VAZIO : atual)
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error)
            setFeedback({ message: error.message, type: 'error' })
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => {
        carregarAgendamentos()
    }, [])

    function getInicioSemana(off) {
        const hoje = new Date()
        const ds = hoje.getDay()
        const ini = new Date(hoje)
        ini.setDate(hoje.getDate() - ds + off * 7)
        return ini
    }

    function getTituloSemana() {
        const ini = getInicioSemana(offset)
        const fim = new Date(ini)
        fim.setDate(ini.getDate() + 6)
        return `${ini.getDate()} ${MESES_CURTOS[ini.getMonth()]} — ${fim.getDate()} ${MESES_CURTOS[fim.getMonth()]} ${fim.getFullYear()}`
    }

    function getTituloMes() {
        const hoje = new Date()
        const ref = new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1)
        return `${MESES_NOMES[ref.getMonth()]} ${ref.getFullYear()}`
    }

    function setField(field, value) {
        setForm(f => ({ ...f, [field]: value }))
    }

    function setNovoCliente(field, value) {
        setForm(f => ({ ...f, novoCliente: { ...f.novoCliente, [field]: value } }))
    }

    function setNovoVeiculo(field, value) {
        setForm(f => ({ ...f, novoVeiculo: { ...f.novoVeiculo, [field]: value } }))
    }

    function verAgendamento(ag) {
        setAgendamentoSelecionado(ag)
        setModalFeedback(FEEDBACK_VAZIO)
        setModalTipo('ver')
        setModalOpen(true)
    }

    async function abrirNovo(data = dataIsoLocal(new Date()), hora = '08:00') {
        setAgendamentoSelecionado(null)
        setTipoCliente('cadastrado')
        setForm(formVazio(data, hora))
        setModalFeedback(FEEDBACK_VAZIO)
        clienteNovoCriado.current = null
        setModalTipo('novo')
        setModalOpen(true)

        try {
            setClientes(await listarClientes())
        } catch (error) {
            setModalFeedback({ message: error.message, type: 'error' })
        }
    }

    function fecharModal() {
        setModalOpen(false)
    }

    // Só os veículos do cliente escolhido: a API recusa (400) veículo de outro cliente.
    async function selecionarCliente(cliente) {
        setForm(f => ({
            ...f,
            clienteSelecionado: cliente,
            buscaCliente: cliente.nome,
            dropdownAberto: false,
            veiculosCliente: [],
            carregandoVeiculos: true,
            erroVeiculos: '',
            veiculoId: ''
        }))

        try {
            const veiculos = (await listarVeiculosPorCliente(cliente.id)).filter(v => v.ativo !== false)
            setForm(f => f.clienteSelecionado?.id === cliente.id
                ? {
                    ...f,
                    veiculosCliente: veiculos,
                    carregandoVeiculos: false,
                    veiculoId: veiculos.length === 1 ? String(veiculos[0].id) : ''
                }
                : f)
        } catch (error) {
            setForm(f => f.clienteSelecionado?.id === cliente.id
                ? { ...f, carregandoVeiculos: false, erroVeiculos: error.message }
                : f)
        }
    }

    async function consultarPlaca() {
        const placa = normalizarPlaca(form.novoVeiculo.placa)
        if (!placaValida(placa)) {
            setModalFeedback({ message: 'Digite uma placa válida (ABC1234 ou ABC1D23) para consultar.', type: 'error' })
            return
        }
        setModalFeedback({ message: 'Consultando placa...', type: 'success' })
        try {
            const dados = await consultarPlacaBackend(placa)
            setForm(f => ({
                ...f,
                novoVeiculo: {
                    ...f.novoVeiculo,
                    placa,
                    marca: dados.marca || f.novoVeiculo.marca,
                    modelo: dados.modelo || f.novoVeiculo.modelo,
                    ano: dados.ano || f.novoVeiculo.ano
                }
            }))
            setModalFeedback({ message: 'Placa consultada com sucesso.', type: 'success' })
        } catch (error) {
            setModalFeedback(mensagemFalhaConsultaPlaca(error))
        }
    }

    async function salvarAgendamento() {
        setSalvando(true)
        setModalFeedback({ message: 'Salvando agendamento...', type: 'success' })

        try {
            let clienteId = form.clienteSelecionado?.id
            let veiculoId = form.veiculoId

            if (tipoCliente === 'novo') {
                // Confere tudo antes de gravar, para não deixar cliente sem agendamento à toa
                mapAgendamentoTelaParaApi({ ...form, clienteId: 1, veiculoId: 1 })
                mapClienteTelaParaApi(form.novoCliente)
                mapVeiculoTelaParaApi(form.novoVeiculo, 1)

                if (!clienteNovoCriado.current) {
                    clienteNovoCriado.current = await criarCliente(form.novoCliente, {})
                }
                clienteId = clienteNovoCriado.current.id
                veiculoId = (await criarVeiculo(form.novoVeiculo, clienteId)).id
            }

            const criado = await criarAgendamento({ ...form, clienteId, veiculoId })
            await carregarAgendamentos()
            setFeedback({
                message: `Agendamento de ${criado.cliente} marcado para ${formatarData(criado.inicio)} às ${criado.horario}.`,
                type: 'success'
            })
            fecharModal()
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error)
            const prefixo = clienteNovoCriado.current ? 'Cliente cadastrado, mas o agendamento não foi salvo: ' : ''
            setModalFeedback({ message: prefixo + error.message, type: 'error' })
        } finally {
            setSalvando(false)
        }
    }

    async function cancelarSelecionado() {
        if (!agendamentoSelecionado) return
        if (!window.confirm(`Cancelar o agendamento de ${agendamentoSelecionado.cliente}?`)) return

        setCancelando(true)
        try {
            await cancelarAgendamento(agendamentoSelecionado)
            await carregarAgendamentos()
            setFeedback({ message: 'Agendamento cancelado.', type: 'success' })
            fecharModal()
        } catch (error) {
            setModalFeedback({ message: error.message, type: 'error' })
        } finally {
            setCancelando(false)
        }
    }

    const hoje = new Date()
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())

    const clientesFiltrados = clientes
        .filter(c => c.ativo !== false)
        .filter(c => String(c.nome ?? '').toLowerCase().includes(form.buscaCliente.trim().toLowerCase()))
        .slice(0, 8)

    function renderSemana() {
        const ini = getInicioSemana(offset)

        return (
            <>
                <div className="dias-header">
                    <div className="hora-label-header"></div>
                    {Array.from({ length: 7 }, (_, d) => {
                        const dia = new Date(ini)
                        dia.setDate(ini.getDate() + d)
                        const ehHoje = mesmoDia(dia, hoje)
                        return (
                            <div key={d} className={`dia-col-header ${ehHoje ? 'hoje' : ''}`}>
                                <span className="dia-semana-label">{DIAS_SEMANA[dia.getDay()]}</span>
                                <span className={`dia-num ${ehHoje ? 'dia-num--hoje' : ''}`}>{dia.getDate()}</span>
                            </div>
                        )
                    })}
                </div>
                <div className="grade">
                    {HORAS.map(hora => (
                        <div key={hora} className="grade-row">
                            <div className="hora-label">{hora}</div>
                            {Array.from({ length: 7 }, (_, d) => {
                                const dia = new Date(ini)
                                dia.setDate(ini.getDate() + d)
                                const evs = agendamentos.filter(a => mesmoDia(a.inicio, dia) && a.hora === hora)
                                // Célula vazia de hoje em diante abre o cadastro já com data e hora
                                const livre = evs.length === 0 && dia >= inicioHoje
                                return (
                                    <div
                                        key={d}
                                        className={`celula ${livre ? 'celula--livre' : ''}`}
                                        onClick={livre ? () => abrirNovo(dataIsoLocal(dia), hora) : undefined}
                                        title={livre ? `Agendar ${formatarData(dia)} às ${hora}` : undefined}
                                    >
                                        {evs.map(e => (
                                            <div
                                                key={e.id}
                                                className={`evento evento--${e.tipo}`}
                                                style={{ height: `${e.duracao * 91 - 5}px` }}
                                                onClick={() => verAgendamento(e)}
                                            >
                                                <div className="evento-nome">{e.cliente}</div>
                                                <div className="evento-desc">{e.servico}</div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </>
        )
    }

    function renderMes() {
        const ref = new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1)
        const primeiroDia = ref.getDay()
        const ultimoDia = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
        const diasAnteriores = new Date(ref.getFullYear(), ref.getMonth(), 0).getDate()
        const restante = (7 - (primeiroDia + ultimoDia) % 7) % 7

        return (
            <div className="mes-grid">
                {DIAS_SEMANA.map(d => (
                    <div key={d} className="mes-dia-header">{d}</div>
                ))}
                {Array.from({ length: primeiroDia }, (_, i) => (
                    <div key={`ant-${i}`} className="mes-celula mes-celula--outro">
                        <div className="mes-dia-num">{diasAnteriores - primeiroDia + i + 1}</div>
                    </div>
                ))}
                {Array.from({ length: ultimoDia }, (_, i) => {
                    const d = i + 1
                    const dia = new Date(ref.getFullYear(), ref.getMonth(), d)
                    const ehHoje = mesmoDia(dia, hoje)
                    const evs = agendamentos.filter(a => mesmoDia(a.inicio, dia))
                    return (
                        <div key={d} className={`mes-celula ${ehHoje ? 'mes-celula--hoje' : ''}`}>
                            <div className="mes-dia-num">{d}</div>
                            {evs.map(e => (
                                <div key={e.id} className={`mes-evento mes-evento--${e.tipo}`} onClick={() => verAgendamento(e)}>
                                    {e.horario} {e.cliente}
                                </div>
                            ))}
                        </div>
                    )
                })}
                {Array.from({ length: restante }, (_, i) => (
                    <div key={`prox-${i}`} className="mes-celula mes-celula--outro">
                        <div className="mes-dia-num">{i + 1}</div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <main id="main-content" className="agenda-content">
            <div className="agenda-container">

                <h1 className="agenda-page-titulo">Agenda</h1>

                <div className="agenda-header">
                    <div className="agenda-nav">
                        <button className="btn-nav" onClick={() => setOffset(o => o - 1)} aria-label="Anterior">‹</button>
                        <span className="agenda-titulo">{view === 'semana' ? getTituloSemana() : getTituloMes()}</span>
                        <button className="btn-nav" onClick={() => setOffset(o => o + 1)} aria-label="Próximo">›</button>
                    </div>
                    <div className="agenda-acoes">
                        <div className="view-toggle">
                            <button className={`view-btn ${view === 'semana' ? 'ativo' : ''}`} onClick={() => { setView('semana'); setOffset(0) }}>Semana</button>
                            <button className={`view-btn ${view === 'mes' ? 'ativo' : ''}`} onClick={() => { setView('mes'); setOffset(0) }}>Mês</button>
                        </div>
                        <button className="btn-novo" onClick={() => abrirNovo()}>+ Novo agendamento</button>
                    </div>
                </div>

                <p className={`agenda-feedback ${feedback.type}`} aria-live="polite">
                    {carregando ? 'Carregando agendamentos...' : feedback.message}
                </p>

                <div className="agenda-grade-wrapper">
                    {view === 'semana' ? renderSemana() : renderMes()}
                </div>

                <div className="legenda">
                    <div className="legenda-item"><div className="legenda-cor legenda-cor--preventiva"></div>Preventiva</div>
                    <div className="legenda-item"><div className="legenda-cor legenda-cor--corretiva"></div>Corretiva</div>
                </div>

            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={fecharModal}>
                    <div className="modal-agenda" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalTipo === 'ver' ? 'Detalhes do agendamento' : 'Novo agendamento'}</h2>
                            <button onClick={fecharModal} aria-label="Fechar">✕</button>
                        </div>

                        <div className="modal-body">
                            {modalTipo === 'ver' && agendamentoSelecionado && (
                                <>
                                    <div className="input-group">
                                        <label>Cliente</label>
                                        <input type="text" value={agendamentoSelecionado.cliente} disabled />
                                    </div>
                                    <div className="input-group">
                                        <label>Veículo</label>
                                        <input type="text" value={agendamentoSelecionado.veiculo} disabled />
                                    </div>
                                    <div className="row">
                                        <div className="input-group">
                                            <label>Data</label>
                                            <input type="text" value={formatarData(agendamentoSelecionado.inicio)} disabled />
                                        </div>
                                        <div className="input-group">
                                            <label>Horário</label>
                                            <input type="text" value={`${agendamentoSelecionado.horario} (${agendamentoSelecionado.duracao}h)`} disabled />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-group">
                                            <label>Tipo</label>
                                            <input type="text" value={agendamentoSelecionado.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'} disabled />
                                        </div>
                                        <div className="input-group">
                                            <label>Serviço</label>
                                            <input type="text" value={agendamentoSelecionado.servico} disabled />
                                        </div>
                                    </div>
                                    {agendamentoSelecionado.observacoes && (
                                        <div className="input-group">
                                            <label>Observações</label>
                                            <textarea rows="3" value={agendamentoSelecionado.observacoes} disabled />
                                        </div>
                                    )}
                                </>
                            )}

                            {modalTipo === 'novo' && (
                                <>
                                    <p className="modal-secao-label">Tipo de cliente</p>
                                    <div className="tipo-cliente-btns">
                                        <button
                                            className={`btn-tipo-cliente ${tipoCliente === 'cadastrado' ? 'ativo' : ''}`}
                                            onClick={() => setTipoCliente('cadastrado')}>
                                            👤 Cliente cadastrado
                                        </button>
                                        <button
                                            className={`btn-tipo-cliente ${tipoCliente === 'novo' ? 'ativo' : ''}`}
                                            onClick={() => setTipoCliente('novo')}>
                                            👤 Novo cliente
                                        </button>
                                    </div>

                                    {tipoCliente === 'cadastrado' && (
                                        <>
                                            <div className="input-group agenda-busca-cliente">
                                                <label htmlFor="agenda-cliente">Cliente *</label>
                                                <input id="agenda-cliente" type="text" placeholder="Buscar cliente pelo nome..." autoComplete="off"
                                                    value={form.buscaCliente}
                                                    onChange={e => setForm(f => ({
                                                        ...f,
                                                        buscaCliente: e.target.value,
                                                        dropdownAberto: true,
                                                        clienteSelecionado: null,
                                                        veiculosCliente: [],
                                                        veiculoId: ''
                                                    }))} />
                                                {form.dropdownAberto && form.buscaCliente.trim() && (
                                                    <div className="agenda-dropdown">
                                                        {clientesFiltrados.length === 0 && (
                                                            <div className="agenda-dropdown-vazio">Nenhum cliente encontrado.</div>
                                                        )}
                                                        {clientesFiltrados.map(c => (
                                                            <button type="button" key={c.id} className="agenda-dropdown-item" onClick={() => selecionarCliente(c)}>
                                                                {c.nome}
                                                                {c.telefone && <span> — {formatarTelefone(c.telefone)}</span>}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="input-group">
                                                <label htmlFor="agenda-veiculo">Veículo *</label>
                                                <select id="agenda-veiculo" value={form.veiculoId} onChange={e => setField('veiculoId', e.target.value)}
                                                    disabled={!form.clienteSelecionado || form.carregandoVeiculos}>
                                                    <option value="">
                                                        {!form.clienteSelecionado ? 'Escolha o cliente primeiro'
                                                            : form.carregandoVeiculos ? 'Carregando veículos...'
                                                                : form.veiculosCliente.length === 0 ? 'Cliente sem veículo ativo'
                                                                    : 'Selecione...'}
                                                    </option>
                                                    {form.veiculosCliente.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                                </select>
                                                {form.erroVeiculos && <p className="agenda-feedback error">{form.erroVeiculos}</p>}
                                            </div>
                                        </>
                                    )}

                                    {tipoCliente === 'novo' && (
                                        <>
                                            <div className="row">
                                                <div className="input-group">
                                                    <label>Nome completo *</label>
                                                    <input type="text" placeholder="Ex: João Silva" maxLength={LIMITES_CLIENTE.nome}
                                                        value={form.novoCliente.nome} onChange={e => setNovoCliente('nome', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>CPF *</label>
                                                    <input type="text" inputMode="numeric" placeholder="Somente números" maxLength={11}
                                                        value={form.novoCliente.cpf} onChange={e => setNovoCliente('cpf', e.target.value.replace(/\D/g, ''))} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="input-group">
                                                    <label>Telefone *</label>
                                                    <input type="text" inputMode="numeric" placeholder="(11) 99999-9999"
                                                        value={formatarTelefone(form.novoCliente.telefone)} onChange={e => setNovoCliente('telefone', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>E-mail *</label>
                                                    <input type="email" placeholder="exemplo@email.com" maxLength={LIMITES_CLIENTE.email}
                                                        value={form.novoCliente.email} onChange={e => setNovoCliente('email', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="input-group">
                                                    <label>Placa *</label>
                                                    <div className="agenda-placa">
                                                        <input type="text" placeholder="ABC1D23" maxLength={LIMITES_VEICULO.placa}
                                                            value={form.novoVeiculo.placa} onChange={e => setNovoVeiculo('placa', e.target.value.toUpperCase())} />
                                                        <button type="button" className="btn-cancelar" onClick={consultarPlaca}>Consultar</button>
                                                    </div>
                                                </div>
                                                <div className="input-group">
                                                    <label>Combustível *</label>
                                                    <select value={form.novoVeiculo.tipoCombustivel} onChange={e => setNovoVeiculo('tipoCombustivel', e.target.value)}>
                                                        <option value="">Selecione...</option>
                                                        {TIPOS_COMBUSTIVEL.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="input-group">
                                                    <label>Marca *</label>
                                                    <input type="text" maxLength={LIMITES_VEICULO.marca}
                                                        value={form.novoVeiculo.marca} onChange={e => setNovoVeiculo('marca', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>Modelo *</label>
                                                    <input type="text" maxLength={LIMITES_VEICULO.modelo}
                                                        value={form.novoVeiculo.modelo} onChange={e => setNovoVeiculo('modelo', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="input-group">
                                                    <label>Ano *</label>
                                                    <input type="text" inputMode="numeric" maxLength={4}
                                                        value={form.novoVeiculo.ano} onChange={e => setNovoVeiculo('ano', e.target.value.replace(/\D/g, ''))} />
                                                </div>
                                                <div className="input-group">
                                                    <label>Quilometragem *</label>
                                                    <input type="text" inputMode="numeric"
                                                        value={form.novoVeiculo.km} onChange={e => setNovoVeiculo('km', e.target.value.replace(/\D/g, ''))} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <p className="modal-secao-label">Dados do agendamento</p>
                                    <div className="row">
                                        <div className="input-group">
                                            <label>Data *</label>
                                            <input type="date" min={dataIsoLocal(hoje)} value={form.data} onChange={e => setField('data', e.target.value)} />
                                        </div>
                                        <div className="input-group">
                                            <label>Horário *</label>
                                            <select value={form.hora} onChange={e => setField('hora', e.target.value)}>
                                                {HORAS.map(h => <option key={h}>{h}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="input-group">
                                            <label>Tipo *</label>
                                            <select value={form.tipo} onChange={e => setField('tipo', e.target.value)}>
                                                <option value="preventiva">Preventiva</option>
                                                <option value="corretiva">Corretiva</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>Duração</label>
                                            <select value={form.duracao} onChange={e => setField('duracao', e.target.value)}>
                                                <option value="1">1 hora</option>
                                                <option value="2">2 horas</option>
                                                <option value="3">3 horas</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Serviço *</label>
                                        <input type="text" placeholder="Ex: Troca de óleo" maxLength={LIMITE_SERVICO}
                                            value={form.servico} onChange={e => setField('servico', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Observações</label>
                                        <textarea placeholder="Observações adicionais..." rows="3" value={form.observacoes} onChange={e => setField('observacoes', e.target.value)} />
                                    </div>
                                </>
                            )}

                            {modalFeedback.message && (
                                <p className={`agenda-feedback ${modalFeedback.type}`} aria-live="polite">{modalFeedback.message}</p>
                            )}
                        </div>

                        <div className="modal-footer">
                            {modalTipo === 'ver' ? (
                                <>
                                    <button className="btn-cancelar-agendamento" onClick={cancelarSelecionado} disabled={cancelando}>
                                        {cancelando ? 'Cancelando...' : '🗑 Cancelar agendamento'}
                                    </button>
                                    <button className="btn-cancelar" onClick={fecharModal}>Fechar</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-cancelar" onClick={fecharModal}>Cancelar</button>
                                    <button className="btn-salvar" onClick={salvarAgendamento} disabled={salvando}>
                                        {salvando ? 'Salvando...' : 'Salvar agendamento'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
