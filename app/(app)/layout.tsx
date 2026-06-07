import { Navbar } from "@/components/navbar";

/**
 * Primary authenticated application layout.
 *
 * Wraps authenticated pages (e.g. /create) with the top navigation. Access is
 * enforced by the Clerk proxy, which protects all non-public routes.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
