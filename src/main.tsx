import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Páginas do cliente
import App from './App'
import Login from './Login'
import Detalhes from './Detalhes'
import MinhasPropostas from './MinhasPropostas'
import CadCliente from './CadCliente'

// Páginas/Admin
import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import AdminEmbarcacoes from './admin/AdminEmbarcacoes'
import AdminClientes from './admin/AdminClientes'
import AdminPropostas from './admin/AdminPropostas'
import PrimeiroAdmin from './admin/PrimeiroAdmin' // ADICIONAR

// Layout principal do cliente
import Layout from './Layout'

// React Router
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Rotas
const rotas = createBrowserRouter([
  {
    path: '/admin/primeiro-admin', // NOVA ROTA
    element: <PrimeiroAdmin />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'embarcacoes', element: <AdminEmbarcacoes /> },
      { path: 'clientes', element: <AdminClientes /> },
      { path: 'propostas', element: <AdminPropostas /> },
    ],
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'detalhes/:embarcacaoId', element: <Detalhes /> },
      { path: 'minhasPropostas', element: <MinhasPropostas /> },
      { path: 'cadCliente', element: <CadCliente /> },
    ],
  },
])

// Renderização
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>
)