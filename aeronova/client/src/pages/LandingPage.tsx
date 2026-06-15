import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Gauge,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
  TimerReset
} from "lucide-react";
import { Link } from "react-router-dom";
import { FlightSearchForm } from "../components/FlightSearchForm";
import { brandAssets, cabinStories, editorialRoutes, flightLink, serviceHighlights } from "../lib/brand";

const marqueeItems = ["JFK to LHR", "LAX to HND", "SFO to CDG", "Premium cabins", "Live seat map", "Direct journey"];

export function LandingPage() {
  return (
    <>
      <section className="motion-stage relative min-h-[calc(100svh-4rem)] overflow-hidden bg-black text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={brandAssets.heroPoster}
          aria-hidden="true"
        >
          <source src={brandAssets.heroVideo} type="video/mp4" />
        </video>

        <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl content-end px-4 pb-24 pt-24 sm:px-6 lg:px-8">
          <div className="apple-reveal max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white/82 backdrop-blur">
              <Sparkles aria-hidden="true" size={16} />
              Premium routes, cinematic booking
            </div>
            <h1 className="max-w-5xl text-6xl font-black leading-none sm:text-7xl lg:text-8xl">AeroNova</h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/78">
              Cross oceans with clear fares, calmer cabins, and a booking journey that moves at the pace of your trip.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/flights"
                className="inline-flex items-center gap-2 rounded-md bg-coral px-5 py-3 font-bold text-white transition hover:bg-[#db4f2b]"
              >
                Book now
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                to="/experience"
                className="inline-flex items-center gap-2 rounded-md border border-white/18 bg-white/10 px-5 py-3 font-bold text-white backdrop-blur transition hover:bg-white/16"
              >
                Explore cabins
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="dark-section px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto -mt-16 max-w-7xl">
          <FlightSearchForm compact />
        </div>
      </section>

      <div className="overflow-hidden border-y border-white/10 bg-black py-4 text-white">
        <div className="marquee-track gap-10">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`} className="text-sm font-black uppercase text-white/60">
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="dark-section py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="apple-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-coral">Featured departures</p>
              <h2 className="mt-2 text-4xl font-black sm:text-5xl">Real routes, real airport texture.</h2>
            </div>
            <Link to="/destinations" className="inline-flex items-center gap-2 text-sm font-bold text-white/78">
              See every destination
              <ChevronRight aria-hidden="true" size={17} />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {editorialRoutes.map((route) => (
              <Link
                key={route.code}
                to={flightLink(route)}
                className="route-card dark-card overflow-hidden rounded-lg text-white"
              >
                <div className="media-frame aspect-[4/3] bg-black">
                  <img
                    src={route.image}
                    alt={`${route.city} airport photograph`}
                    className="media-zoom h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold uppercase text-coral">{route.detail}</p>
                  <h3 className="mt-3 text-2xl font-black">{route.title}</h3>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black">{route.fare}</p>
                      <p className="text-sm text-white/55">One way from</p>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-md bg-white/10 text-white">
                      <ArrowRight aria-hidden="true" size={18} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[88svh] overflow-hidden bg-black text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={brandAssets.rampPoster}
          aria-hidden="true"
        >
          <source src={brandAssets.rampVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/58 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        <div className="relative mx-auto grid min-h-[88svh] max-w-7xl content-center px-4 sm:px-6 lg:px-8">
          <div className="apple-reveal max-w-2xl">
            <p className="text-sm font-black uppercase text-coral">Ground to sky</p>
            <h2 className="mt-3 text-5xl font-black leading-tight sm:text-6xl">A booking flow with runway energy.</h2>
            <p className="mt-5 text-lg leading-8 text-white/72">
              From gate windows to final approach, AeroNova keeps every step focused, direct, and calm.
            </p>
          </div>
        </div>
      </section>

      <section className="dark-section py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="media-frame min-h-[520px] bg-black">
            <img
              src={brandAssets.cabinBusiness}
              alt="Business class cabin photograph"
              className="media-zoom h-full w-full object-cover"
            />
          </div>
          <div className="grid content-center gap-6">
            <div className="apple-reveal">
              <p className="text-sm font-black uppercase text-coral">Choose your atmosphere</p>
              <h2 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">Cabins that feel calm before takeoff.</h2>
            </div>
            <div className="grid gap-4">
              {cabinStories.map((story) => (
                <article key={story.name} className="dark-card rounded-lg p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">{story.name}</h3>
                      <p className="mt-1 text-sm text-white/62">{story.tag}</p>
                    </div>
                    <span className="rounded-md bg-white/10 px-3 py-1 text-sm font-black text-white">{story.price}</span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {story.points.map((point) => (
                      <span key={point} className="inline-flex items-center gap-2 text-sm text-white/72">
                        <BadgeCheck aria-hidden="true" size={15} className="text-aero" />
                        {point}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <Link
              to="/experience"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-white/92 px-5 py-3 font-bold text-black transition hover:bg-white"
            >
              Compare cabins
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-black py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: PlaneTakeoff, title: "Fast search", copy: "Choose a route and move straight into available fares." },
            { icon: Gauge, title: "Live seats", copy: "Seat modifiers update totals before checkout." },
            { icon: TimerReset, title: "Trip tools", copy: "Confirmation lookup keeps your journey within reach." },
            { icon: ShieldCheck, title: "Connected journey", copy: "Every step flows from search to confirmation." }
          ].map((item) => (
            <article key={item.title} className="dark-card rounded-lg p-5">
              <item.icon aria-hidden="true" className="mb-5 text-aero" size={26} />
              <h2 className="text-lg font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/62">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dark-section py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="apple-reveal">
            <p className="text-sm font-black uppercase text-coral">Built for the journey</p>
            <h2 className="mt-2 text-4xl font-black sm:text-5xl">A premium trip from first search to final seat.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {serviceHighlights.map((highlight) => (
              <div key={highlight} className="dark-card rounded-lg p-5 text-lg font-bold">
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
