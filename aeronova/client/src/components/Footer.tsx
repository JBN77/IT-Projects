import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#071016] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-midnight">
              <Plane aria-hidden="true" size={21} />
            </span>
            <span className="text-xl font-black">AeroNova</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            Premium long-haul booking with clear fares, fast seats, and calm trip tools.
          </p>
        </div>

        <div className="grid gap-3 text-sm">
          <p className="font-semibold text-white">Fly</p>
          <Link className="text-white/70 hover:text-white" to="/flights">
            Search flights
          </Link>
          <Link className="text-white/70 hover:text-white" to="/destinations">
            Destinations
          </Link>
          <Link className="text-white/70 hover:text-white" to="/experience">
            Experience
          </Link>
        </div>

        <div className="grid gap-3 text-sm">
          <p className="font-semibold text-white">Travel</p>
          <Link className="text-white/70 hover:text-white" to="/trips">
            Manage trip
          </Link>
          <Link className="text-white/70 hover:text-white" to="/support">
            Support
          </Link>
          <Link className="text-white/70 hover:text-white" to="/account">
            Account
          </Link>
        </div>

        <div className="grid gap-3 text-sm">
          <p className="font-semibold text-white">Policy</p>
          <Link className="text-white/70 hover:text-white" to="/privacy">
            Privacy
          </Link>
          <Link className="text-white/70 hover:text-white" to="/accessibility">
            Accessibility
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/55">
        AeroNova is a fictional airline.
      </div>
    </footer>
  );
}
