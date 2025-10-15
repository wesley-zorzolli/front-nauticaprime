import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiCheck, FiX, FiTrash2, FiEdit, FiRefreshCw } from 'react-icons/fi'
import type { PropostaType } from "../utils/PropostaType";
import { resolveFoto } from "../utils/resolveFoto";
import { useAdminStore } from "./context/AdminContext";

const apiUrl = import.meta.env.VITE_API_URL;

type Inputs = {
  resposta: string;
};

export default function AdminPropostas() {
  const [propostas, setPropostas] = useState<PropostaType[]>([]);
  const [propostaSelecionada, setPropostaSelecionada] = useState<PropostaType | null>(null);
  const [abrirResposta, setAbrirResposta] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<Inputs>();
  const { admin } = useAdminStore();

  useEffect(() => {
    carregarPropostas();
  }, []);

  async function carregarPropostas() {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${apiUrl}/propostas`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const dados = await response.json();
        setPropostas(dados);
      } else {
        toast.error("Erro ao carregar propostas");
      }
    } catch (error) {
      toast.error("Erro ao carregar propostas");
    }
  }

  function selecionarProposta(proposta: PropostaType) {
    setPropostaSelecionada(proposta);
    reset({ resposta: proposta.resposta || "" });
    setAbrirResposta(true);
  }

  async function onSubmit(data: Inputs) {
    if (!propostaSelecionada) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${apiUrl}/propostas/${propostaSelecionada.id}/responder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resposta: data.resposta })
      });

      if (response.ok) {
        toast.success("Resposta enviada com sucesso!");
        carregarPropostas();
        setPropostaSelecionada(null);
        setAbrirResposta(false);
        reset();
      } else {
        toast.error("Erro ao enviar resposta");
      }
    } catch (error) {
      toast.error("Erro ao processar resposta");
    }
  }

  async function aceitarProposta(id?: number, precoSugestao?: number) {
    const alvo = id ?? propostaSelecionada?.id;
    const precoBase = precoSugestao ?? propostaSelecionada?.embarcacao.preco;
    if (!alvo) return;

    const valorNegociado = prompt("Digite o valor negociado da venda:", precoBase?.toString());
    if (!valorNegociado || parseFloat(valorNegociado) <= 0) {
      toast.error("Valor inválido");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      
      if (!admin.id) {
        toast.error("Você precisa estar logado como admin");
        return;
      }

      console.log("Admin ID sendo enviado:", admin.id);
      
      const response = await fetch(`${apiUrl}/propostas/${alvo}/aceitar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          valor_negociado: parseFloat(valorNegociado),
          adminId: admin.id 
        })
      });

      if (response.ok) {
        toast.success("Proposta aceita e venda registrada!");
        carregarPropostas();
        setPropostaSelecionada(null);
        reset();
      } else {
        const erro = await response.json();
        toast.error(erro.erro || "Erro ao aceitar proposta");
      }
    } catch (error) {
      toast.error("Erro ao processar aceitação");
    }
  }

  async function rejeitarProposta(id?: number) {
    const alvo = id ?? propostaSelecionada?.id;
    if (!alvo) return;

    if (!confirm("Tem certeza que deseja rejeitar esta proposta?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${apiUrl}/propostas/${alvo}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "REJEITADA" })
      });

      if (response.ok) {
        toast.success("Proposta rejeitada!");
        carregarPropostas();
        setPropostaSelecionada(null);
        reset();
      } else {
        toast.error("Erro ao rejeitar proposta");
      }
    } catch (error) {
      toast.error("Erro ao processar rejeição");
    }
  }

  async function excluirProposta(id: number) {
    if (!confirm("Excluir definitivamente esta proposta?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${apiUrl}/propostas/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success("Proposta excluída");
        carregarPropostas();
      } else {
        toast.error("Não foi possível excluir");
      }
    } catch (e) {
      toast.error("Erro ao excluir proposta");
    }
  }

  function dataDMA(data: string) {
    const ano = data.substring(0, 4);
    const mes = data.substring(5, 7);
    const dia = data.substring(8, 10);
    return `${dia}/${mes}/${ano}`;
  }

  const StatusChip = ({ status }: { status?: string }) => {
    const s = (status || 'PENDENTE').toUpperCase();
    const map: Record<string, string> = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ACEITA': 'bg-green-100 text-green-800 border-green-200',
      'REJEITADA': 'bg-red-100 text-red-800 border-red-200',
      'RESPONDIDA': 'bg-blue-100 text-blue-800 border-blue-200'
    }
    const cls = map[s] || map['PENDENTE']
    return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${cls}`}>{s}</span>
  }

  return (
    <div className="container mt-24">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl mb-4 font-bold">Controle de Propostas</h2>
        <button onClick={carregarPropostas} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded bg-gray-100 hover:bg-gray-200">
          <FiRefreshCw /> Atualizar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Foto do veículo</th>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">Preço R$</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Proposta do cliente</th>
                <th className="px-4 py-3">Resposta da revenda</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {propostas.map((p, idx) => (
                <tr key={p.id} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3">
                    <img
                      src={resolveFoto(p.embarcacao.foto)}
                      alt={p.embarcacao.modelo}
                      className="w-20 h-16 object-cover rounded border"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x60?text=Sem+Imagem' }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.embarcacao.marca?.nome} {p.embarcacao.modelo}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">Ano {p.embarcacao.ano} <StatusChip status={p.status} /></div>
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {Number(p.embarcacao.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.cliente?.nome || p.clienteId}</div>
                    <div className="text-xs text-gray-500">{p.cliente?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="whitespace-pre-wrap overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{p.descricao}</div>
                    <div className="text-xs text-gray-500 mt-1">{dataDMA(p.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.resposta ? (
                      <div className="bg-green-50 border border-green-200 rounded p-2 text-green-800 text-sm overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {p.resposta}
                        <div className="text-xs text-green-700 mt-1">Atualizado: {p.updatedAt ? dataDMA(p.updatedAt) : '-'}</div>
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pendente</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button aria-label="Responder" title="Responder" onClick={() => selecionarProposta(p)} className="p-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"><FiEdit /></button>
                      <button aria-label="Aceitar e vender" title="Aceitar & Vender" onClick={() => aceitarProposta(p.id, Number(p.embarcacao.preco))} disabled={p.status === 'ACEITA' || p.status === 'REJEITADA'} className={`p-2 rounded bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-40 disabled:cursor-not-allowed`}><FiCheck /></button>
                      <button aria-label="Rejeitar" title="Rejeitar" onClick={() => rejeitarProposta(p.id)} disabled={p.status === 'REJEITADA' || p.status === 'ACEITA'} className={`p-2 rounded bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-40 disabled:cursor-not-allowed`}><FiX /></button>
                      <button aria-label="Excluir" title="Excluir" onClick={() => excluirProposta(p.id)} className="p-2 rounded bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal simples para responder */}
      {abrirResposta && propostaSelecionada && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Responder Proposta</h3>
              <button onClick={() => { setAbrirResposta(false); setPropostaSelecionada(null); }} className="text-gray-500 hover:text-gray-700">Fechar</button>
            </div>
            <div className="mb-3 text-sm text-gray-700">
              <div className="font-semibold">{propostaSelecionada.embarcacao.marca.nome} {propostaSelecionada.embarcacao.modelo}</div>
              <div className="text-xs text-gray-500">Cliente: {propostaSelecionada.cliente?.nome || propostaSelecionada.clienteId} • {dataDMA(propostaSelecionada.createdAt)}</div>
              <div className="mt-2 p-2 bg-gray-50 rounded">{propostaSelecionada.descricao}</div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="block text-sm font-medium mb-2">Sua resposta</label>
              <textarea {...register("resposta", { required: true })} className="w-full p-3 border rounded h-32" defaultValue={propostaSelecionada.resposta || ''} />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setAbrirResposta(false); setPropostaSelecionada(null); }} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Enviar Resposta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}