import Link from "next/link";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const TESTIMONIALS = [
  {
    quote:
      "Connector has completely changed how I keep up with the people I care about. Sharing moments has never felt this effortless.",
    name: "Satyam Chaturvedi",
    designation: "@satyam.xd",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  },
  {
    quote:
      "I love how clean and simple Connector is. No noise, just the people and moments that matter.",
    name: "Priya Sharma",
    designation: "@priya.s",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop",
  },
  {
    quote:
      "Finally a social platform that feels human. Connector is the only app I actually look forward to opening.",
    name: "Alex Turner",
    designation: "@alex.t",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
  },
];

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* ── Left panel — form ── */}
      <div className="relative flex w-full flex-col lg:w-1/2">
        {/* Brand */}
        <div className="px-8 pt-8 hidden lg:block">
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

      {/* ── Right panel — testimonials (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-sidebar">
        <AnimatedTestimonials testimonials={TESTIMONIALS} autoplay />
      </div>
    </div>
  );
}
