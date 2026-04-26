import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SideBar } from './componentes/SideBar'
import { Cliente } from './componentes/cliente'
import { OrdemServico } from './componentes/ordemServico'
import { EditarPerfil } from './componentes/editarPerfil'
import { Login } from './componentes/login'
import { Cadastro } from './componentes/cadastro'
import { Dashboard } from './componentes/dashboard'
import './style/cliente.css'

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
        transition: 'margin-left 0.3s ease'
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cliente" element={<Cliente />} />
          <Route path="/ordemServico" element={<OrdemServico />} />
          <Route path="/editarPerfil" element={<EditarPerfil />} />
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