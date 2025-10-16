import { CardEmbarcacao} from "./components/CardEmbarcacao";
import { InputPesquisa } from "./components/InputPesquisa";
import type { EmbarcacaoType } from "./utils/EmbarcacaoType";
import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL;

export default function App() {
  const [embarcacoes, setEmbarcacoes] = useState<EmbarcacaoType[]>([]);

  useEffect(() => {
    async function buscaDados() {
      try {
        const response = await fetch(`${apiUrl}/embarcacoes/destaques`);
        const dados = await response.json();

        // Caso o backend retorne { embarcacoes: [...] } ou { data: [...] }
        const lista = Array.isArray(dados)
          ? dados
          : Array.isArray(dados.embarcacoes)
          ? dados.embarcacoes
          : Array.isArray(dados.data)
          ? dados.data
          : [];

        setEmbarcacoes(lista);
      } catch (error) {
        console.error("Erro ao buscar embarcacoes:", error);
        setEmbarcacoes([]);
      }
    }

    buscaDados();


  }, []);

  const listaEmbarcacoes = Array.isArray(embarcacoes)
    ? embarcacoes.map((embarcacao) => <CardEmbarcacao data={embarcacao} key={embarcacao.id} />)
    : null;

  return (
    <div className="bg-gray-100 min-h-screen">
      <InputPesquisa setEmbarcacoes={setEmbarcacoes} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-black">
          Embarcações{" "}
          <span className="underline underline-offset-3 decoration-8 decoration-blue-600 dark:decoration-blue-600">
            em destaque
          </span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {listaEmbarcacoes}
        </div>
      </div>
    </div>
  );
}