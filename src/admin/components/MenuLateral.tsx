import { useAdminStore } from "../context/AdminContext"
import { IoExitOutline } from "react-icons/io5"
import { BiSolidDashboard } from "react-icons/bi"
import { FaShip, FaUsers, FaListAlt } from "react-icons/fa" 

import { Link, useNavigate } from "react-router-dom"

export function MenuLateral() {
  const navigate = useNavigate()
  const { deslogaAdmin } = useAdminStore()

  function adminSair() {
    if (confirm("Confirma Saída?")) {
      deslogaAdmin()
      navigate("/", { replace: true })
    }
  }

  return (
    <aside id="default-sidebar" className="fixed mt-24 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto bg-blue-300 dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li>
            <Link to="/admin" className="flex items-center p-2">
              <span className="h-5 text-gray-600 text-2xl">
                <BiSolidDashboard />
              </span>
              <span className="ms-2 mt-1 text-white">Visão Geral</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/embarcacoes" className="flex items-center p-2">
              <span className="h-5 text-gray-600 text-2xl">
                <FaShip /> {/* Mudei para ícone de barco */}
              </span>
              <span className="ms-2 mt-1 text-white">Cadastro de Embarcações</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/clientes" className="flex items-center p-2">
              <span className="h-5 text-gray-600 text-2xl">
                <FaUsers />
              </span>
              <span className="ms-2 mt-1 text-white">Controle de Clientes</span>
            </Link>
          </li>
          <li>
            <Link to="/admin/propostas" className="flex items-center p-2 cursor-pointer">
              <span className="h-5 text-gray-600 text-2xl">
                <FaListAlt /> {/* Mudei BsCashCoin para FaListAlt */}
              </span>
              <span className="ms-2 mt-1 text-white">Controle de Propostas</span>
            </Link>
          </li>

          <li>
            <span className="flex items-center p-2 cursor-pointer" onClick={adminSair}>
              <span className="h-5 text-gray-600 text-2xl">
                <IoExitOutline />
              </span>
              <span className="ms-2 mt-1 text-white">Sair do Sistema</span>
            </span>
          </li>
        </ul>
      </div>
    </aside>
  )
}