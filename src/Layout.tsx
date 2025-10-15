import Titulo from './components/Titulo.tsx'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { useClienteStore } from './context/ClienteContext'

export default function Layout() {
  const { logaCliente } = useClienteStore()

  useEffect(() => {
    // O Zustand persist já cuida da persistência automaticamente
    // Mas podemos verificar se há dados no localStorage antigo para migração
    const clienteKey = localStorage.getItem("clienteKey");
    if (clienteKey) {
      try {
        const cliente = JSON.parse(clienteKey);
        logaCliente(cliente);
        console.log("Cliente carregado do localStorage antigo");
      } catch (error) {
        console.error("Erro ao carregar cliente do localStorage:", error);
        localStorage.removeItem("clienteKey");
      }
    }
  }, [logaCliente]);

  return (
    <>
      <Titulo />
      <Outlet />
      <Toaster richColors position="top-center" />
    </>
  )
}