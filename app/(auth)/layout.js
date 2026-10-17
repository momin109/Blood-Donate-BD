import { AuthProvider } from "@/components/AuthProvider";
export default function AuthLayout({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
