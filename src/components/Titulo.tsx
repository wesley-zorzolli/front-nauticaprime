import { Link } from "react-router-dom"
import { useClienteStore } from "../context/ClienteContext"
import { useNavigate } from "react-router-dom"

export default function Titulo() {
    const { cliente, deslogaCliente } = useClienteStore()
    const navigate = useNavigate()

    function clienteSair() {
        if (confirm("Confirma saída do sistema?")) {
            deslogaCliente()
            // Limpar ambos os métodos de storage para garantir
            localStorage.removeItem("clienteKey")
            localStorage.removeItem("cliente-storage")
            navigate("/")
        }
    }

    // Função para obter o primeiro nome
    const getPrimeiroNome = () => {
        if (!cliente.nome) return "Usuário";
        return cliente.nome.split(' ')[0];
    }

    return (
        <nav className="border-blue-500 bg-blue-800 dark:bg-blue-800 dark:border-orange-700">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="/jet.png" className="h-12" alt="Logo Náutica Prime" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
                        Náutica Prime
                    </span>
                </Link>
                
                <div className="hidden w-full md:block md:w-auto" id="navbar-solid-bg">
                    <ul className="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700">
                        <li className="flex items-center space-x-4">
                            {cliente.id ? (
                                <>
                                    <span className="text-green-600 font-semibold text-sm md:text-base">
                                        👋 Olá, {getPrimeiroNome()}
                                    </span>
                                    <Link 
                                        to="/minhasPropostas" 
                                        className="text-white font-bold bg-green-600 hover:bg-green-700 focus:ring-2 focus:outline-none focus:ring-green-400 rounded-lg text-sm px-4 py-2 text-center transition duration-200"
                                    >
                                        Minhas Propostas
                                    </Link>
                                    <button 
                                        onClick={clienteSair}
                                        className="text-white font-bold bg-red-600 hover:bg-red-700 focus:ring-2 focus:outline-none focus:ring-red-400 rounded-lg text-sm px-4 py-2 text-center transition duration-200 cursor-pointer"
                                    >
                                        Sair
                                    </button>
                                </>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="text-white font-bold bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:outline-none focus:ring-orange-400 rounded-lg text-sm px-4 py-2 text-center transition duration-200"
                                >
                                    Identifique-se
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}