import type { MarcaType } from "./MarcaType"

export type EmbarcacaoType = {
    id: number
    modelo: string
    ano: number
    preco: number
    motor: string // combustível
    km_horas: string // horas de uso
    foto: string
    acessorios: string | null
    vendida: boolean
    createdAt: Date
    updatedAt: Date
    marcaId: number
    adminId?: string
    marca: MarcaType
}