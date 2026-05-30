import ReactApexChart from 'react-apexcharts'
import { FaDollarSign, FaUserPlus, FaBell } from 'react-icons/fa'
import '../style/dashboard.css'

export function Dashboard() {

    // 1. Gráfico de linha
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
            categories: ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev'],
            labels: { style: { fontSize: '18px' } }
        },
        yaxis: { min: 0, max: 70, labels: { style: { fontSize: '18px' } } },
        grid: { borderColor: '#c5bdbd', padding: { left: 20 } },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '20px',
                colors: ['#546E7A']
            },
            background: {
                enabled: false
            },
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

    const lineChartSeries = [{ name: 'O.S. finalizadas', data: [48, 62, 55, 38, 50, 52] }]

    // 2. Gráfico de barras
    const barChartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', stacked: true },
        colors: ['#546E7A', '#B0BEC5'],
        xaxis: {
            categories: ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev'],
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

    const barChartSeries = [
        { name: 'Realizado', data: [24, 20, 28, 21, 23, 24] },
        { name: 'Estimativa', data: [6, 15, 14, 14, 18, 28] }
    ]

    // 3. Gráfico de receita
    const revenueChartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
        colors: ['#546E7A'],
        xaxis: {
            categories: ['Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev'],
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

    const revenueChartSeries = [
        { name: 'Receita', data: [100000, 200000, 150000, 80000, 70000, 110000] },
    ]

    // 4. Gráfico de pizza
    const pieChartOptions = {
        chart: { type: 'pie', background: 'transparent' },
        colors: ['#476370', '#7e95a0', '#CFD8DC', '#0d4663'],
        labels: ['Finalizadas 102', 'Em andamento 48', 'Abertas 25', 'Total 175'],
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

    const pieChartSeries = [102, 48, 25, 0]

    const ultimasOS = [
        { id: '#1892', cliente: 'João da Silva', veiculo: 'Honda Civic', status: 'Em andamento', data: '10/05/2026' },
        { id: '#1891', cliente: 'Maria Oliveira', veiculo: 'Toyota Corolla', status: 'Finalizada', data: '10/05/2026' },
        { id: '#1890', cliente: 'Carlos Santos', veiculo: 'Fiat Strada', status: 'Em andamento', data: '09/05/2026' },
        { id: '#1889', cliente: 'Ana Paula', veiculo: 'Chevrolet Onix', status: 'Em andamento', data: '09/05/2026' },
        { id: '#1888', cliente: 'Pedro Lima', veiculo: 'Volkswagen Golf', status: 'Aberta', data: '08/05/2026' },
    ]

    const statusColor = {
        'Em andamento': '#1565C0',
        'Finalizada': '#2e7d32',
        'Aberta': '#546E7A',
    }

    const cards = [
        { label: 'Faturamento do mês', value: 'R$ 80.000,00', trend: '▲ 12% comparado ao mês anterior', up: true, icon: <FaDollarSign /> },
        { label: 'Novos clientes no mês', value: '12', trend: '▲ 9% comparado ao mês anterior', up: true, icon: <FaUserPlus /> },
        { label: 'Notificações enviadas', value: '18', trend: '• Hoje', up: null, icon: <FaBell /> },
    ]

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

                    {/* Pizza */}
                    <div className="chart-card">
                        <span className="chart-title">Status das Ordens de Serviço</span>
                        <ReactApexChart options={pieChartOptions} series={pieChartSeries} type="pie" height={230} />
                    </div>

                    {/* Tabela últimas OS */}
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
                                {ultimasOS.map((os, i) => (
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
                                ))}
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