import { useEffect, useState } from "react";
import type { ClienteType } from "../utils/ClienteType";

const apiUrl = import.meta.env.VITE_API_URL;

type ClienteCompletoType = ClienteType & {
  cidade: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminClientes() {
  const [clientes, setClientes] = useState<ClienteCompletoType[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setCarregando(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${apiUrl}/clientes`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const dados = await response.json();
        setClientes(dados);
      } else {
        console.error("Erro ao carregar clientes");
      }
    } catch (error) {
      console.error("Erro ao carregar clientes", error);
    } finally {
      setCarregando(false);
    }
  }

  function dataDMA(data: string) {
    try {
      const dataObj = new Date(data);
      return dataObj.toLocaleDateString('pt-BR');
    } catch {
      const ano = data.substring(0, 4);
      const mes = data.substring(5, 7);
      const dia = data.substring(8, 10);
      return `${dia}/${mes}/${ano}`;
    }
  }

  if (carregando) {
    return (
      <div className="container mt-24">
        <h2 className="text-3xl mb-4 font-bold">Controle de Clientes</h2>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando clientes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-24">
      <h2 className="text-3xl mb-4 font-bold">Controle de Clientes</h2>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">Clientes Cadastrados</h3>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Total: {clientes.length}
          </span>
        </div>
        
        {clientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum cliente cadastrado no sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Nome</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Cidade</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Data Cadastro</th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900">Última Atualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{cliente.nome}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-600">{cliente.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {cliente.cidade}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-500">
                        {dataDMA(cliente.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-500">
                        {cliente.updatedAt ? dataDMA(cliente.updatedAt) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
              <p className="text-2xl font-semibold text-gray-900">{clientes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cidades Únicas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(clientes.map(c => c.cidade)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cadastros Hoje</p>
              <p className="text-2xl font-semibold text-gray-900">
                {clientes.filter(c => {
                  const hoje = new Date().toDateString();
                  const dataCadastro = new Date(c.createdAt).toDateString();
                  return dataCadastro === hoje;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}