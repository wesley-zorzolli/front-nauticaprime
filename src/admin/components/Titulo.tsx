import { FiUsers } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useAdminStore } from "../context/AdminContext"

export function Titulo() {
  const { admin } = useAdminStore()

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg border-gray-200 dark:bg-gray-900 flex flex-wrap justify-between items-center fixed top-0 left-0 w-full z-50 px-4 py-3">
      <div className="flex items-center space-x-3">
        <Link to="/admin" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="/jet.png" className="h-12 w-12 object-contain" alt="Naútica Prime Logo" />
          <span className="self-center text-2xl font-bold text-white whitespace-nowrap">
            Naútica Prime
          </span>
        </Link>
        <div className="hidden sm:block">
          <span className="text-blue-200 text-sm font-medium bg-blue-700/30 px-3 py-1 rounded-full">
            Painel Administrativo
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-white font-medium">
          <FiUsers className="text-blue-200" size={18} />
          <span className="text-white font-semibold">
            {admin.nome || 'Admin'}
          </span>
        </div>
      </div>
    </nav>
  )
}