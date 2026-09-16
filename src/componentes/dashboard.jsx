import { useMemo, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import { FaDollarSign, FaUsers } from 'react-icons/fa'
import '../style/dashboard.css'

const MESES_ATE_AGORA = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set']

const receitaPorPeriodo = {
    mensal: { valor: 58000, comparacao: '+38% vs set/2025' },
    semestral: { valor: 310000, comparacao: '+22% vs 1º sem. 2025' },
    anual: { valor: 512000, comparacao: '+19% vs 2025 até agora' }
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function Dashboard() {
    const [periodoReceita, setPeriodoReceita] = useState('mensal')
    const receitaAtual = receitaPorPeriodo[periodoReceita]

    const faturamentoMensalOptions = useMemo(() => ({
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        colors: ['#141D24', '#2e7d32'],
        plotOptions: { bar: { columnWidth: '45%', borderRadius: 6, distributed: true } },
        legend: { show: false },
        xaxis: {
            categories: ['Set 2025', 'Set 2026'],
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
    }), [])
    const faturamentoMensalSeries = [{ name: 'Faturamento', data: [42000, 58000] }]

    const evolucaoAnualOptions = useMemo(() => ({
        chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#141D24', '#2e7d32'],
        markers: { size: 5 },
        xaxis: {
            categories: MESES_ATE_AGORA,
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
    }), [])
    const evolucaoAnualSeries = [
        { name: '2025', data: [38000, 41000, 39500, 44000, 47000, 45500, 51000, 53500, 52000] },
        { name: '2026', data: [43000, 46500, 48000, 50500, 53000, 55500, 57000, 60000, 58000] }
    ]

    const servicoOptions = useMemo(() => ({
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        colors: ['#141D24', '#2e7d32'],
        plotOptions: { bar: { columnWidth: '45%', borderRadius: 6 } },
        xaxis: {
            categories: ['Preventiva', 'Corretiva'],
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
    }), [])
    const servicoSeries = [
        { name: 'Esperado', data: [40, 25] },
        { name: 'Realizado', data: [35, 30] }
    ]

    return (
        <main id="main-content">
            <div className="dashboard-container">
                <h1>Painel financeiros</h1>

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
                            <span className="card-trend up">{receitaAtual.comparacao}</span>
                        </div>
                    </div>

                    <div className="indicator-card">
                        <div className="card-icon"><FaUsers /></div>
                        <div className="card-info">
                            <span className="card-label">Clientes cadastrados</span>
                            <span className="card-value">184</span>
                            <span className="card-trend up">+12 desde o mês passado</span>
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