import type { EmbarcacaoType } from "./utils/EmbarcacaoType"
import { useParams } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { useClienteStore } from "./context/ClienteContext"
import { useForm } from "react-hook-form"
import { toast } from 'sonner'
import { Link } from "react-router-dom"
import { FiCalendar, FiClock, FiDroplet, FiArrowLeft } from 'react-icons/fi'
import { resolveFoto } from "./utils/resolveFoto"

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
  descricao: string
}

// Tipo para embarcação com marca opcional
type EmbarcacaoComMarcaType = Omit<EmbarcacaoType, 'marca'> & {
  marca?: {
    id: number
    nome: string
  }
  // Alguns backends podem enviar 'valor' em vez de 'preco'
  valor?: number
}

export default function Detalhes() {
  const params = useParams()
  const [embarcacao, setEmbarcacao] = useState<EmbarcacaoComMarcaType>()
  const [carregando, setCarregando] = useState(true)
  const [enviandoProposta, setEnviandoProposta] = useState(false) // NOVO ESTADO
  const { cliente } = useClienteStore()

  const { register, handleSubmit, reset } = useForm<Inputs>()

  // Derivados com memoização segura
  const precoFormatado = useMemo(() => {
    return Number(embarcacao?.valor ?? embarcacao?.preco ?? 0)
      .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [embarcacao?.valor, embarcacao?.preco])

  const horasUsoFormatadas = useMemo(() => {
    // O backend retorna km_horas como string
    const horas = embarcacao?.km_horas || '0'
    // Se é um número, formata como número, senão retorna a string
    const numero = Number(horas)
    return Number.isFinite(numero) ? numero.toLocaleString('pt-BR') : horas
  }, [embarcacao?.km_horas])

  useEffect(() => {
    async function buscaDados() {
      try {
        setCarregando(true)
        const response = await fetch(`${apiUrl}/embarcacoes/${params.embarcacaoId}`)
        
        if (!response.ok) {
          throw new Error('Embarcação não encontrada')
        }
        
        const dados = await response.json()
        setEmbarcacao(dados)
      } catch (error) {
        console.error("Erro ao buscar embarcação:", error)
        toast.error("Erro ao carregar dados da embarcação")
      } finally {
        setCarregando(false)
      }
    }
    
    if (params.embarcacaoId) {
      buscaDados()
    }
  }, [params.embarcacaoId])

  async function enviaProposta(data: Inputs) {
    if (!cliente.id || !cliente.token) {
      toast.error("Você precisa estar logado para enviar uma proposta")
      return
    }

    // Bloquear múltiplos envios
    if (enviandoProposta) {
      toast.info("Aguarde, sua proposta está sendo enviada...")
      return
    }

    setEnviandoProposta(true) // INICIAR ESTADO DE ENVIO

    try {
      const requestBody = {
        clienteId: cliente.id,
        embarcacaoId: Number(params.embarcacaoId),
        descricao: data.descricao
      }

      console.log("🚀 Enviando proposta para:", `${apiUrl}/propostas`)
      console.log("📦 Dados da requisição:", requestBody)
      console.log("🔑 Token do cliente:", cliente.token ? "Presente" : "Ausente")

      const response = await fetch(`${apiUrl}/propostas`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cliente.token}`
        },
        method: "POST",
        body: JSON.stringify(requestBody)
      })

      console.log("📨 Status da resposta:", response.status)
      console.log("📋 Headers da resposta:", Object.fromEntries(response.headers.entries()))

      if (response.status == 201) {
        toast.success("Obrigado. Sua proposta foi enviada. Aguarde retorno")
        reset() // Limpar o formulário
      } else {
        // Tentar ler a resposta de erro
        try {
          const erroData = await response.json()
          console.log("❌ Dados do erro:", erroData)
          
          if (typeof erroData.erro === 'string') {
            toast.error(erroData.erro)
          } else if (erroData.erro && Array.isArray(erroData.erro)) {
            const mensagens = erroData.erro.map((e: any) => 
              typeof e === 'string' ? e : e.message || JSON.stringify(e)
            ).join(', ')
            toast.error(`Erro de validação: ${mensagens}`)
          } else if (erroData.erro && erroData.erro.issues) {
            const mensagens = erroData.erro.issues.map((issue: any) => 
              issue.message || JSON.stringify(issue)
            ).join(', ')
            toast.error(`Erro de validação: ${mensagens}`)
          } else if (erroData.erro && typeof erroData.erro === 'object') {
            toast.error("Erro de validação nos dados enviados")
          } else {
            toast.error(`Erro HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (parseError) {
          console.log("❌ Erro ao fazer parse da resposta:", parseError)
          toast.error(`Erro HTTP ${response.status}: ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error("💥 Erro de conexão ao enviar proposta:", error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error(`Erro de conexão: Verifique se o backend está rodando em ${apiUrl}`)
      } else {
        toast.error("Erro de conexão ao enviar proposta")
      }
    } finally {
      setEnviandoProposta(false) // FINALIZAR ESTADO DE ENVIO (mesmo em caso de erro)
    }
  }

  // Função segura para obter nome da marca
  const getMarcaNome = () => {
    if (!embarcacao?.marca) {
      return "Marca não disponível"
    }
    return embarcacao.marca.nome
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes da embarcação...</p>
        </div>
      </div>
    )
  }

  if (!embarcacao) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Embarcação não encontrada</h2>
          <p className="text-gray-600 mb-4">A embarcação que você está procurando não existe ou foi removida.</p>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition">
            <FiArrowLeft className="mr-2" /> Voltar
          </Link>
        </div>

        <section className="flex flex-col md:flex-row overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/90 shadow-xl backdrop-blur">
          <img
            className="object-cover w-full md:w-1/2 h-72 md:h-auto md:max-h-[640px]"
            src={resolveFoto(embarcacao.foto)}
            alt={`${embarcacao.modelo}`}
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x900?text=Imagem+Indisponível' }}
          />

          <div className="flex-1 p-6 md:p-8">
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                <span className="text-slate-500 dark:text-slate-300">{getMarcaNome()}</span> {embarcacao.modelo}
              </h1>
              <div className="mt-2 text-2xl font-bold text-blue-600">R$ {precoFormatado}</div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <FiCalendar className="text-slate-400" />
                <span className="w-28 text-slate-500">Ano</span>
                <span className="font-semibold">{embarcacao.ano}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <FiClock className="text-slate-400" />
                <span className="w-28 text-slate-500">Horas de uso</span>
                <span className="font-semibold">{horasUsoFormatadas}{embarcacao?.km_horas ? ' h' : ''}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <FiDroplet className="text-slate-400" />
                <span className="w-28 text-slate-500">Combustível</span>
                <span className="font-semibold">{embarcacao.motor}</span>
              </div>
            </div>

            {embarcacao.acessorios && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">Acessórios inclusos</h2>
                <ul className="list-disc pl-6 text-slate-700 dark:text-slate-200 space-y-1">
                  {embarcacao.acessorios.split(',').map((acc, idx) => (
                    <li key={`${idx}-${acc.trim()}`}>{acc.trim()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {cliente.id && cliente.token ? (
            <div className="mx-auto mb-8 mt-2 p-7 bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl border border-blue-200/70 dark:border-blue-900/40 w-full max-w-xl shadow-lg">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-5 text-center drop-shadow">
                🙂 Olá {cliente.nome?.split(' ')[0]}, você pode fazer uma proposta para esta embarcação!
              </h3>
              <form onSubmit={handleSubmit(enviaProposta)} className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-white mb-2 drop-shadow">
                    Seus dados:
                  </label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-base rounded-lg p-3 cursor-not-allowed font-semibold" 
                    value={`${cliente.nome} (${cliente.email})`} 
                    disabled 
                    readOnly 
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-bold text-white mb-2 drop-shadow">
                    Sua proposta:
                  </label>
                  <textarea 
                    className="w-full p-4 text-base text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    placeholder="Descreva sua proposta, valor oferecido, condições de pagamento, etc..."
                    rows={5}
                    required
                    disabled={enviandoProposta} // DESABILITAR CAMPO DURANTE ENVIO
                    {...register("descricao", {
                      minLength: {
                        value: 10,
                        message: "A descrição deve ter pelo menos 10 caracteres"
                      }
                    })}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={enviandoProposta}
                  className={`w-full px-8 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-bold text-lg shadow ${
                    enviandoProposta 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {enviandoProposta ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando proposta...
                    </div>
                  ) : (
                    'Enviar Proposta'
                  )}
                </button>

                {enviandoProposta && (
                  <p className="text-base text-blue-600 text-center mt-2">
                    Aguarde, estamos processando sua proposta...
                  </p>
                )}
              </form>
            </div>
          ) : (
            <div className="mx-6 md:mx-8 mb-8 mt-2 p-6 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200/70 dark:border-amber-900/40 text-center">
              <h3 className="text-lg md:text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">😎 Gostou desta embarcação?</h3>
              <p className="text-amber-700 dark:text-amber-300 mb-4">Identifique-se no sistema e faça uma proposta!</p>
              <Link
                to="/login"
                className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-200 font-medium"
              >
                Fazer Login
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}