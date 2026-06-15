import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="grid min-h-[calc(100vh-8rem)] place-items-center bg-[#071016] px-4 py-16 text-white">
      <div className="max-w-2xl text-center">
        <p className="text-sm font-black uppercase text-coral">404</p>
        <h1 className="mt-3 text-5xl font-black leading-tight">That route is not on the board.</h1>
        <p className="mt-4 text-white/70">Every useful AeroNova path is still one click away.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 font-bold text-midnight">
            Book a flight
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <Link to="/support" className="rounded-md border border-white/30 px-5 py-3 font-bold text-white">
            Support
          </Link>
        </div>
      </div>
    </section>
  );
}
