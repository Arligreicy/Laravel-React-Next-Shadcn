"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchMe } from "@/lib/authService";

type User = {
  id?: number;
  name?: string;
  email?: string;
  avatar?: string;
  login?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 👉 BUSCA O USUÁRIO ASSIM QUE O PROVIDER CARREGAR
  useEffect(() => {
    async function loadUser() {
      try {
        const me = await fetchMe(); // chama o backend
        if (me) setUser(me);        // popula o contexto
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    }

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
