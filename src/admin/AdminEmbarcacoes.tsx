import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { EmbarcacaoType } from "../utils/EmbarcacaoType";
import type { MarcaType } from "../utils/MarcaType";

const apiUrl = import.meta.env.VITE_API_URL;

type Inputs = {
  modelo: string;
  ano: number;
  preco: number;
  km_horas: string; // agora é string no banco
  foto: string;
  acessorios: string;
  motor: string; // era combustivel
  marcaId: number;
};

// Tipo para embarcação sem relacionamento completo
type EmbarcacaoBasicaType = {
  id: number;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  foto: string;
  acessorios: string | null;
  combustivel: string;
  destaque: boolean;
  marcaId: number;
  createdAt: string;
  updatedAt: string;
};

export default function AdminEmbarcacoes() {
  const [embarcacoes, setEmbarcacoes] = useState<EmbarcacaoType[]>([]);
  const [marcas, setMarcas] = useState<MarcaType[]>([]);
  const [editando, setEditando] = useState<EmbarcacaoType | null>(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Inputs>();

  useEffect(() => {
    carregarEmbarcacoes();
    carregarMarcas();
  }, []);

  async function carregarEmbarcacoes() {
    try {
      const response = await fetch(`${apiUrl}/embarcacoes`);
      const dados = await response.json();
      
      console.log("Dados recebidos do backend:", dados);
      
      // O backend já retorna com marca incluída
      setEmbarcacoes(dados);
    } catch (error) {
      console.error("Erro ao carregar embarcações:", error);
      toast.error("Erro ao carregar embarcações");
    }
  }

  async function carregarMarcas() {
    try {
      const response = await fetch(`${apiUrl}/marcas`);
      const dados = await response.json();
      setMarcas(dados);
    } catch (error) {
      console.error("Erro ao carregar marcas:", error);
      toast.error("Erro ao carregar marcas");
    }
  }

  async function onSubmit(data: Inputs) {
    try {
      const token = localStorage.getItem("adminToken");
      
      if (editando) {
        // Editar embarcação existente
        const response = await fetch(`${apiUrl}/embarcacoes/${editando.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          toast.success("Embarcação atualizada com sucesso!");
          carregarEmbarcacoes();
          resetForm();
        } else {
          toast.error("Erro ao atualizar embarcação");
        }
      } else {
        // Criar nova embarcação
        const response = await fetch(`${apiUrl}/embarcacoes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });

        if (response.status === 201) {
          toast.success("Embarcação cadastrada com sucesso!");
          carregarEmbarcacoes();
          resetForm();
        } else {
          const erro = await response.json();
          toast.error(
            typeof erro === "string"
              ? erro
              : erro.erro || erro.message || JSON.stringify(erro)
          );
        }
      }
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      toast.error("Erro ao processar solicitação");
    }
  }

  function editarEmbarcacao(embarcacao: EmbarcacaoType) {
    setEditando(embarcacao);
    setValue("modelo", embarcacao.modelo);
    setValue("ano", embarcacao.ano);
    setValue("preco", Number(embarcacao.preco));
    setValue("km", embarcacao.km);
    setValue("foto", embarcacao.foto);
    setValue("acessorios", embarcacao.acessorios || "");
    setValue("combustivel", embarcacao.combustivel);
    setValue("destaque", embarcacao.destaque);
    setValue("marcaId", embarcacao.marcaId);
  }

  async function excluirEmbarcacao(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta embarcação?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${apiUrl}/embarcacoes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Embarcação excluída com sucesso!");
        carregarEmbarcacoes();
      } else {
        const erro = await response.json();
        toast.error(erro.erro || "Erro ao excluir embarcação");
      }
    } catch (error) {
      console.error("Erro ao excluir embarcação:", error);
      toast.error("Erro ao excluir embarcação");
    }
  }

  function resetForm() {
    reset();
    setEditando(null);
  }

  // Função para obter o nome da marca de forma segura
  function getMarcaNome(embarcacao: EmbarcacaoType): string {
    console.log("Embarcação recebida:", embarcacao);
    console.log("Marca da embarcação:", embarcacao.marca);
    
    if (!embarcacao.marca) {
      // Tentar encontrar a marca na lista de marcas carregadas
      const marcaEncontrada = marcas.find(m => m.id === embarcacao.marcaId);
      console.log("Marca encontrada na lista:", marcaEncontrada);
      return marcaEncontrada ? marcaEncontrada.nome : "Marca não encontrada";
    }
    return embarcacao.marca.nome;
  }

  return (
    <div className="container mt-24">
      <h2 className="text-3xl mb-4 font-bold">Cadastro e Manutenção de Embarcações</h2>
      
      {/* Formulário */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-bold mb-4">
          {editando ? "Editar Embarcação" : "Nova Embarcação"}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Modelo</label>
            <input
              type="text"
              {...register("modelo", { required: "Informe o modelo" })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.modelo?.message && (
              <span className="text-red-600 text-xs">{errors.modelo?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ano</label>
            <input
              type="number"
              {...register("ano", { 
                required: "Informe o ano", 
                valueAsNumber: true,
                min: { value: 1900, message: "Ano mínimo é 1900" },
                max: { value: new Date().getFullYear() + 1, message: `Ano máximo é ${new Date().getFullYear() + 1}` }
              })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.ano?.message && (
              <span className="text-red-600 text-xs">{errors.ano?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preço R$</label>
            <input
              type="number"
              step="0.01"
              {...register("preco", { 
                required: "Informe o preço", 
                valueAsNumber: true,
                min: { value: 0, message: "Preço mínimo é 0" }
              })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.preco?.message && (
              <span className="text-red-600 text-xs">{errors.preco?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Horas de Uso</label>
            <input
              type="number"
              {...register("km", { 
                required: "Informe as horas de uso", 
                valueAsNumber: true,
                min: { value: 0, message: "Valor mínimo é 0" }
              })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {errors.km?.message && (
              <span className="text-red-600 text-xs">{errors.km?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL da Foto</label>
            <input
              type="url"
              {...register("foto", { required: "Informe a URL da foto" })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://exemplo.com/foto.jpg"
              required
            />
            {errors.foto?.message && (
              <span className="text-red-600 text-xs">{errors.foto?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Combustível</label>
            <select
              {...register("combustivel", { required: "Informe o combustível" })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="FLEX">FLEX</option>
              <option value="GASOLINA">Gasolina</option>
              <option value="ETANOL">Etanol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELETRICO">Elétrico</option>
              <option value="HIBRIDO">Híbrido</option>
            </select>
            {errors.combustivel?.message && (
              <span className="text-red-600 text-xs">{errors.combustivel?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Marca</label>
            <select
              {...register("marcaId", { 
                required: "Selecione uma marca", 
                valueAsNumber: true 
              })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nome}
                </option>
              ))}
            </select>
            {errors.marcaId?.message && (
              <span className="text-red-600 text-xs">{errors.marcaId?.message}</span>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("destaque")}
              className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label className="text-sm font-medium">Em destaque</label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Acessórios</label>
            <textarea
              {...register("acessorios")}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Lista de acessórios incluídos..."
            />
            {errors.acessorios?.message && (
              <span className="text-red-600 text-xs">{errors.acessorios?.message}</span>
            )}
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium"
            >
              {editando ? "Atualizar Embarcação" : "Cadastrar Embarcação"}
            </button>
            
            {editando && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 px-6 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 font-medium"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Embarcações */}
      <div className="bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold p-4 border-b">Embarcações Cadastradas</h3>
        
        {embarcacoes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma embarcação cadastrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-900">Foto</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-900">Modelo</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-900">Marca</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-900">Ano</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-900">Preço</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {embarcacoes.map((embarcacao) => (
                  <tr key={embarcacao.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <img
                        src={embarcacao.foto}
                        alt={embarcacao.modelo}
                        className="w-16 h-12 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x60?text=Sem+Imagem';
                        }}
                      />
                    </td>
                    <td className="p-3 font-medium text-gray-900">{embarcacao.modelo}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getMarcaNome(embarcacao)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{embarcacao.ano}</td>
                    <td className="p-3 font-semibold text-gray-900">
                      R$ {Number(embarcacao.preco).toLocaleString("pt-br", {
                        minimumFractionDigits: 2
                      })}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarEmbarcacao(embarcacao)}
                          className="bg-yellow-500 px-3 py-1 rounded text-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 transition duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirEmbarcacao(embarcacao.id)}
                          className="bg-red-50 px-3 py-1 rounded text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition duration-200"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}