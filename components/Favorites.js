"use client";
import { createContext, useContext, useState } from "react";
import { Heart } from "lucide-react";
import { initialFavorites } from "@/data";
import { cn } from "@/lib/cn";

const Ctx = createContext({ favs: [], toggle: () => {} });
export const useFavs = () => useContext(Ctx);

export function FavProvider({ children }) {
  const [favs, setFavs] = useState(initialFavorites);
  const toggle = (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  return <Ctx.Provider value={{ favs, toggle }}>{children}</Ctx.Provider>;
}

export function FavButton({ id, className }) {
  const { favs, toggle } = useFavs();
  const on = favs.includes(id);
  return (
    <button onClick={() => toggle(id)} aria-label="Favorite" className={cn("flex h-10 w-10 items-center justify-center rounded-full transition", on ? "bg-brand-50 text-brand-600" : "bg-gray-100 text-gray-400 hover:text-brand-600", className)}>
      <Heart className={cn("h-5 w-5", on && "fill-brand-600")} />
    </button>
  );
}
