import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import imgDashboard from '../assets/image-dashboard.png'
import imgCliente from '../assets/image-client.png'
import imgOrdem from '../assets/image-service-order.png'

export function SideBar({ collapsed, setCollapsed }) {
    const [optionsOpen, setOptionsOpen] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const currentPage = location.pathname.replace('/', '')

    const nomeUsuario = sessionStorage.getItem('NOME_USUARIO') || 'L'
    const inicial = nomeUsuario.charAt(0).toUpperCase()

    function toggleMenu() {
        setCollapsed(!collapsed)
    }

    function toggleOptions() {
        setOptionsOpen(!optionsOpen)
    }

    function handleMenuClick(page) {
        navigate(`/${page}`)
    }

    function logout() {
        sessionStorage.clear()
        navigate('/login')
    }

    return (
        <>
            <style>{`
                .sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    width: 80px;
                    height: 100vh;
                    background: #141D24;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px 0;
                    transition: width 0.3s ease;
                    z-index: 1000;
                    overflow: hidden;
                }
                .sidebar.collapsed { width: 295px; }
                .toggleMenu {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 5px;
                    cursor: pointer;
                    margin-bottom: 30px;
                    transition: background 0.3s;
                }
                .toggleMenu:hover { background: #E31B13; }
                .toggleMenu .line {
                    width: 24px;
                    height: 3px;
                    background: white;
                    border-radius: 2px;
                }
                .menu {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    flex: 1;
                }
                .menu-item {
                    width: 100%;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255,255,255,1);
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                }
                .menu-item:hover, .menu-item.active {
                    background: #E31B13;
                    color: white;
                    border-radius: 0 15px 15px 0;
                }
                .menu-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 40px;
                    background: white;
                    border-radius: 0 4px 4px 0;
                }
                .menu-item img {
                    width: 48px;
                    height: 48px;
                    object-fit: contain;
                }
                .menu-item span {
                    display: none;
                    margin-left: 15px;
                    font-size: 20px;
                    white-space: nowrap;
                }
                .sidebar.collapsed .menu-item {
                    justify-content: flex-start;
                    padding-left: 25px;
                }
                .sidebar.collapsed .menu-item span { display: inline; }
                .profile-container {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    margin-top: 20px;
                    padding-bottom: 40px;
                }
                .profile {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 2px solid transparent;
                }
                .profile:hover {
                    background: #E31B13;
                    border-color: white;
                }
                .moreOptions {
                    display: none;
                    position: fixed;
                    bottom: 80px;
                    background: #ddd;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    padding: 10px 0;
                    flex-direction: column;
                    z-index: 1001;
                    width: 200px;
                }
                .moreOptions.open {
                    display: flex;
                    animation: fadeIn 0.2s ease;
                }
                .option-item {
                    padding: 12px 20px;
                    color: #141D24;
                    font-size: 20px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .option-item:hover {
                    background: #f0f0f5;
                    color: #E31B13;
                }
                .option-item.logout {
                    color: #d9534f;
                    border-top: 1px solid #eee;
                }
                .option-item.logout:hover { background: #fff0f0; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 768px) {
                    .sidebar { width: 60px; }
                    .sidebar.collapsed { width: 200px; }
                }
            `}</style>

            <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="toggleMenu" onClick={toggleMenu}>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>

                <nav className="menu">
                    <div className={`menu-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => handleMenuClick('dashboard')}>
                        <img src={imgDashboard} className="menu-icon" />
                        <span>Dashboard</span>
                    </div>
                    <div className={`menu-item ${currentPage === 'cliente' ? 'active' : ''}`} onClick={() => handleMenuClick('cliente')}>
                        <img src={imgCliente} className="menu-icon" />
                        <span>Cliente</span>
                    </div>
                    <div className={`menu-item ${currentPage === 'ordemServico' ? 'active' : ''}`} onClick={() => handleMenuClick('ordemServico')}>
                        <img src={imgOrdem} className="menu-icon" />
                        <span>Ordem de Serviço</span>
                    </div>
                </nav>

                <div className="profile-container">
                    <div
                        className={`moreOptions ${optionsOpen ? 'open' : ''}`}
                        style={{ left: collapsed ? '170px' : '25px' }}
                    >
                        <div className="option-item" onClick={() => navigate('/editarPerfil')}>
                            Editar Perfil
                        </div>
                        <div className="option-item logout" onClick={logout}>
                            Sair
                        </div>
                    </div>
                    <div className="profile" onClick={toggleOptions}>
                        {inicial}
                    </div>
                </div>
            </div>
        </>
    )
}