import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { me, login as loginRequest } from "../services/auth";
import { setToken } from "../services/api";
import { User, UserRole } from "../types/domain";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => setUser(await loginRequest(email, password)),
      logout: () => {
        setToken(null);
        setUser(null);
      },
      hasRole: (...roles) => Boolean(user && roles.includes(user.role))
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return value;
}
