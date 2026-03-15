const parentElement = document.currentScript.parentElement;
const page = document.currentScript.getAttribute("page");

class SideBarComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelectorAll('.menu-item').forEach(el =>
            el.addEventListener('click', this.handleMenuClick.bind(this))
        );

        const btnEditar = this.shadowRoot.querySelector('#btnEditProfile');
        if (btnEditar) {
            btnEditar.addEventListener('click', () => {
                window.location.href = 'editarPerfil.html';
            });
        }

        const btnEditarEmpresa = this.shadowRoot.querySelector('#btnEditCompany');
        if (btnEditarEmpresa) {
            btnEditarEmpresa.addEventListener('click', () => {
                window.location.href = 'editarEmpresa.html'; 
            });
        }

        const btnLogout = this.shadowRoot.querySelector('#btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', this.logout.bind(this));
        }

        this.shadowRoot.querySelector('.toggleMenu').addEventListener('click', this.toggleMenu.bind(this));
        this.shadowRoot.querySelector('.profile').addEventListener('click', this.toggleOptions.bind(this));

        document.body.style.marginLeft = '80px';
        document.body.style.transition = 'margin-left 0.3s ease';
    }

    toggleMenu() {
        const sidebar = this.shadowRoot.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
        document.body.style.marginLeft = sidebar.classList.contains('collapsed') ? '280px' : '80px';
    }

    toggleOptions() {
        const opcoes = this.shadowRoot.querySelector(".moreOptions");
        opcoes.classList.toggle("open");
    }

    handleMenuClick(event) {
        this.shadowRoot.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Navegar para a página correspondente
        const page = event.currentTarget.getAttribute('data-page');
        if (page) {
            window.location.href = `${page}.html`;
        }
    }

    logout() {
        sessionStorage.clear();
        window.location.href = "index.html"; 
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Poppins', sans-serif;
                }

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
                }

                .sidebar.collapsed {
                    width: 295px;
                }

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

                .toggleMenu:hover {
                    background: #E31B13;
                }

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
                    color: rgba(255, 255, 255, 1);
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                }

                .menu-item:hover {
                    background: #E31B13;
                    color: white;
                    border-radius: 15px;
                }

                .menu-item.active {
                    background: #E31B13;
                    color: white;
                    border-radius: 15px;
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

                .menu-item svg {
                    width: 28px;
                    height: 28px;
                    fill: currentColor;
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

                .sidebar.collapsed .menu-item span {
                    display: inline;
                }

                .profile-container {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    margin-top: 20px;
                }

                .profile {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
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
                    position: absolute;
                    bottom: 70px;
                    background: #ddd;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    padding: 10px 0;
                    flex-direction: column;
                    z-index: 1001;
                    width: 200px;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .sidebar:not(.collapsed) .moreOptions {
                    left: 20px;
                    transform: translateX(0);
                }

                .moreOptions::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 8px 8px 0;
                    border-style: solid;
                    border-color: white transparent transparent transparent;
                }
                
                .sidebar:not(.collapsed) .moreOptions::after {
                    left: 25px;
                    transform: translateX(0);
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
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .option-item:hover {
                    background: #f0f0f5;
                    color: #E31B13;
                }
                
                .option-item.logout {
                    color: #d9534f; /* Vermelho para sair */
                    border-top: 1px solid #eee;
                }

                .option-item.logout:hover {
                    background: #fff0f0;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, 10px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }

                @media (max-width: 768px) {
                    .sidebar {
                        width: 60px;
                    }
                    .sidebar.collapsed {
                        width: 200px;
                    }
                    .moreOptions {
                        left: 10px;
                        transform: none;
                    }
                    .moreOptions::after {
                        left: 25px;
                        transform: none;
                    }
                }
            </style>

            <div class="sidebar">
                <div class="toggleMenu">
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                </div>

                <nav class="menu">

                    <div class="menu-item" data-page="dashboard">
                        <img src="./assets/image-dashboard.png" class="menu-icon">
                        <span>Dashboard</span>
                    </div>

                    <div class="menu-item" data-page="cliente">
                        <img src="./assets/image-client.png" class="menu-icon">
                        <span>Cliente</span>
                    </div>

                    <div class="menu-item" data-page="ordemServico">
                        <img src="./assets/image-service-order.png" class="menu-icon">
                        <span>Ordem de Serviço</span>
                    </div>

                    <div class="menu-item" data-page="relatorio">
                        <img src="./assets/image-report.png" class="menu-icon">
                        <span>Relatórios</span>
                    </div>

                </nav>

                 <div class="profile-container">

                 <div class="moreOptions">
                        <div class="option-item" id="btnEditProfile">
                            Editar Perfil
                        </div>
                        <div class="option-item logout" id="btnLogout">
                            Sair
                        </div>
                    </div>

                    <div class="profile">
                        ${(sessionStorage.NOME_USUARIO || 'L').charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        `;

        this.applyRoleRules();
        this.setActivePage();
    }

    setActivePage() {
        // Detectar a página atual e marcar como ativa
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        const menuItems = this.shadowRoot.querySelectorAll('.menu-item');

        menuItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');
            if (itemPage === currentPage) {
                item.classList.add('active');
            }
        });
    }

    applyRoleRules() {
        const role = sessionStorage.getItem('ROLE_USER');

        if (role === 'Analista de Dados') {
            const manageUsers = this.shadowRoot.querySelector('.manageUsers');
            const servers = this.shadowRoot.querySelector('.servers');
            if (manageUsers) manageUsers.style.display = 'none';
            if (servers) servers.style.display = 'none';
        }

        if (role === 'Gerente') {
            const manageUsers = this.shadowRoot.querySelector('.manageUsers');
            if (manageUsers) manageUsers.style.display = 'none';
        }
    }
}

customElements.define('side-bar', SideBarComponent);
