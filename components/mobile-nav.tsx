"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ImagePlusIcon, UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Feed", icon: HomeIcon },
  { href: "/create", label: "Create", icon: ImagePlusIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur sm:hidden"
    >
      <ul className="flex items-center justify-around px-2 py-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-5 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-md",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className={cn(isActive && "font-semibold")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
