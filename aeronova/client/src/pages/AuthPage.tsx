import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { loginUser, registerUser } from "../lib/api";

type AuthPageProps = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === "register";
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = isRegister ? await registerUser(form) : await loginUser(form);
      localStorage.setItem("aeronova_token", result.token);
      localStorage.setItem("aeronova_user", JSON.stringify(result.user));
      window.dispatchEvent(new Event("aeronova-auth"));
      setMessage(`Welcome, ${result.user.firstName}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid min-h-[calc(100vh-8rem)] place-items-center bg-[#071016] px-4 py-12">
      <div className="w-full max-w-lg rounded-lg border border-white/10 bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg bg-midnight text-white">
            <UserRound aria-hidden="true" size={22} />
          </div>
          <p className="text-sm font-semibold uppercase text-coral">{isRegister ? "Join AeroNova" : "AeroNova account"}</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{isRegister ? "Create account" : "Sign in"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {isRegister && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-runway">First name</span>
                <input
                  required
                  value={form.firstName}
                  onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                  className="h-12 rounded-md border border-stone-200 px-3"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-runway">Last name</span>
                <input
                  required
                  value={form.lastName}
                  onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                  className="h-12 rounded-md border border-stone-200 px-3"
                />
              </label>
            </div>
          )}

          <label className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-runway">
              <Mail aria-hidden="true" size={15} />
              Email
            </span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="h-12 rounded-md border border-stone-200 px-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-runway">
              <LockKeyhole aria-hidden="true" size={15} />
              Password
            </span>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="h-12 rounded-md border border-stone-200 px-3"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-midnight px-5 py-3 font-semibold text-white transition hover:bg-runway disabled:opacity-60"
          >
            {loading ? "Working..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        {message && <p className="mt-4 rounded-md bg-linen p-3 text-sm text-runway">{message}</p>}

        {message && (
          <Link
            to="/account"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-midnight px-4 py-2 text-sm font-bold text-white"
          >
            Go to account
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        )}

        <p className="mt-6 text-sm text-runway">
          {isRegister ? "Already flying with AeroNova?" : "New to AeroNova?"}{" "}
          <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-midnight">
            {isRegister ? "Sign in" : "Create account"}
          </Link>
        </p>
      </div>
    </section>
  );
}
