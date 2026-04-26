import ReactApexChart from 'react-apexcharts'
import '../style/dashboard.css'

export function Dashboard() {

    const lineChartOptions = {
        chart: { type: 'line', toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'straight', width: 2 },
        colors: ['#546E7A'],
        xaxis: {
            categories: ['Set 2025', 'Out 2025', 'Nov 2025', 'Dez 2025', 'Jan 2026', 'Fev 2026', 'Mar 2026'],
            labels: { style: { fontSize: '20px' } }
        },
        yaxis: { 
            min: 0, max: 70,
            labels: { style: { fontSize: '20px' } }
         },
        grid: { borderColor: '#e0e0e0' },
        markers: { size: 4 },
        tooltip: { enabled: true }
    }

    const lineChartSeries = [{
        name: 'O.S. finalizadas',
        data: [48, 62, 55, 38, 50, 52, 48]
    }]

    const barChartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', stacked: true },
        colors: ['#546E7A', '#B0BEC5'],
        xaxis: {
            categories: ['Set 2025', 'Out 2025', 'Nov 2025', 'Dez 2025', 'Jan 2026', 'Fev 2026', 'Mar 2026'],
            labels: { style: { fontSize: '20px' } }
        },
        yaxis: {
            labels: { style: { fontSize: '20px' } } 
        },
        dataLabels: {
            enabled: true,
            formatter: (val, opts) => opts.seriesIndex === 0 ? val : '',
            style: { colors: ['#fff'],
                fontSize: '18px'
             }
        },
        legend: { show: false },
        grid: { borderColor: '#e0e0e0' }
    }

    const barChartSeries = [
        { name: 'Realizado', data: [24, 20, 28, 21, 23, 24, 20] },
        { name: 'Estimado', data: [6, 15, 14, 14, 18, 28, 15] }
    ]

    const revenueChartOptions = {
        chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', stacked: true },
        colors: ['#546E7A', '#B0BEC5'],
        xaxis: {
            categories: ['Set 2025', 'Out 2025', 'Nov 2025', 'Dez 2025', 'Jan 2026', 'Fev 2026', 'Mar 2026'],
            labels: { style: { fontSize: '20px' } }
        },
        yaxis: {
            labels: {
                formatter: (val) => `R$${(val / 1000).toFixed(0)}k`,
                style: { fontSize: '20px' }
            }
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        grid: { borderColor: '#e0e0e0' }
    }

    const revenueChartSeries = [
        { name: 'Receita', data: [100000, 200000, 150000, 80000, 70000, 110000, 130000] },
        { name: 'Estimado', data: [20000, 10000, 30000, 40000, 50000, 20000, 10000] }
    ]

    return (
        <main id="main-content">
            <div className="dashboard-container">
                <h1>Painel de indicadores da oficina</h1>

                <div className="dashboard-top">
                    <div className="cards-grid">
                        <div className="indicator-card">
                            <span className="card-label">Faturamento do mês</span>
                            <span className="card-value">R$ 80.000,00</span>
                            <span className="card-trend up">▲ +12% em relação ao mês anterior</span>
                        </div>
                        <div className="indicator-card">
                            <span className="card-label">O.S. finalizadas no mês</span>
                            <span className="card-value">43</span>
                            <span className="card-trend up">▲ +5 em relação ao mês anterior</span>
                        </div>
                        <div className="indicator-card">
                            <span className="card-label">O.S. em andamento no mês</span>
                            <span className="card-value">8</span>
                            <span className="card-trend up">▲ +3 em relação ao mês anterior</span>
                        </div>
                        <div className="indicator-card">
                            <span className="card-label">Novos clientes no mês</span>
                            <span className="card-value">12</span>
                            <span className="card-trend up">▲ +2 em relação ao mês anterior</span>
                        </div>
                    </div>

                    <div className="chart-card">
                        <span className="chart-title">Finalização de O.S. mensal dos últimos 6 meses</span>
                        <ReactApexChart
                            options={lineChartOptions}
                            series={lineChartSeries}
                            type="line"
                            height={400}
                        />
                    </div>
                </div>

                <div className="dashboard-bottom">
                    <div className="chart-card">
                        <span className="chart-title">Estimativa vs. Realização de revisões preventivas</span>
                        <ReactApexChart
                            options={barChartOptions}
                            series={barChartSeries}
                            type="bar"
                            height={600}
                        />
                    </div>
                    <div className="chart-card">
                        <span className="chart-title">Receita financeira dos últimos 6 meses</span>
                        <ReactApexChart
                            options={revenueChartOptions}
                            series={revenueChartSeries}
                            type="bar"
                            height={600}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}