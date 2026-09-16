import { useState } from 'react'
import { FaUser, FaRedo, FaCheck, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa'
import { Paginacao } from './Paginacao'
import '../style/notificacoes.css'

const ITENS_POR_PAGINA = 8

const TIPOS = {
    todos: 'Todos os tipos',
    preventiva: 'Preventiva',
    corretiva: 'Corretiva',
}

const STATUS_OS = {
    todos: 'Todos os status',
    em_andamento: 'Em andamento',
    finalizada: 'Finalizada',
    aberta: 'Aberta',
}

const notificacoesMock = [
    { id: 1, cliente: 'João da Silva', telefone: '(11) 99999-1234', veiculo: 'Honda Civic (ABC-1234)', enviadaEm: '10/05/2026', proximaRevisao: '10/07/2026', lida: false, tipo: 'preventiva', statusOs: 'finalizada' },
    { id: 2, cliente: 'Maria Oliveira', telefone: '(11) 98888-5678', veiculo: 'Toyota Corolla (XYZ-5678)', enviadaEm: '09/05/2026', proximaRevisao: '09/05/2026', lida: false, tipo: 'corretiva', statusOs: 'em_andamento' },
    { id: 3, cliente: 'Carlos Santos', telefone: '(11) 97777-9012', veiculo: 'Fiat Strada (DEF-9012)', enviadaEm: '08/05/2026', proximaRevisao: '08/04/2026', lida: true, tipo: 'corretiva', statusOs: 'aberta' },
    { id: 4, cliente: 'Ana Paula', telefone: '(11) 96666-3456', veiculo: 'Chevrolet Onix (GHI-3456)', enviadaEm: '07/05/2026', proximaRevisao: '07/08/2026', lida: false, tipo: 'preventiva', statusOs: 'aberta' },
    { id: 5, cliente: 'Pedro Lima', telefone: '(11) 95555-7890', veiculo: 'Volkswagen Golf (JKL-7890)', enviadaEm: '06/05/2026', proximaRevisao: '06/05/2026', lida: false, tipo: 'corretiva', statusOs: 'em_andamento' },
    { id: 6, cliente: 'Fernanda Costa', telefone: '(11) 94444-2345', veiculo: 'Hyundai HB20 (MNO-2345)', enviadaEm: '05/05/2026', proximaRevisao: '05/09/2026', lida: true, tipo: 'preventiva', statusOs: 'finalizada' },
    { id: 7, cliente: 'Ricardo Mendes', telefone: '(11) 93333-6789', veiculo: 'Renault Kwid (PQR-6789)', enviadaEm: '04/05/2026', proximaRevisao: '04/11/2026', lida: false, tipo: 'preventiva', statusOs: 'aberta' },
    { id: 8, cliente: 'Luciana Ferreira', telefone: '(11) 92222-0123', veiculo: 'Fiat Argo (STU-0123)', enviadaEm: '03/05/2026', proximaRevisao: '03/04/2026', lida: true, tipo: 'corretiva', statusOs: 'finalizada' },
    { id: 9, cliente: 'Bruno Alves', telefone: '(11) 91111-4567', veiculo: 'Jeep Renegade (VWX-4567)', enviadaEm: '02/05/2026', proximaRevisao: '02/08/2026', lida: false, tipo: 'corretiva', statusOs: 'em_andamento' },
    { id: 10, cliente: 'Camila Rocha', telefone: '(11) 90000-8901', veiculo: 'Nissan Kicks (YZA-8901)', enviadaEm: '01/05/2026', proximaRevisao: '01/10/2026', lida: true, tipo: 'preventiva', statusOs: 'em_andamento' },
]

function parseData(str) {
    const [d, m, y] = str.split('/').map(Number)
    return new Date(y, m - 1, d)
}

function statusRevisao(dataStr) {
    const hoje = new Date()
    const data = parseData(dataStr)
    const dias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24))
    if (dias < 0) return { texto: `Vencida há ${Math.abs(dias)} dias`, tipo: 'vencida' }
    if (dias === 0) return { texto: 'Vence hoje', tipo: 'hoje' }
    if (dias <= 7) return { texto: `Vence em ${dias} dias`, tipo: 'proxima' }
    return { texto: dataStr, tipo: 'ok' }
}

export function Notificacoes() {
    const [notificacoes, setNotificacoes] = useState(notificacoesMock)
    const [filtroStatus, setFiltroStatus] = useState('todas')
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [filtroStatusOs, setFiltroStatusOs] = useState('todos')
    const [dataInicio, setDataInicio] = useState('')
    const [dataFim, setDataFim] = useState('')
    const [reenviando, setReenviando] = useState(null)
    const [paginaAtual, setPaginaAtual] = useState(1)

    const filtradas = notificacoes.filter(n => {
        if (filtroStatus === 'lida' && !n.lida) return false
        if (filtroStatus === 'nao-lida' && n.lida) return false
        if (filtroTipo !== 'todos' && n.tipo !== filtroTipo) return false
        if (filtroStatusOs !== 'todos' && n.statusOs !== filtroStatusOs) return false
        if (dataInicio && parseData(n.enviadaEm) < parseData(dataInicio.split('-').reverse().join('/'))) return false
        if (dataFim && parseData(n.enviadaEm) > parseData(dataFim.split('-').reverse().join('/'))) return false
        return true
    })

    const totalPaginas = Math.ceil(filtradas.length / ITENS_POR_PAGINA)
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    const paginadas = filtradas.slice(inicio, inicio + ITENS_POR_PAGINA)

    const naoLidas = notificacoes.filter(n => !n.lida).length

    function marcarLida(id) {
        setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
    }

    function reenviar(id) {
        setReenviando(id)
        setTimeout(() => {
            setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: false } : n))
            setReenviando(null)
        }, 1200)
    }

    function mudarFiltroStatus(novoFiltro) {
        setFiltroStatus(novoFiltro)
        setPaginaAtual(1)
    }

    function limparFiltros() {
        setFiltroStatus('todas')
        setFiltroTipo('todos')
        setFiltroStatusOs('todos')
        setDataInicio('')
        setDataFim('')
        setPaginaAtual(1)
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
                        <select className="filtro-select" value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPaginaAtual(1) }}>
                            {Object.entries(TIPOS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <select className="filtro-select" value={filtroStatusOs} onChange={e => { setFiltroStatusOs(e.target.value); setPaginaAtual(1) }}>
                            {Object.entries(STATUS_OS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>

                        <div className="filtro-periodo">
                            <input type="date" className="filtro-data" value={dataInicio} onChange={e => { setDataInicio(e.target.value); setPaginaAtual(1) }} title="Data inicial" />
                            <span className="filtro-periodo-separador">até</span>
                            <input type="date" className="filtro-data" value={dataFim} onChange={e => { setDataFim(e.target.value); setPaginaAtual(1) }} title="Data final" />
                        </div>

                        <button className="btn-limpar-filtros" onClick={limparFiltros}>Limpar filtros</button>
                    </div>
                </div>

                {paginadas.length === 0 ? (
                    <div className="notificacoes-vazia">Nenhuma notificação encontrada.</div>
                ) : (
                    <div className="notificacoes-lista">
                        {paginadas.map(n => {
                            const status = statusRevisao(n.proximaRevisao)
                            return (
                                <div key={n.id} className={`notificacao-item ${n.lida ? 'notificacao-item--lida' : ''}`}>
                                    <div className="notificacao-avatar"><FaUser /></div>
                                    <div className="notificacao-info">
                                        <div className="notificacao-header">
                                            <span className="notificacao-cliente">{n.cliente}</span>
                                            {!n.lida && <span className="notificacao-badge-nao-lida"></span>}
                                            <span className="notificacao-tipo-badge">{TIPOS[n.tipo]}</span>
                                            <span className={`notificacao-status-badge notificacao-status-badge--${n.statusOs}`}>{STATUS_OS[n.statusOs]}</span>
                                        </div>
                                        <p className="notificacao-detalhe">{n.veiculo} · {n.telefone}</p>
                                        <div className="notificacao-tags">
                                            <span className="notificacao-data"><FaPaperPlane /> {n.enviadaEm}</span>
                                            <span className={`notificacao-revisao notificacao-revisao--${status.tipo}`}>
                                                <FaCalendarAlt /> Próxima revisão: {status.texto}
                                            </span>
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

                <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas} onChange={setPaginaAtual} />
            </div>
        </main>
    )
}