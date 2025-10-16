import { useEffect, useState } from "react";
import { useClienteStore } from "./context/ClienteContext";
import type { PropostaType } from "./utils/PropostaType";
import { toast } from "sonner";
import { resolveFoto } from "./utils/resolveFoto";

const apiUrl = import.meta.env.VITE_API_URL

// Tipo seguro para proposta com dados opcionais
type PropostaSeguraType = Omit<PropostaType, 'embarcacao'> & {
  embarcacao: {
    id: number;
    modelo: string;
    ano: number;
    preco: number;
    foto: string;
    marca?: {
      id: number;
      nome: string;
    };
  };
};

export default function MinhasPropostas() {
    const [propostas, setPropostas] = useState<PropostaSeguraType[]>([])
    const { cliente } = useClienteStore()

    useEffect(() => {
        async function buscaDados() {
            if (!cliente.id || !cliente.token) {
                console.log("Cliente não autenticado");
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/propostas/cliente/${cliente.id}`, {
                    headers: {
                        "Authorization": `Bearer ${cliente.token}`
                    }
                })

                if (response.ok) {
                    const dados = await response.json()
                    setPropostas(dados)
                } else {
                    console.error("Erro ao buscar propostas:", response.status);
                    if (response.status === 401) {
                        toast.error("Sessão expirada. Faça login novamente.");
                    } else {
                        toast.error("Erro ao carregar suas propostas.");
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar propostas:", error);
                toast.error("Erro de conexão ao carregar propostas.");
            }
        }

        if (cliente.id && cliente.token) {
            buscaDados()
        }
    }, [cliente])

    // Função segura para obter nome da marca
    const getMarcaNome = (proposta: PropostaSeguraType): string => {
        if (!proposta.embarcacao.marca) {
            return "Marca não disponível";
        }
        return proposta.embarcacao.marca.nome;
    }

    // Função segura para obter preço
    const getPreco = (proposta: PropostaSeguraType): string => {
        return Number(proposta.embarcacao.preco).toLocaleString("pt-br", { 
            minimumFractionDigits: 2 
        });
    }

    // para retornar apenas a data do campo no banco de dados
    function dataDMA(data: string) {
        try {
            const dataObj = new Date(data);
            return dataObj.toLocaleDateString('pt-BR');
        } catch {
            const ano = data.substring(0, 4)
            const mes = data.substring(5, 7)
            const dia = data.substring(8, 10)
            return dia + "/" + mes + "/" + ano
        }
    }

    const propostasTable = propostas.map(proposta => (
        <tr key={proposta.id} className="bg-white border-b hover:bg-blue-50 transition-colors">
            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap align-middle">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-blue-900 tracking-tight">{getMarcaNome(proposta)} {proposta.embarcacao.modelo}</span>
                  <span className="text-sm text-gray-700">Ano <b>{proposta.embarcacao.ano}</b> &bull; <span className="text-green-700 font-bold">R$ {getPreco(proposta)}</span></span>
                </div>
            </th>
            <td className="px-6 py-4 align-middle">
                <div className="flex items-center justify-center">
                  <img 
                      src={resolveFoto(proposta.embarcacao.foto)} 
                      className="w-24 h-20 object-cover rounded-xl border-2 border-blue-200 shadow-sm" 
                      alt={`Foto da embarcação ${proposta.embarcacao.modelo}`}
                      onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x60?text=Sem+Imagem';
                      }}
                  />
                </div>
            </td>
            <td className="px-6 py-4 align-middle">
                <div className="text-base text-gray-900 font-medium mb-1">{proposta.descricao}</div>
                <div className="text-xs text-gray-500">Enviado em: {dataDMA(proposta.createdAt)}</div>
            </td>
            <td className="px-6 py-4 align-middle">
                {proposta.resposta ? (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 shadow-sm">
                        <div className="text-green-900 font-semibold text-base">{proposta.resposta}</div>
                        <div className="text-xs text-green-700 mt-1">
                            Respondido em: {dataDMA(proposta.updatedAt as string)}
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
                        <span className="text-yellow-700 italic">Aguardando resposta...</span>
                    </div>
                )}
            </td>
        </tr>
    ))

    return (
        <section className="bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="mb-6 mt-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                    Listagem de <span className="underline underline-offset-3 decoration-8 decoration-orange-400 dark:decoration-orange-600">Minhas Propostas</span>
                </h1>

            {!cliente.id || !cliente.token ? (
                <div className="text-center py-12">
                    <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
                        Você precisa estar logado para ver suas propostas. 🙄
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Faça login para acessar suas propostas enviadas.
                    </p>
                </div>
            ) : propostas.length == 0 ? (
                <div className="text-center py-12">
                    <h2 className="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl">
                        Ah... Você ainda não fez propostas para as nossas embarcações. 🙄
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Explore nossas embarcações e faça sua primeira proposta!
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold">
                                        Embarcação
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-semibold">
                                        Foto
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-semibold">
                                        Proposta
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-semibold">
                                        Resposta
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {propostasTable}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Resumo */}
                    <div className="p-4 bg-gray-50 border-t">
                        <p className="text-sm text-gray-600">
                            Total de propostas: <span className="font-semibold">{propostas.length}</span> | 
                            Respondidas: <span className="font-semibold text-green-600">
                                {propostas.filter(p => p.resposta).length}
                            </span> | 
                            Pendentes: <span className="font-semibold text-yellow-600">
                                {propostas.filter(p => !p.resposta).length}
                            </span>
                        </p>
                    </div>
                </div>
            )}
            </div>
        </section>
    )
}