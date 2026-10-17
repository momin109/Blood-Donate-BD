import Shell from "@/components/Shell";
import { AuthProvider } from "@/components/AuthProvider";
import { FavProvider } from "@/components/Favorites";
export default function MainLayout({ children }) {
  return (
    <AuthProvider>
      <FavProvider>
        <Shell>{children}</Shell>
      </FavProvider>
    </AuthProvider>
  );
}
