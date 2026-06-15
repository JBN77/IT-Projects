import { ArrowRight, MapPin, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { FlightSearchForm } from "../components/FlightSearchForm";
import { editorialRoutes, flightLink } from "../lib/brand";

export function DestinationsPage() {
  return (
    <section className="dark-section text-white">
      <div className="relative overflow-hidden bg-black py-20 text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-48"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/ramp-planes-poster.jpg"
          aria-hidden="true"
        >
          <source src="/media/ramp-planes-web.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative apple-reveal">
            <p className="text-sm font-black uppercase text-coral">Destinations</p>
            <h1 className="mt-3 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">
            Three launch routes, one very fast booking lane.
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div>
          <FlightSearchForm compact />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {editorialRoutes.map((route) => (
            <article key={route.code} className="route-card dark-card overflow-hidden rounded-lg">
              <div className="media-frame aspect-[4/3] bg-midnight">
                <img
                  src={route.image}
                  alt={`${route.city} airport photograph`}
                  className="media-zoom h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-sm font-bold uppercase text-coral">
                    <MapPin aria-hidden="true" size={16} />
                    {route.city}
                  </span>
                  <span className="rounded-md bg-white/10 px-3 py-1 text-sm font-black text-white">{route.code}</span>
                </div>
                <h2 className="mt-4 text-2xl font-black">{route.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{route.detail}</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black">{route.fare}</p>
                    <p className="text-sm text-white/55">One way from</p>
                  </div>
                  <Link
                    to={flightLink(route)}
                    className="inline-flex items-center gap-2 rounded-md bg-coral px-4 py-3 text-sm font-bold text-white transition hover:bg-[#db4f2b]"
                  >
                    Book
                    <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="dark-card rounded-lg p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-coral">Route promise</p>
              <h2 className="mt-2 text-3xl font-black">Every launch city is searchable, bookable, and manageable.</h2>
            </div>
            <Plane aria-hidden="true" className="text-aero" size={42} />
          </div>
        </div>
      </div>
    </section>
  );
}
