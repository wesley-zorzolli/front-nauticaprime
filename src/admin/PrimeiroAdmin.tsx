import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

type Inputs = {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  nivel: number;
};

export default function PrimeiroAdmin() {
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const navigate = useNavigate();
  const [verificando, setVerificando] = useState(true);
  const [podeCriar, setPodeCriar] = useState(false);

  useEffect(() => {
    verificarAdminExistente();
  }, []);

  async function verificarAdminExistente() {
    try {
      // Usar a rota pública para verificar se já existe admin
      const response = await fetch(`${apiUrl}/admins/existe`);

      if (response.ok) {
        const data = await response.json();
        if (data.existeAdmin) {
          // Já existem admins, redirecionar para login
          toast.info("Já existe um administrador cadastrado. Faça login.");
          navigate("/admin/login");
        } else {
          setPodeCriar(true);
        }
      } else {
        // Em caso de erro, assumir que pode criar o primeiro admin
        setPodeCriar(true);
      }
    } catch (error) {
      // Em caso de erro, assumir que pode criar o primeiro admin
      setPodeCriar(true);
    } finally {
      setVerificando(false);
    }
  }

  async function criarPrimeiroAdmin(data: Inputs) {
    if (data.senha !== data.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (data.senha.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/admins/primeiro-acesso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          nivel: 5 // Nível máximo para o primeiro admin
        }),
      });

      if (response.status === 201) {
        toast.success("Administrador criado com sucesso! Faça login.");
        navigate("/admin/login");
      } else if (response.status === 400) {
        const erro = await response.json();
        toast.error(erro.erro || "Erro ao criar administrador");
      } else {
        toast.error("Erro ao criar administrador");
      }
    } catch (error) {
      toast.error("Erro de conexão. Verifique se o servidor está rodando.");
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  if (!podeCriar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/jet.png" alt="Logo" className="h-16 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Configuração Inicial do Sistema
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Crie o primeiro usuário administrador
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              ⚠️ Configuração Inicial
            </h3>
            <p className="text-sm text-blue-700">
              Este é o primeiro acesso ao sistema. Crie uma conta de administrador com acesso total.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(criarPrimeiroAdmin)}>
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <div className="mt-1">
                <input
                  {...register("nome", { required: "Informe o nome" })}
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Seu nome completo"
                />
                {errors.nome && (
                  <span className="text-red-600 text-xs">{errors.nome.message}</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="mt-1">
                <input
                  {...register("email", { required: "Informe o e-mail" })}
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <span className="text-red-600 text-xs">{errors.email.message}</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  {...register("senha", { required: "Informe a senha", minLength: { value: 8, message: "Mínimo 8 caracteres" } })}
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.senha && (
                  <span className="text-red-600 text-xs">{errors.senha.message}</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <div className="mt-1">
                <input
                  {...register("confirmarSenha", { required: "Confirme a senha" })}
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite a senha novamente"
                />
                {errors.confirmarSenha && (
                  <span className="text-red-600 text-xs">{errors.confirmarSenha.message}</span>
                )}
              </div>
            </div>

            <div className="hidden">
              <label htmlFor="nivel" className="block text-sm font-medium text-gray-700">
                Nível de Acesso
              </label>
              <div className="mt-1">
                <select
                  {...register("nivel", { valueAsNumber: true })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>Super Administrador</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Criar Administrador
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ou
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Voltar para o site principal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}