"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type Mode = "login" | "register";

type AuthModalCtx = {
  isOpen: boolean;
  mode: Mode;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
};

const Ctx = createContext<AuthModalCtx | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const value = useMemo(
    () => ({
      isOpen,
      mode,
      openLogin: () => {
        setMode("login");
        setIsOpen(true);
      },
      openRegister: () => {
        setMode("register");
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
    }),
    [isOpen, mode]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuthModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}