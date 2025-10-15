import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Toaster, toast } from 'sonner'
import { useAdminStore } from "./context/AdminContext"

import { useNavigate } from "react-router-dom"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
  email: string
  senha: string
}

export default function AdminLogin() {
  const { register, handleSubmit, setFocus } = useForm<Inputs>()
  const navigate = useNavigate()
  const { logaAdmin } = useAdminStore()

  useEffect(() => {
    setFocus("email")
  }, [])

  async function verificaLogin(data: Inputs) {
    try {
      const response = await fetch(`${apiUrl}/admins/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, senha: data.senha })
      })

      if (response.status == 200) {
        const admin = await response.json()
        logaAdmin(admin)
        toast.success(`Bem-vindo, ${admin.nome}!`)
        navigate("/admin", { replace: true })
      } else if (response.status == 400) {
        toast.error("Erro... Login ou senha incorretos")
      } else {
        toast.error("Erro no servidor. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro no login:", error)
      toast.error("Erro de conexão. Verifique se o servidor está rodando.")
    }
  }

  function irParaPrimeiroAdmin() {
    navigate("/admin/primeiro-admin")
  }

  function irParaSitePrincipal() {
    navigate("/")
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src="/jet.png" alt="Náutica Prime" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Náutica Prime
          </h1>
          <p className="text-gray-600">Área Administrativa</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Acesso Administrativo
          </h2>
          
          <form onSubmit={handleSubmit(verificaLogin)}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail:
              </label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register("email")}
                required 
                placeholder="seu@email.com"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha:
              </label>
              <input 
                type="password" 
                id="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register("senha")}
                required 
                placeholder="Sua senha"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <button
                type="button"
                onClick={irParaPrimeiroAdmin}
                className="w-full bg-green-600 py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium text-sm"
              >
                Primeiro Acesso - Criar Administrador
              </button>
              
              <button
                type="button"
                onClick={irParaSitePrincipal}
                className="w-full bg-gray-600 py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 font-medium text-sm"
              >
                Voltar para o Site Principal
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Problemas para acessar?</strong><br />
              Se é seu primeiro acesso, clique em "Primeiro Acesso" para criar uma conta de administrador.
            </p>
          </div>
        </div>
      </div>
      
      <Toaster richColors position="top-right" />
    </main>
  )
}