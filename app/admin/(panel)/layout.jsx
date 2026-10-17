import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin · Blood Donate BD" };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
