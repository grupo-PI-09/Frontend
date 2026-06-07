import { useEffect, useMemo, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import { FaDollarSign, FaUserPlus, FaBell } from 'react-icons/fa'
import { buscarResumoDashboard, formatarMoedaDashboard } from '../services/dashboardService'
import '../style/dashboard.css'

const resumoInicial = {
    totalClientes: 0,
    totalVeiculos: 0,
    totalOrdensServico: 0,
    totalOrdensAbertasEmAndamento: 0,
    totalOrdensFinalizadas: 0,
    ordensFinalizadasMes: 0,
    novosClientesMes: 0,
    proximasRevisoes: 0,
    notificacoesEnviadas: 0,
    faturamentoTotal: 0,
    faturamentoMes: 0,
    ultimasOrdens: [],
    servicosProximosRevisao: [],
    finalizacoesUltimosMeses: [],
    faturamentoUltimosMeses: [],
    revisoesPreventivasUltimosMeses: []
}

function valoresSerie(lista, campo = 'valor') {
    return (lista ?? []).map(item => Number(item[campo] ?? 0))
}

function labelsSerie(lista) {
    return (lista ?? []).map(item => item.label ?? '')
}

export function Dashboard() {
    const [resumo, setResumo] = useState(resumoInicial)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    useEffect(() => {
        let ativo = true

        async function carregarResumo(mostrarLoading = true) {
            if (mostrarLoading) {
                setCarregando(true)
            }
            setErro('')

            try {
                const dados = await buscarResumoDashboard()
                if (ativo) {
                    setResumo({ ...resumoInicial, ...dados })
                }
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error)
                if (ativo) {
                    setResumo(resumoInicial)
                    setErro(error.message)
                }
            } finally {
                if (ativo) {
                    setCarregando(false)
                }
            }
        }

        carregarResumo()

        function atualizarAoRetornar() {
            if (document.visibilityState === 'visible') {
                carregarResumo(false)
            }
        }

        window.addEventListener('focus', atualizarAoRetornar)
        document.addEventListener('visibilitychange', atualizarAoRetornar)
        const intervalo = window.setInterval(() => carregarResumo(false), 30000)

        return () => {
            ativo = false
            window.removeEventListener('focus', atualizarAoRetornar)
            document.removeEventListener('visibilitychange', atualizarAoRetornar)
            window.clearInterval(intervalo)
        }
    }, [])

    const categoriasFinalizacoes = labelsSerie(resumo.finalizacoesUltimosMeses)
    const categoriasFaturamento = labelsSerie(resumo.faturamentoUltimosMeses)
    const categoriasRevisoes = labelsSerie(resumo.revisoesPreventivasUltimosMeses)

    const lineChartOptions = useMemo(() => ({
        chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'straight', width: 2 },
        colors: ['#546E7A'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.8,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        xaxis: {
            categories: categoriasFinalizacoes,
            labels: { style: { fontSize: '18px' } }
        },
        yaxis: { labels: { style: { fontSize: '18px' } } },
        grid: { borderColor: '#c5bdbd', padding: { left: 20 } },
        dataLabels: {
            enabled: true,
            style: { fontSize: '20px', colors: ['#546E7A'] },
            background: { enabled: false },
            offsetY: -10,
        },
        markers: {
            size: 8,
            shape: 'circle',
            strokeWidth: 0,
            strokeColors: 'transparent',
            fillOpacity: 1,
            hover: { size: 16 }
        },
        tooltip: { enabled: true }
    }), [categoriasFinalizacoes])

    const barChartOptions = useMemo(() => ({
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', stacked: true },
        colors: ['#546E7A', '#B0BEC5'],
        xaxis: {
            categories: categoriasRevisoes,
            labels: { style: { fontSize: '18px' } }
        },
        yaxis: { labels: { style: { fontSize: '18px' } } },
        dataLabels: {
            enabled: true,
            formatter: (val, opts) => opts.seriesIndex === 0 ? val : '',
            style: { colors: ['#fff'], fontSize: '19px' }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'last'
            }
        },
        legend: {
            show: true,
            position: 'top',
            fontSize: '18px',
            labels: { colors: '#141D24' }
        },
        grid: { borderColor: '#c5bdbd' }
    }), [categoriasRevisoes])

    const revenueChartOptions = useMemo(() => ({
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        colors: ['#546E7A'],
        xaxis: {
            categories: categoriasFaturamento,
            labels: { style: { fontSize: '18px' } }
        },
        yaxis: {
            labels: {
                formatter: (val) => `R$${(val / 1000).toFixed(0)}k`,
                style: { fontSize: '18px' }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${(val / 1000).toFixed(0)}k`,
            style: { colors: ['#fff'], fontSize: '18px' },
            offsetY: 0,
        },
        plotOptions: {
            bar: {
                dataLabels: { position: 'center' },
                borderRadius: 6,
                borderRadiusApplication: 'end'
            }
        },
        legend: { show: false },
        grid: { borderColor: '#c5bdbd' }
    }), [categoriasFaturamento])

    const daltonico = document.body.classList.contains('daltonico')

    const statusColor = daltonico ? {
        'Em andamento': '#0072B2',
        'Aguardando aprovação': '#0072B2',
        'Aguardando peça': '#0072B2',
        'Finalizada': '#009E73',
        'Aberta': '#E69F00',
        'Cancelada': '#D55E00',
    } : {
        'Em andamento': '#1565C0',
        'Aguardando aprovação': '#1565C0',
        'Aguardando peça': '#1565C0',
        'Finalizada': '#2e7d32',
        'Aberta': '#546E7A',
        'Cancelada': '#c62828',
    }

    const cards = [
        {
            label: 'Faturamento do mês',
            value: carregando ? '...' : formatarMoedaDashboard(resumo.faturamentoMes),
            trend: carregando ? 'Carregando dados' : `Total: ${formatarMoedaDashboard(resumo.faturamentoTotal)}`,
            up: null,
            icon: <FaDollarSign />
        },
        {
            label: 'Clientes e veículos',
            value: carregando ? '...' : `${resumo.totalClientes} clientes`,
            trend: carregando ? 'Carregando dados' : `${resumo.novosClientesMes} novos no mês • ${resumo.totalVeiculos} veículos`,
            up: null,
            icon: <FaUserPlus />
        },
        {
            label: 'Ordens e revisões',
            value: carregando ? '...' : `${resumo.totalOrdensServico} O.S.`,
            trend: carregando ? 'Carregando dados' : `${resumo.totalOrdensAbertasEmAndamento} abertas • ${resumo.proximasRevisoes} revisões próximas`,
            up: null,
            icon: <FaBell />
        },
    ]

    const ultimasOS = resumo.ultimasOrdens ?? []
    const outrasOrdens = Math.max(
        resumo.totalOrdensServico - resumo.totalOrdensFinalizadas - resumo.totalOrdensAbertasEmAndamento,
        0
    )
    const possuiOrdens = resumo.totalOrdensServico > 0
    const pieChartSeries = possuiOrdens
        ? [resumo.totalOrdensFinalizadas, resumo.totalOrdensAbertasEmAndamento, outrasOrdens]
        : [1]
    const pieChartLabels = possuiOrdens
        ? ['Finalizadas', 'Abertas/em andamento', 'Outras']
        : ['Sem dados']

    const pieChartOptions = {
        chart: { type: 'pie', background: 'transparent' },
        colors: possuiOrdens ? ['#476370', '#7e95a0', '#CFD8DC'] : ['#CFD8DC'],
        labels: pieChartLabels,
        legend: {
            position: 'right',
            fontSize: '20px',
            labels: { colors: '#141D24' },
            formatter: (seriesName) => seriesName,
        },
        dataLabels: {
            enabled: true,
            style: { fontSize: '20px' },
            formatter: (val) => possuiOrdens ? `${val.toFixed(0)}%` : '0%'
        },
        tooltip: { enabled: false },
    }

    const lineChartSeries = [{ name: 'O.S. finalizadas', data: valoresSerie(resumo.finalizacoesUltimosMeses) }]
    const barChartSeries = [
        { name: 'Realizado', data: valoresSerie(resumo.revisoesPreventivasUltimosMeses, 'realizadas') },
        { name: 'Estimativa', data: valoresSerie(resumo.revisoesPreventivasUltimosMeses, 'estimadas') }
    ]
    const revenueChartSeries = [{ name: 'Receita', data: valoresSerie(resumo.faturamentoUltimosMeses) }]

    return (
        <main id="main-content">
            <div className="dashboard-container">
                <h1>Painel de indicadores da oficina</h1>

                {(carregando || erro) && (
                    <p className={`feedback dashboard-feedback ${erro ? 'error' : 'success'}`} aria-live="polite">
                        {erro || 'Carregando indicadores da dashboard...'}
                    </p>
                )}

                <div className="dashboard-top">

                    <div className="cards-grid">
                        {cards.map((card, i) => (
                            <div className="indicator-card" key={i}>
                                <div className="card-icon">{card.icon}</div>
                                <div className="card-info">
                                    <span className="card-label">{card.label}</span>
                                    <span className="card-value">{card.value}</span>
                                    <span className={`card-trend ${card.up === true ? 'up' : card.up === false ? 'down' : 'neutral'}`}>
                                        {card.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="chart-card">
                        <span className="chart-title">Status das Ordens de Serviço</span>
                        <ReactApexChart options={pieChartOptions} series={pieChartSeries} type="pie" height={230} />
                    </div>

                    <div className="chart-card">
                        <div className="chart-card-header">
                            <span className="chart-title">Últimas Ordens de Serviço</span>
                            <a href="./ordemServico" className="ver-todas">Ver todas →</a>
                        </div>
                        <table className="os-mini-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Veículo</th>
                                    <th>Status</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ultimasOS.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                            Nenhuma ordem de serviço encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    ultimasOS.map((os, i) => {
                                        const corStatus = statusColor[os.status] ?? '#546E7A'
                                        return (
                                            <tr key={os.id ?? i}>
                                                <td>{os.id}</td>
                                                <td>{os.cliente}</td>
                                                <td>{os.veiculo}</td>
                                                <td>
                                                    <span className="os-status-badge" style={{ background: corStatus + '22', color: corStatus }}>
                                                        {os.status}
                                                    </span>
                                                </td>
                                                <td>{os.data}</td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="charts-row">
                    <div className="chart-card-bottom">
                        <span className="chart-title">Finalização de O.S. mensal dos últimos 6 meses</span>
                        <ReactApexChart options={lineChartOptions} series={lineChartSeries} type="area" height={350} />
                    </div>
                    <div className="chart-card-bottom">
                        <span className="chart-title">Estimativa vs. Realização de revisões preventivas</span>
                        <ReactApexChart options={barChartOptions} series={barChartSeries} type="bar" height={350} />
                    </div>
                    <div className="chart-card-bottom">
                        <span className="chart-title">Receita financeira dos últimos 6 meses</span>
                        <ReactApexChart options={revenueChartOptions} series={revenueChartSeries} type="bar" height={350} />
                    </div>
                </div>

            </div>
        </main>
    )
}
