import ReactApexChart from 'react-apexcharts'
import { FaDollarSign, FaUserPlus, FaBell } from 'react-icons/fa'
import '../style/dashboard.css'

export function Dashboard() {

    const lineChartOptions = {
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
            categories: [],
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
    }

    const barChartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', stacked: true },
        colors: ['#546E7A', '#B0BEC5'],
        xaxis: {
            categories: [],
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
    }

    const revenueChartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        colors: ['#546E7A'],
        xaxis: {
            categories: [],
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
    }

    const pieChartOptions = {
        chart: { type: 'pie', background: 'transparent' },
        colors: ['#476370', '#7e95a0', '#CFD8DC', '#0d4663'],
        labels: ['Finalizadas', 'Em andamento', 'Abertas', 'Total'],
        legend: {
            position: 'right',
            fontSize: '20px',
            labels: { colors: '#141D24' },
            formatter: (seriesName) => seriesName,
        },
        dataLabels: {
            enabled: true,
            style: { fontSize: '20px' },
            formatter: (val) => `${val.toFixed(0)}%`
        },
        tooltip: { enabled: false },
    }

    const daltonico = document.body.classList.contains('daltonico')

    const statusColor = daltonico ? {
        'Em andamento': '#0072B2',
        'Finalizada': '#009E73',
        'Aberta': '#E69F00',
    } : {
        'Em andamento': '#1565C0',
        'Finalizada': '#2e7d32',
        'Aberta': '#546E7A',
    }

    // TODO: substituir pelos dados do backend
    const cards = [
        { label: 'Faturamento do mês', value: '—', trend: '• Aguardando dados', up: null, icon: <FaDollarSign /> },
        { label: 'Novos clientes no mês', value: '—', trend: '• Aguardando dados', up: null, icon: <FaUserPlus /> },
        { label: 'Notificações enviadas', value: '—', trend: '• Aguardando dados', up: null, icon: <FaBell /> },
    ]

    // TODO: substituir pelos dados do backend
    const ultimasOS = []
    const lineChartSeries = [{ name: 'O.S. finalizadas', data: [] }]
    const barChartSeries = [
        { name: 'Realizado', data: [] },
        { name: 'Estimativa', data: [] }
    ]
    const revenueChartSeries = [{ name: 'Receita', data: [] }]
    const pieChartSeries = [0, 0, 0, 0]

    return (
        <main id="main-content">
            <div className="dashboard-container">
                <h1>Painel de indicadores da oficina</h1>

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
                                    ultimasOS.map((os, i) => (
                                        <tr key={i}>
                                            <td>{os.id}</td>
                                            <td>{os.cliente}</td>
                                            <td>{os.veiculo}</td>
                                            <td>
                                                <span className="os-status-badge" style={{ background: statusColor[os.status] + '22', color: statusColor[os.status] }}>
                                                    {os.status}
                                                </span>
                                            </td>
                                            <td>{os.data}</td>
                                        </tr>
                                    ))
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