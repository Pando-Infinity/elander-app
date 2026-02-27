/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { ReactNode } from "react";
import { createJSONStorage, persist } from "zustand/middleware";
import { ToastInterface, ToastStatusEnum } from "@/models/common.model";

export interface ToastState {
  toast: ToastInterface | null;
  setToast: (toast: ToastInterface | null) => void;

  message: (title: ReactNode, content?: ReactNode, duration?: number) => void;
  success: (title: ReactNode, content?: ReactNode, duration?: number) => void;
  error: (title: ReactNode, content?: ReactNode, duration?: number) => void;
  transactionSuccess: (txHash: string, duration?: number) => void;
  transactionError: () => void;
}

const init = {
  toast: null,
};

const useToast = create<ToastState>()(
  persist(
    (set) => ({
      ...init,
      setToast: (toast: ToastInterface | null) => set({ toast: toast }),

      message: (title, content, duration) => {
        const data = {
          status: ToastStatusEnum.DEFAULT,
          title: title,
          content: content,
          duration,
        };
        set({ toast: data });
      },

      success: (title, content, duration) => {
        const data = {
          status: ToastStatusEnum.SUCCESS,
          title: title,
          content: content,
          duration,
        };
        set({ toast: data });
      },

      error: (title, content, duration) => {
        const data = {
          status: ToastStatusEnum.ERROR,
          title: title,
          content: content,
          duration,
        };
        set({ toast: data });
      },

      transactionSuccess: (txHash, duration) => {
        const data = {
          status: ToastStatusEnum.SUCCESS,
          title: "Transaction Succeeded",
          transactionHash: txHash,
          duration,
        };
        set({ toast: data });
      },

      transactionError: () => {
        const data = {
          status: ToastStatusEnum.ERROR,
          title: "Transaction Failed",
        };
        set({ toast: data });
      },
    }),
    {
      name: "toast-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { useToast };
