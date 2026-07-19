"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { HomeIcon, ImagePlusIcon, MessageCircleIcon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Feed", icon: HomeIcon },
  { href: "/create", label: "Create", icon: ImagePlusIcon },
  { href: "/messages", label: "Messages", icon: MessageCircleIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4"
      >
        <Link
          href="/"
          className="font-heading text-2xl font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          Connector
        </Link>

        <div className="hidden items-center gap-1 sm:flex" role="list">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn("transition-all", isActive && "font-medium")}
                aria-current={isActive ? "page" : undefined}
              >
                <Link href={href} role="listitem">
                  <Icon className="size-4" />
                  <span>{label}</span>
                </Link>
              </Button>
            );
          })}
        </div>

        <UserButton />
      </nav>
    </header>
  );
}
