import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SideBar } from './componentes/SideBar'
import { Cliente } from './componentes/cliente'
import { OrdemServico } from './componentes/ordemServico'
import { EditarPerfil } from './componentes/editarPerfil'
import { Login } from './componentes/login'
import { Cadastro } from './componentes/cadastro'
import { Dashboard } from './componentes/dashboard'
import { ProtectedRoute } from './componentes/ProtectedRoute'
import { isAuthenticated } from './services/auth'

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const paginasComSidebar = ['/cliente', '/ordemServico', '/editarPerfil', '/dashboard']
  const mostrarSidebar = paginasComSidebar.includes(location.pathname)

  return (
    <>
      {mostrarSidebar && <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />}
      <div style={{
        marginLeft: mostrarSidebar ? (collapsed ? '295px' : '80px') : '0',
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        background: mostrarSidebar ? '#f5f5f5' : 'transparent'
      }}>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cliente" element={<ProtectedRoute><Cliente /></ProtectedRoute>} />
          <Route path="/ordemServico" element={<ProtectedRoute><OrdemServico /></ProtectedRoute>} />
          <Route path="/editarPerfil" element={<ProtectedRoute><EditarPerfil /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
