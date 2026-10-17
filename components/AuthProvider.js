"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client";
import { detachPush } from "@/lib/push-client";

const Ctx = createContext({ user: null, loading: true });
export const useAuth = () => useContext(Ctx);

// Logged-in user-এর state। পেজ খুলতেই /api/auth/me দিয়ে cookie যাচাই করা হয়।
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let off = false;
    api("/api/auth/me")
      .then((d) => !off && setUser(d.user))
      .catch(() => !off && setUser(null))
      .finally(() => !off && setLoading(false));
    return () => {
      off = true;
    };
  }, []);

  const login = useCallback(async (identifier, password) => {
    const d = await api("/api/auth/login", { method: "POST", body: { identifier, password } });
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (payload) => {
    const d = await api("/api/auth/register", { method: "POST", body: payload });
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await detachPush(); // এই device-এ আর এই user-এর Push যাবে না (কখনো throw করে না)
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (patch) => {
    const d = await api("/api/donors/me", { method: "PATCH", body: patch });
    setUser(d.user);
    return d.user;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
