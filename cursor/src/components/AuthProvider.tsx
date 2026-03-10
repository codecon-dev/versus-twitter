"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
}>({ user: null, loading: true, setUser: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => (r.ok ? r.json() : { data: null }))
      .then((j) => {
        if (j.data) setUser(j.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
