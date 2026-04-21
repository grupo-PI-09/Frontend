import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SideBar } from './componentes/SideBar'
import { Cliente } from './componentes/cliente'
import { OrdemServico } from './componentes/ordemServico'
import { EditarPerfil } from './componentes/editarPerfil'
import { Login } from './componentes/login'
import { Cadastro } from './componentes/cadastro'
import './style/cliente.css'

function App() {
  const [collapsed, setCollapsed] = useState(false)

  const paginasComSidebar = ['/cliente', '/ordemServico', '/editarPerfil']
  const mostrarSidebar = paginasComSidebar.includes(window.location.pathname)

  return (
    <BrowserRouter>
      {mostrarSidebar && <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />}
      <div style={{
        marginLeft: mostrarSidebar ? (collapsed ? '295px' : '80px') : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/cliente" element={<Cliente />} />
          <Route path="/ordemServico" element={<OrdemServico />} />
          <Route path="/editarPerfil" element={<EditarPerfil />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App