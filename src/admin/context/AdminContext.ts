import type { AdminType } from '../../utils/AdminType'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminStore = {
    admin: AdminType
    logaAdmin: (adminLogado: AdminType) => void
    deslogaAdmin: () => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      admin: {} as AdminType,
      logaAdmin: (adminLogado) => {
        // Salvar token no localStorage separadamente
        if (adminLogado.token) {
          localStorage.setItem("adminToken", adminLogado.token);
        }
        set({ admin: adminLogado });
      },
      deslogaAdmin: () => {
        // Remover token do localStorage
        localStorage.removeItem("adminToken");
        set({ admin: {} as AdminType });
      }
    }),
    {
      name: 'admin-storage',
    }
  )
);