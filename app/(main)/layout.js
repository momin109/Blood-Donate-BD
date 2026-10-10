import Shell from "@/components/Shell";
import { FavProvider } from "@/components/Favorites";
export default function MainLayout({ children }) {
  return <FavProvider><Shell>{children}</Shell></FavProvider>;
}
