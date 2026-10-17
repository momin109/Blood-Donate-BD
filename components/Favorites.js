"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { cn } from "@/lib/cn";

const Ctx = createContext({ favs: [], favDonors: [], toggle: () => {} });
export const useFavs = () => useContext(Ctx);

// Favorite তালিকা এখন API থেকে আসে (GET /api/favorites, PUT/DELETE /api/favorites/:donorId)
export function FavProvider({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [favDonors, setFavDonors] = useState([]);

  const load = useCallback(async () => {
    try {
      const d = await api("/api/favorites");
      setFavDonors(d.items);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return setFavDonors([]);
    load();
  }, [user?.id, load]); // eslint-disable-line react-hooks/exhaustive-deps

  const favs = useMemo(() => favDonors.map((d) => d.id), [favDonors]);

  const toggle = useCallback(
    async (id, donor) => {
      if (!user) return router.push("/login");
      const on = favs.includes(id);
      // optimistic update; ব্যর্থ হলে server-এর অবস্থায় ফিরে যায়
      if (on) setFavDonors((x) => x.filter((d) => d.id !== id));
      else if (donor) setFavDonors((x) => [{ ...donor, isFavorite: true }, ...x]);
      try {
        await api(`/api/favorites/${id}`, { method: on ? "DELETE" : "PUT" });
        if (!on && !donor) await load();
      } catch {
        await load();
      }
    },
    [user, favs, router, load]
  );

  const value = useMemo(() => ({ favs, favDonors, toggle }), [favs, favDonors, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function FavButton({ id, donor, className }) {
  const { user } = useAuth();
  const { favs, toggle } = useFavs();
  if (user?.id === id) return null; // নিজেকে favorite করা যায় না
  const on = favs.includes(id);
  return (
    <button onClick={() => toggle(id, donor)} aria-label="Favorite" className={cn("flex h-10 w-10 items-center justify-center rounded-full transition", on ? "bg-brand-50 text-brand-600" : "bg-gray-100 text-gray-400 hover:text-brand-600", className)}>
      <Heart className={cn("h-5 w-5", on && "fill-brand-600")} />
    </button>
  );
}
