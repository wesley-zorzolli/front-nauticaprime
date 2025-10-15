import type { EmbarcacaoType } from "./EmbarcacaoType"
import type { ClienteType } from "./ClienteType"

export type PropostaType = {
  id: number
  clienteId: string
  embarcacaoId: number
  embarcacao: EmbarcacaoType
  cliente: ClienteType
  descricao: string
  status: string
  resposta: string | null
  createdAt: string
  updatedAt: string | null
  adminId?: string
}