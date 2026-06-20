import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TESTIMONIAL = {
  quote:
    "Connector has completely changed how I keep up with the people I care about. Sharing moments has never felt this effortless.",
  name: "Satyam Chaturvedi",
  handle: "@satyam.xd",
  initials: "SC",
};

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Left panel — form ── */}
      <div className="relative flex w-full flex-col lg:w-1/2">
        {/* Brand */}
        <div className="px-8 pt-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            Connector
          </Link>
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          {children}
        </div>
      </div>

      {/* ── Right panel — testimonial (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-sidebar px-16 py-16">
        <blockquote className="max-w-sm space-y-6">
          <span
            aria-hidden
            className="block font-serif text-7xl leading-none text-muted-foreground select-none"
          >
            &ldquo;
          </span>

          <p className="text-2xl font-medium leading-snug text-foreground">
            {TESTIMONIAL.quote}
          </p>

          <footer className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>{TESTIMONIAL.initials}</AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">
                {TESTIMONIAL.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {TESTIMONIAL.handle}
              </p>
            </div>
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
