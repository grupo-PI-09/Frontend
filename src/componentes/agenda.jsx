import { useState } from 'react'
import '../style/agenda.css'

const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES_NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const agendamentosMock = [
    { id: 1, cliente: 'João Silva', veiculo: 'Honda Civic (ABC-1234)', tipo: 'preventiva', servico: 'Revisão preventiva', hora: '08:00', duracao: 1, diaSemana: 1, dia: new Date().getDate(), mes: new Date().getMonth(), ano: new Date().getFullYear() },
    { id: 2, cliente: 'Maria Oliveira', veiculo: 'Toyota Corolla (XYZ-5678)', tipo: 'corretiva', servico: 'Troca de pastilhas', hora: '10:00', duracao: 1, diaSemana: 1, dia: new Date().getDate(), mes: new Date().getMonth(), ano: new Date().getFullYear() },
    { id: 3, cliente: 'Carlos Santos', veiculo: 'Fiat Strada (DEF-9012)', tipo: 'corretiva', servico: 'Diagnóstico elétrico', hora: '09:00', duracao: 2, diaSemana: 2, dia: new Date().getDate() + 1, mes: new Date().getMonth(), ano: new Date().getFullYear() },
    { id: 4, cliente: 'Ana Paula', veiculo: 'Chevrolet Onix (GHI-3456)', tipo: 'preventiva', servico: 'Troca de óleo', hora: '14:00', duracao: 1, diaSemana: 3, dia: new Date().getDate() + 2, mes: new Date().getMonth(), ano: new Date().getFullYear() },
    { id: 5, cliente: 'Pedro Lima', veiculo: 'VW Golf (JKL-7890)', tipo: 'corretiva', servico: 'Suspensão dianteira', hora: '11:00', duracao: 2, diaSemana: 4, dia: new Date().getDate() + 3, mes: new Date().getMonth(), ano: new Date().getFullYear() },
    { id: 6, cliente: 'Fernanda Costa', veiculo: 'HB20 (MNO-2345)', tipo: 'preventiva', servico: 'Revisão completa', hora: '08:00', duracao: 2, diaSemana: 5, dia: new Date().getDate() + 4, mes: new Date().getMonth(), ano: new Date().getFullYear() },
    { id: 7, cliente: 'Ricardo Mendes', veiculo: 'Kwid (PQR-6789)', tipo: 'corretiva', servico: 'Freios', hora: '15:00', duracao: 1, diaSemana: 5, dia: new Date().getDate() + 4, mes: new Date().getMonth(), ano: new Date().getFullYear() },
]

export function Agenda() {
    const [agendamentos, setAgendamentos] = useState(agendamentosMock)
    const [offset, setOffset] = useState(0)
    const [view, setView] = useState('semana')
    const [modalOpen, setModalOpen] = useState(false)
    const [modalTipo, setModalTipo] = useState('ver')
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null)
    const [tipoCliente, setTipoCliente] = useState('cadastrado')
    const [form, setForm] = useState({
        cliente: '', veiculo: '', nomeNovo: '', telefoneNovo: '', veiculoNovo: '',
        data: '', hora: '08:00', tipo: 'preventiva', duracao: '1', servico: '', observacoes: ''
    })

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

    function verAgendamento(ag) {
        setAgendamentoSelecionado(ag)
        setModalTipo('ver')
        setModalOpen(true)
    }

    function abrirNovo() {
        setAgendamentoSelecionado(null)
        setTipoCliente('cadastrado')
        setForm({ cliente: '', veiculo: '', nomeNovo: '', telefoneNovo: '', veiculoNovo: '', data: '', hora: '08:00', tipo: 'preventiva', duracao: '1', servico: '', observacoes: '' })
        setModalTipo('novo')
        setModalOpen(true)
    }

    function cancelarAgendamento() {
        if (!agendamentoSelecionado) return
        setAgendamentos(prev => prev.filter(a => a.id !== agendamentoSelecionado.id))
        setModalOpen(false)
    }

    const hoje = new Date()

    function renderSemana() {
        const ini = getInicioSemana(offset)
        const hojeStr = `${hoje.getFullYear()}-${hoje.getMonth()}-${hoje.getDate()}`

        return (
            <>
                <div className="dias-header">
                    <div className="hora-label-header"></div>
                    {Array.from({ length: 7 }, (_, d) => {
                        const dia = new Date(ini)
                        dia.setDate(ini.getDate() + d)
                        const ds = `${dia.getFullYear()}-${dia.getMonth()}-${dia.getDate()}`
                        const ehHoje = ds === hojeStr
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
                                const evs = agendamentos.filter(a => a.diaSemana === d && a.hora === hora)
                                return (
                                    <div key={d} className="celula">
                                        {evs.map(e => (
                                            <div
                                                key={e.id}
                                                className={`evento evento--${e.tipo}`}
                                                style={{ height: `${e.duracao * 56}px` }}
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
                    const ehHoje = d === hoje.getDate() && ref.getMonth() === hoje.getMonth() && ref.getFullYear() === hoje.getFullYear()
                    const evs = agendamentos.filter(a => a.mes === ref.getMonth() && a.ano === ref.getFullYear() && a.dia === d)
                    return (
                        <div key={d} className={`mes-celula ${ehHoje ? 'mes-celula--hoje' : ''}`}>
                            <div className="mes-dia-num">{d}</div>
                            {evs.map(e => (
                                <div key={e.id} className={`mes-evento mes-evento--${e.tipo}`} onClick={() => verAgendamento(e)}>
                                    {e.hora} {e.cliente}
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
                        <button className="btn-novo" onClick={abrirNovo}>+ Novo agendamento</button>
                    </div>
                </div>

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
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-agenda" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalTipo === 'ver' ? 'Detalhes do agendamento' : 'Novo agendamento'}</h2>
                            <button onClick={() => setModalOpen(false)} aria-label="Fechar">✕</button>
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
                                            <label>Horário</label>
                                            <input type="text" value={agendamentoSelecionado.hora} disabled />
                                        </div>
                                        <div className="input-group">
                                            <label>Tipo</label>
                                            <input type="text" value={agendamentoSelecionado.tipo === 'preventiva' ? 'Preventiva' : 'Corretiva'} disabled />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label>Serviço</label>
                                        <input type="text" value={agendamentoSelecionado.servico} disabled />
                                    </div>
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
                                            <div className="input-group">
                                                <label>Cliente *</label>
                                                <input type="text" placeholder="Buscar cliente pelo nome..." value={form.cliente} onChange={e => setField('cliente', e.target.value)} />
                                            </div>
                                            <div className="input-group">
                                                <label>Veículo *</label>
                                                <select value={form.veiculo} onChange={e => setField('veiculo', e.target.value)}>
                                                    <option value="">Selecione...</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {tipoCliente === 'novo' && (
                                        <>
                                            <div className="row">
                                                <div className="input-group">
                                                    <label>Nome completo *</label>
                                                    <input type="text" placeholder="Ex: João Silva" value={form.nomeNovo} onChange={e => setField('nomeNovo', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>Telefone *</label>
                                                    <input type="text" placeholder="(11) 99999-9999" value={form.telefoneNovo} onChange={e => setField('telefoneNovo', e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>Veículo *</label>
                                                <input type="text" placeholder="Ex: Honda Civic (ABC-1234)" value={form.veiculoNovo} onChange={e => setField('veiculoNovo', e.target.value)} />
                                            </div>
                                        </>
                                    )}

                                    <p className="modal-secao-label">Dados do agendamento</p>
                                    <div className="row">
                                        <div className="input-group">
                                            <label>Data *</label>
                                            <input type="date" value={form.data} onChange={e => setField('data', e.target.value)} />
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
                                        <input type="text" placeholder="Ex: Troca de óleo" value={form.servico} onChange={e => setField('servico', e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Observações</label>
                                        <textarea placeholder="Observações adicionais..." rows="3" value={form.observacoes} onChange={e => setField('observacoes', e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            {modalTipo === 'ver' ? (
                                <>
                                    <button className="btn-cancelar-agendamento" onClick={cancelarAgendamento}>🗑 Cancelar agendamento</button>
                                    <button className="btn-cancelar" onClick={() => setModalOpen(false)}>Fechar</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-cancelar" onClick={() => setModalOpen(false)}>Cancelar</button>
                                    <button className="btn-salvar" onClick={() => setModalOpen(false)}>Salvar agendamento</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}