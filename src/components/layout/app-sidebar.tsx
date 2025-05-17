
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof Icons;
}

const navItems: NavItem[] = [
  { href: "/notes", label: "Notes", icon: "Lightbulb" },
  { href: "/reminders", label: "Reminders", icon: "Bell" },
  { href: "/labels", label: "Edit labels", icon: "Tag" },
  { href: "/archive", label: "Archive", icon: "Archive" },
  { href: "/trash", label: "Trash", icon: "Trash" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2 pr-0">
      {navItems.map((item) => {
        const Icon = Icons[item.icon];
        // A simple way to check for active route. For nested routes, more complex logic might be needed.
        // For now, we assume "/notes" is the primary active route if others aren't matched perfectly.
        const isActive = item.href === "/notes" ? (pathname === "/" || pathname.startsWith("/notes")) : pathname.startsWith(item.href);
        
        return (
          <Link href={item.href === "/notes" ? "/" : item.href} key={item.label} legacyBehavior passHref>
            <a
              className={cn(
                "flex items-center gap-3 rounded-r-full py-2.5 px-6 text-base font-medium transition-colors",
                "hover:bg-app-sidebar-hover-background hover:text-app-sidebar-hover-foreground",
                isActive
                  ? "bg-app-sidebar-selected-background text-app-sidebar-selected-foreground"
                  : "text-app-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-app-sidebar-selected-foreground" : "text-app-sidebar-foreground/70")} />
              {item.label}
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
