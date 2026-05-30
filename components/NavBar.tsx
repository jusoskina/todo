"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Board" },
  { href: "/future", label: "Future" },
  { href: "/next-week", label: "Next week" },
  { href: "/history", label: "History" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex items-center gap-2">
      <span className="mr-1 flex items-center gap-2 text-sm font-bold text-foreground">
        <span
          className="flex h-6 w-6 items-center justify-center rounded bg-baby-blue-dark text-xs text-white"
          aria-hidden="true"
        >
          ✓
        </span>
        Todo
      </span>
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`nav-link ${active ? "nav-link-active" : "nav-link-inactive"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
