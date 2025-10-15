import { Link } from "react-router-dom"
import { useEffect } from "react"
import { resolveFoto } from "../utils/resolveFoto"
import type { EmbarcacaoType } from "../utils/EmbarcacaoType"

export function CardEmbarcacao({data}: {data: EmbarcacaoType}) {
  useEffect(() => {
    // Debug apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.debug('[CardEmbarcacao] foto embarcacao id', data.id, 'valor foto=', data.foto)
    }
  }, [data.id, data.foto])
  
  // Função segura para obter o nome da marca
  const getMarcaNome = () => {
    if (!data.marca) {
      return "Marca não disponível";
    }
    return data.marca.nome;
  };

    // Lógica original: aceita URL absoluta, caminho relativo ou só nome
    const fotoSrc = resolveFoto(data.foto)

  return (
  <div className="max-w-md bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 relative">
        <img
          className="rounded-t-lg w-full h-64 object-cover bg-gray-200"
          src={fotoSrc}
          alt={`${data.modelo}`}
          loading="lazy"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.src = 'https://via.placeholder.com/300x200?text=Sem+Imagem';
          }}
        />
        {data.vendida && (
          <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-lg z-10">VENDIDA</span>
        )}
  <div className="p-6">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {getMarcaNome()} {data.modelo}
        </h5>
        <p className="mb-3 font-extrabold text-gray-700 dark:text-gray-400">
          Preço R$: {Number(data.preco).toLocaleString("pt-br", {
            minimumFractionDigits: 2
          })}
        </p>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          Ano: {data.ano} - {data.motor}
        </p>
        <Link 
          to={`/detalhes/${data.id}`} 
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors duration-200"
        >
          Ver Detalhes
          <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
          </svg>
        </Link>
      </div>
    </div>
  )
}