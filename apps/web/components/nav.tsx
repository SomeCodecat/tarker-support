import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/items", label: "Items" },
  { href: "/ammo", label: "Ammo" },
  { href: "/tasks", label: "Tasks" },
  { href: "/traders", label: "Traders" },
  { href: "/hideout", label: "Hideout" },
];

export function Nav() {
  return (
    <nav className="flex gap-4 border-b border-neutral-800 bg-neutral-950 px-4 py-3 text-sm">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-neutral-300 hover:text-amber-400">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
