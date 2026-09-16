import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SideBar } from './componentes/SideBar'
import { Cliente } from './componentes/cliente'
import { OrdemServico } from './componentes/ordemServico'
import { EditarPerfil } from './componentes/editarPerfil'
import { Login } from './componentes/login'
import { Cadastro } from './componentes/cadastro'
import { Dashboard } from './componentes/dashboard'
import { ProtectedRoute } from './componentes/ProtectedRoute'
import { Notificacoes } from './componentes/notificacoes'
import { Agenda } from './componentes/agenda'
import { isAuthenticated } from './services/auth'

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const paginasComSidebar = ['/cliente', '/ordemServico', '/editarPerfil', '/dashboard', '/notificacoes', '/agenda']
  const mostrarSidebar = paginasComSidebar.includes(location.pathname)

  return (
    <>
      {mostrarSidebar && (
        <SideBar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}
      <div style={{
        marginLeft: mostrarSidebar ? (collapsed ? '295px' : '80px') : '0',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        background: mostrarSidebar ? '#f5f5f5' : 'transparent'
      }}>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute><Cliente /></ProtectedRoute>} />
          <Route path="/ordemServico" element={<ProtectedRoute><OrdemServico /></ProtectedRoute>} />
          <Route path="/notificacoes" element={<ProtectedRoute><Notificacoes /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
          <Route path="/editarPerfil" element={<ProtectedRoute><EditarPerfil /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  useEffect(() => {
    function ajustarTamanhoVLibras() {
      const tentativa = setInterval(() => {
        const host = document.getElementById('vlibras-access-wrapper')
        if (host && host.shadowRoot) {
          clearInterval(tentativa)

          if (!host.shadowRoot.getElementById('vlibras-tamanho-custom')) {
            const style = document.createElement('style')
            style.id = 'vlibras-tamanho-custom'
            style.textContent = `
              #vlibras-button {
                width: 80px !important;
                height: 80px !important;
              }
              #vlibras-button img {
                width: 100% !important;
                height: 100% !important;
              }
            `
            host.shadowRoot.appendChild(style)
          }
        }
      }, 300)
    }

    function iniciarWidget() {
      new window.VLibras.Widget('https://vlibras.gov.br/app')
      ajustarTamanhoVLibras()
    }

    if (window.VLibras) {
      iniciarWidget()
      return
    }

    if (document.querySelector('script[src*="vlibras-plugin.js"]')) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.onload = iniciarWidget
    document.body.appendChild(script)
  }, [])

  return (
    <BrowserRouter>
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>
      <Layout />
    </BrowserRouter>
  )
}

export default App