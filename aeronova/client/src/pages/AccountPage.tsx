import { LogOut, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type StoredUser = {
  firstName: string;
  email: string;
};

export function AccountPage() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("aeronova_user");
    if (!raw) return;
    try {
      setUser(JSON.parse(raw) as StoredUser);
    } catch {
      setUser(null);
    }
  }, []);

  function signOut() {
    localStorage.removeItem("aeronova_user");
    localStorage.removeItem("aeronova_token");
    window.dispatchEvent(new Event("aeronova-auth"));
    setUser(null);
  }

  return (
    <section className="bg-linen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-midnight text-white">
                <UserRound aria-hidden="true" size={26} />
              </span>
              <div>
                <p className="text-sm font-black uppercase text-coral">Account</p>
                <h1 className="mt-1 text-3xl font-black text-ink">{user ? `Welcome, ${user.firstName}` : "Welcome aboard"}</h1>
                <p className="mt-1 text-sm text-runway">{user?.email ?? "Sign in to keep your profile connected."}</p>
              </div>
            </div>
            {user ? (
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-4 py-2 text-sm font-bold text-runway"
              >
                <LogOut aria-hidden="true" size={16} />
                Sign out
              </button>
            ) : (
              <Link to="/login" className="rounded-md bg-midnight px-4 py-2 text-sm font-bold text-white">
                Sign in
              </Link>
            )}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Book faster", copy: "Start a new search with the premium AeroNova flow.", to: "/flights" },
              { title: "Manage trips", copy: "Look up a confirmation code and view seats.", to: "/trips" },
              { title: "Get help", copy: "Create a functional support ticket.", to: "/support" }
            ].map((item) => (
              <Link key={item.title} to={item.to} className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-5">
                <h2 className="text-xl font-black text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-runway">{item.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
