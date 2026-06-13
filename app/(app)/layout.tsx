import { MobileNav } from "@/components/mobile-nav";
import { Navbar } from "@/components/navbar";

/**
 * Primary authenticated application layout.
 *
 * Wraps authenticated pages with the top navigation and mobile bottom nav.
 * Access is enforced by the Clerk proxy, which protects all non-public routes.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
