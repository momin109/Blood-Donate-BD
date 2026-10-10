"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
export default function PasswordField({ label, error, ...p }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="relative">
        <input type={show ? "text" : "password"} className={"field pr-12 " + (error ? "border-brand-500 ring-4 ring-brand-100" : "")} placeholder="••••••••" {...p} />
        <button type="button" onClick={() => setShow(!show)} aria-label="Toggle password" className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-ink">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <span className="mt-1 block text-xs text-brand-600">{error}</span>}
    </label>
  );
}
