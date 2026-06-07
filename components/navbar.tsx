import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ImagePlusIcon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Top navigation for authenticated app pages.
 *
 * Logo links home, a Create action links to /create, and the Clerk user button
 * provides the account menu. Sticky and responsive.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="font-heading text-2xl font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          Connector
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="group transition-all hover:bg-muted hover:text-foreground active:scale-95"
          >
            <Link href="/create">
              <ImagePlusIcon className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110" />
              <span className="hidden sm:inline">Create</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="group transition-all hover:bg-muted hover:text-foreground active:scale-95"
          >
            <Link href="/profile">
              <UserIcon className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </Button>

          <UserButton />
        </div>
      </nav>
    </header>
  );
}
