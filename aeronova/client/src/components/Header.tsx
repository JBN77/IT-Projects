import { Menu, Plane, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Book" },
  { to: "/destinations", label: "Destinations" },
  { to: "/experience", label: "Experience" },
  { to: "/trips", label: "Trips" },
  { to: "/support", label: "Support" }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    function syncUser() {
      const raw = localStorage.getItem("aeronova_user");
      if (!raw) {
        setUserName(null);
        return;
      }

      try {
        const user = JSON.parse(raw) as { firstName?: string };
        setUserName(user.firstName ?? "Account");
      } catch {
        setUserName(null);
      }
    }

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("aeronova-auth", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("aeronova-auth", syncUser);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/72 text-white backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white shadow-lg shadow-black/30 ring-1 ring-white/15">
            <Plane aria-hidden="true" size={21} />
          </span>
          <span className="text-xl font-black">AeroNova</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-white/12 text-white" : "text-white/68 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to={userName ? "/account" : "/register"}
            className="ml-2 inline-flex items-center gap-2 rounded-md bg-white/95 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white"
          >
            <UserRound aria-hidden="true" size={16} />
            {userName ?? "Join"}
          </Link>
        </nav>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md border border-white/15 bg-white/10 text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-black/95 px-4 py-3 md:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-white/12 text-white" : "text-white/70"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to={userName ? "/account" : "/register"}
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-md bg-white/95 px-3 py-2 text-sm font-semibold text-black"
            >
              <UserRound aria-hidden="true" size={16} />
              {userName ?? "Join"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
