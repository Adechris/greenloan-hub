import { Link } from "@tanstack/react-router";

export function Logo({ variant = "default" }: { variant?: "default" | "light" }) {
  const isLight = variant === "light";
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-lg">
      <span
        className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        <span className="text-xl">₦</span>
      </span>
      <span className={isLight ? "text-sidebar-foreground" : "text-foreground"}>
        Naija<span className="text-gold">Loan</span>
      </span>
    </Link>
  );
}
