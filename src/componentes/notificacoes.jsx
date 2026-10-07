import { useEffect, useRef, useState } from 'react'
import { FaUser, FaRedo, FaCheck, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa'
import { PaginacaoCursor } from './Paginacao'
import { STATUS_ORDEM_SERVICO, formatarStatusOrdem } from '../services/ordemServicoService'
import {
    TIPOS_NOTIFICACAO,
    TIPOS_SERVICO,
    listarNotificacoesPaginado,
    mapNotificacaoApiParaTela,
    marcarNotificacaoComoLida,
    reenviarNotificacao
} from '../services/notificacaoService'
import '../style/notificacoes.css'

const ITENS_POR_PAGINA = 8

const TIPOS = {
    todos: 'Todos os tipos',
    ...TIPOS_SERVICO,
}

const STATUS_OS = {
    todos: 'Todos os status',
    ...Object.fromEntries(STATUS_ORDEM_SERVICO.map(({ value, label }) => [value, label])),
}

function statusRevisao(dataIso) {
    if (!dataIso) return null

    const data = new Date(dataIso)
    data.setHours(0, 0, 0, 0)
    const dias = Math.ceil((data - new Date()) / (1000 * 60 * 60 * 24))
    if (dias < 0) return { texto: `Vencida há ${Math.abs(dias)} dias`, tipo: 'vencida' }
    if (dias === 0) return { texto: 'Vence hoje', tipo: 'hoje' }
    if (dias <= 7) return { texto: `Vence em ${dias} dias`, tipo: 'proxima' }
    return { texto: new Intl.DateTimeFormat('pt-BR').format(data), tipo: 'ok' }
}

function filtroLida(filtroStatus) {
    if (filtroStatus === 'lida') return true
    if (filtroStatus === 'nao-lida') return false
    return undefined
}

export function Notificacoes() {
    const [notificacoes, setNotificacoes] = useState([])
    const [filtroStatus, setFiltroStatus] = useState('todas')
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [filtroStatusOs, setFiltroStatusOs] = useState('todos')
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [reenviando, setReenviando] = useState(null)
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState('')

    // ── Paginação (cursor, no backend) ──
    // Não há "página N" no servidor: cada resposta traz o cursor da seguinte. Guardamos a
    // pilha de cursores visitados para o botão "Anterior" (cursores[i] abre a página i + 1).
    const [cursores, setCursores] = useState([null])
    const [indicePagina, setIndicePagina] = useState(0)
    const [proximoCursor, setProximoCursor] = useState(null)
    const ultimaRequisicao = useRef(0)

    async function carregarNotificacoes() {
        const requisicao = ++ultimaRequisicao.current
        setCarregando(true)

        try {
            const resposta = await listarNotificacoesPaginado({
                cursor: cursores[indicePagina],
                tamanho: ITENS_POR_PAGINA,
                lida: filtroLida(filtroStatus),
                tipoServico: filtroTipo,
                statusOs: filtroStatusOs,
                dataInicio,
                dataFim
            })

            // resposta de uma consulta antiga (usuário já mudou de filtro/página)
            if (requisicao !== ultimaRequisicao.current) return

            setNotificacoes(resposta.content.map(mapNotificacaoApiParaTela))
            setProximoCursor(resposta.nextPage)
            setErro('')
        } catch (error) {
            if (requisicao !== ultimaRequisicao.current) return
            console.error('Erro ao carregar notificações:', error)
            setNotificacoes([])
            setProximoCursor(null)
            setErro(error.message)
        } finally {
            if (requisicao === ultimaRequisicao.current) {
                setCarregando(false)
            }
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- busca no servidor ao mudar filtros/cursor
        carregarNotificacoes()
        // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega só quando filtros ou cursor mudam
    }, [filtroStatus, filtroTipo, filtroStatusOs, dataInicio, dataFim, cursores, indicePagina])

    function reiniciarPaginacao() {
        setCursores([null])
        setIndicePagina(0)
    }

    function irParaProxima() {
        setCursores(atuais => [...atuais.slice(0, indicePagina + 1), proximoCursor])
        setIndicePagina(indice => indice + 1)
    }

    function irParaAnterior() {
        setIndicePagina(indice => Math.max(indice - 1, 0))
    }

    async function marcarLida(id) {
        try {
            await marcarNotificacaoComoLida(id)
            await carregarNotificacoes()
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error)
            setErro(error.message)
        }
    }

    async function reenviar(id) {
        setReenviando(id)
        try {
            await reenviarNotificacao(id)
            await carregarNotificacoes()
        } catch (error) {
            console.error('Erro ao reenviar notificação:', error)
            setErro(error.message)
        } finally {
            setReenviando(null)
        }
    }

    function mudarFiltroStatus(novoFiltro) {
        setFiltroStatus(novoFiltro)
        reiniciarPaginacao()
    }

    function limparFiltros() {
        setFiltroStatus('todas')
        setFiltroTipo('todos')
        setFiltroStatusOs('todos')
        setDataInicio('')
        setDataFim('')
        reiniciarPaginacao()
    }

    return (
        <main id="main-content" className="notificacoes-content">
            <div className="container">
                <h1>Notificações enviadas</h1>

                <div className="notificacoes-filtros-wrapper">
                    <div className="notificacoes-filtros">
                        <button className={`btn-filtro ${filtroStatus === 'todas' ? 'ativo' : ''}`} onClick={() => mudarFiltroStatus('todas')}>Todas</button>
                        <button className={`btn-filtro ${filtroStatus === 'nao-lida' ? 'ativo' : ''}`} onClick={() => mudarFiltroStatus('nao-lida')}>Não lidas</button>
                        <button className={`btn-filtro ${filtroStatus === 'lida' ? 'ativo' : ''}`} onClick={() => mudarFiltroStatus('lida')}>Lidas</button>
                    </div>

                    <div className="notificacoes-filtros-avancados">
                        <select className="filtro-select" value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); reiniciarPaginacao() }}>
                            {Object.entries(TIPOS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <select className="filtro-select" value={filtroStatusOs} onChange={e => { setFiltroStatusOs(e.target.value); reiniciarPaginacao() }}>
                            {Object.entries(STATUS_OS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <div className="filtro-periodo">
                            <input type="date" className="filtro-data" value={dataInicio} onChange={e => { setDataInicio(e.target.value); reiniciarPaginacao() }} title="Data inicial" />
                            <span className="filtro-periodo-separador">até</span>
                            <input type="date" className="filtro-data" value={dataFim} onChange={e => { setDataFim(e.target.value); reiniciarPaginacao() }} title="Data final" />
                        </div>

                        <button className="btn-limpar-filtros" onClick={limparFiltros}>Limpar filtros</button>
                    </div>
                </div>

                {notificacoes.length === 0 ? (
                    <div className="notificacoes-vazia" aria-live="polite">
                        {erro || (carregando ? 'Carregando notificações...' : 'Nenhuma notificação encontrada.')}
                    </div>
                ) : (
                    <div className="notificacoes-lista">
                        {notificacoes.map(n => {
                            const status = statusRevisao(n.dataProximaRevisao)
                            return (
                                <div key={n.id} className={`notificacao-item ${n.lida ? 'notificacao-item--lida' : ''}`}>
                                    <div className="notificacao-avatar"><FaUser /></div>
                                    <div className="notificacao-info">
                                        <div className="notificacao-header">
                                            <span className="notificacao-cliente">{n.cliente}</span>
                                            {!n.lida && <span className="notificacao-badge-nao-lida"></span>}
                                            <span className="notificacao-tipo-badge">{TIPOS_SERVICO[n.tipoServico] ?? TIPOS_NOTIFICACAO[n.tipo] ?? n.tipo}</span>
                                            {n.statusOs && (
                                                <span className={`notificacao-status-badge notificacao-status-badge--${n.statusOs}`}>{formatarStatusOrdem(n.statusOs)}</span>
                                            )}
                                        </div>
                                        <p className="notificacao-detalhe">{[n.veiculo, n.telefone].filter(Boolean).join(' · ')}</p>
                                        <div className="notificacao-tags">
                                            <span className="notificacao-data"><FaPaperPlane /> {n.enviadaEm}</span>
                                            {status && (
                                                <span className={`notificacao-revisao notificacao-revisao--${status.tipo}`}>
                                                    <FaCalendarAlt /> Próxima revisão: {status.texto}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="notificacao-acoes">
                                        <button className="btn-reenviar" onClick={() => reenviar(n.id)} disabled={reenviando === n.id}>
                                            <FaRedo /> {reenviando === n.id ? 'Enviando...' : 'Reenviar'}
                                        </button>
                                        {!n.lida ? (
                                            <button className="btn-marcar-lida" onClick={() => marcarLida(n.id)}>
                                                <FaCheck /> Ciente
                                            </button>
                                        ) : (
                                            <span className="notificacao-lida-label"><FaCheck /> Ciente</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                <PaginacaoCursor
                    paginaAtual={indicePagina + 1}
                    temAnterior={indicePagina > 0}
                    temProxima={Boolean(proximoCursor)}
                    onAnterior={irParaAnterior}
                    onProxima={irParaProxima} />
            </div>
        </main>
    )
}
