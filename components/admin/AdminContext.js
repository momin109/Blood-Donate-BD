"use client";
import { createContext, useContext } from "react";

// { admin, stats, reload } — AdminShell দেয়; stats = GET /api/admin/stats এর ফল
export const AdminCtx = createContext({ admin: null, stats: null, reload: () => {} });
export const useAdmin = () => useContext(AdminCtx);
