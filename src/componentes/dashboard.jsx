import { useEffect, useMemo, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import { FaDollarSign, FaUsers } from 'react-icons/fa'
import { buscarResumoDashboard } from '../services/dashboardService'
import '../style/dashboard.css'

function formatarMoeda(valor) {
    return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function classeTendencia(valor) {
    if (valor > 0) return 'up'
    if (valor < 0) return 'down'
    return 'neutral'
}

const PERIODO_VAZIO = { valor: 0, comparacao: '', variacaoPercentual: null }

export function Dashboard() {
    const [periodoReceita, setPeriodoReceita] = useState('mensal')
    const [resumo, setResumo] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        let ativo = true

        async function carregar() {
            setCarregando(true)
            try {
                const dados = await buscarResumoDashboard()
                if (ativo) {
                    setResumo(dados)
                    setErro('')
                }
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error)
                if (ativo) setErro(error.message || 'Não foi possível carregar a dashboard.')
            } finally {
                if (ativo) setCarregando(false)
            }
        }

        carregar()
        return () => { ativo = false }
    }, [])

    const receitaAtual = resumo?.faturamento?.[periodoReceita] ?? PERIODO_VAZIO
    const totalClientes = resumo?.totalClientes ?? 0
    const novosClientesMes = resumo?.novosClientesMes ?? 0
    const comparativo = useMemo(() => resumo?.faturamentoMensalComparativo ?? [], [resumo])
    const evolucao = resumo?.evolucaoFaturamento
    const servicosPorTipo = useMemo(() => resumo?.servicosPorTipo?.tipos ?? [], [resumo])

    const faturamentoMensalOptions = useMemo(() => ({
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        colors: ['#141D24', '#2e7d32'],
        plotOptions: { bar: { columnWidth: '45%', borderRadius: 6, distributed: true } },
        legend: { show: false },
        xaxis: {
            categories: comparativo.map(ponto => ponto.label),
            labels: { style: { fontSize: '20px' } }
        },
        yaxis: {
            labels: {
                formatter: (val) => `R$${(val / 1000).toFixed(0)}k`,
                style: { fontSize: '20px' }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => formatarMoeda(val),
            style: { colors: ['#fff'], fontSize: '20px' }
        },
        grid: { borderColor: '#c5bdbd' }
    }), [comparativo])
    const faturamentoMensalSeries = [{ name: 'Faturamento', data: comparativo.map(ponto => ponto.valor) }]

    const evolucaoAnualOptions = useMemo(() => ({
        chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#141D24', '#2e7d32'],
        markers: { size: 5 },
        xaxis: {
            categories: evolucao?.meses ?? [],
            labels: { style: { fontSize: '20px' } }
        },
        yaxis: {
            labels: {
                formatter: (val) => `R$${(val / 1000).toFixed(0)}k`,
                style: { fontSize: '20px' }
            }
        },
        legend: {
            show: true,
            position: 'top',
            fontSize: '20px',
            labels: { colors: '#141D24' }
        },
        grid: { borderColor: '#c5bdbd' }
    }), [evolucao])
    const evolucaoAnualSeries = evolucao ? [
        { name: String(evolucao.anoAnterior), data: evolucao.acumuladoAnoAnterior },
        { name: String(evolucao.anoAtual), data: evolucao.acumuladoAnoAtual }
    ] : []

    const servicoOptions = useMemo(() => ({
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        colors: ['#141D24', '#2e7d32'],
        plotOptions: { bar: { columnWidth: '45%', borderRadius: 6 } },
        xaxis: {
            categories: servicosPorTipo.map(tipo => tipo.label),
            labels: { style: { fontSize: '20px' } }
        },
        yaxis: { labels: { style: { fontSize: '20px' } } },
        legend: {
            show: true,
            position: 'top',
            fontSize: '18px',
            labels: { colors: '#141D24' }
        },
        dataLabels: { enabled: true, style: { fontSize: '20px' } },
        grid: { borderColor: '#c5bdbd' }
    }), [servicosPorTipo])
    const servicoSeries = [
        { name: 'Esperado', data: servicosPorTipo.map(tipo => tipo.esperado) },
        { name: 'Realizado', data: servicosPorTipo.map(tipo => tipo.realizado) }
    ]

    return (
        <main id="main-content">
            <div className="dashboard-container">
                <h1>Painel financeiros</h1>

                {(carregando || erro) && (
                    <p className={`dashboard-feedback ${erro ? 'error' : ''}`} aria-live="polite">
                        {carregando ? 'Carregando dados...' : erro}
                    </p>
                )}

                <div className="cards-grid cards-grid--financeira">
                    <div className="indicator-card">
                        <div className="card-icon"><FaDollarSign /></div>
                        <div className="card-info">
                            <div className="card-info-header">
                                <span className="card-label">Faturamento</span>
                                <div className="periodo-toggle">
                                    <button
                                        className={`periodo-btn ${periodoReceita === 'mensal' ? 'ativo' : ''}`}
                                        onClick={() => setPeriodoReceita('mensal')}>Mensal</button>
                                    <button
                                        className={`periodo-btn ${periodoReceita === 'semestral' ? 'ativo' : ''}`}
                                        onClick={() => setPeriodoReceita('semestral')}>Semestral</button>
                                    <button
                                        className={`periodo-btn ${periodoReceita === 'anual' ? 'ativo' : ''}`}
                                        onClick={() => setPeriodoReceita('anual')}>Anual</button>
                                </div>
                            </div>
                            <span className="card-value">{formatarMoeda(receitaAtual.valor)}</span>
                            <span className={`card-trend ${classeTendencia(receitaAtual.variacaoPercentual)}`}>
                                {receitaAtual.comparacao}
                            </span>
                        </div>
                    </div>

                    <div className="indicator-card">
                        <div className="card-icon"><FaUsers /></div>
                        <div className="card-info">
                            <span className="card-label">Clientes cadastrados</span>
                            <span className="card-value">{totalClientes}</span>
                            <span className={`card-trend ${classeTendencia(novosClientesMes)}`}>
                                {novosClientesMes > 0 ? `+${novosClientesMes}` : novosClientesMes} desde o mês passado
                            </span>
                        </div>
                    </div>
                </div>

                <div className="charts-row charts-row--financeira">
                    <div className="chart-card-bottom">
                        <span className="chart-title">Faturamento mensal — comparativo anual</span>
                        <ReactApexChart options={faturamentoMensalOptions} series={faturamentoMensalSeries} type="bar" height={480} />
                    </div>
                    <div className="chart-card-bottom">
                        <span className="chart-title">Evolução do faturamento acumulado</span>
                        <ReactApexChart options={evolucaoAnualOptions} series={evolucaoAnualSeries} type="line" height={480} />
                    </div>
                    <div className="chart-card-bottom">
                        <span className="chart-title">Preventiva vs corretiva — esperado x realizado</span>
                        <ReactApexChart options={servicoOptions} series={servicoSeries} type="bar" height={480} />
                    </div>
                </div>
            </div>
        </main>
    )
}
