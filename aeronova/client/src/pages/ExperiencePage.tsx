import { ArrowRight, BadgeCheck, Coffee, MonitorPlay, PlugZap, ShieldCheck, Sofa } from "lucide-react";
import { Link } from "react-router-dom";
import { brandAssets, cabinStories } from "../lib/brand";

const amenities = [
  { icon: Sofa, title: "Comfort-first cabins", copy: "Clear seat tiers, wide rows, and a map that never hides the price." },
  { icon: MonitorPlay, title: "Clear journey", copy: "Route choices, cabin tiers, and trip details stay close from search to checkout." },
  { icon: Coffee, title: "Service rhythm", copy: "Premium cabin story, dining cues, and honest details before checkout." },
  { icon: PlugZap, title: "Power ready", copy: "Every cabin tier is positioned around modern traveler needs." }
];

export function ExperiencePage() {
  return (
    <section className="dark-section text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="apple-reveal grid content-center">
          <p className="text-sm font-black uppercase text-coral">AeroNova experience</p>
          <h1 className="mt-3 text-5xl font-black leading-tight sm:text-6xl">
            Premium where it matters: choosing, sitting, arriving.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/68">
            Compare cabin tiers, understand the perks, and move into booking from the same polished journey.
          </p>
          <Link
            to="/flights"
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-coral px-5 py-3 font-bold text-white transition hover:bg-[#db4f2b]"
          >
            Book a cabin
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <div className="media-frame min-h-[460px] bg-midnight">
          <img
            src={brandAssets.cabinBusiness}
            alt="Business class cabin photograph"
            className="media-zoom h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="bg-black py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {cabinStories.map((story) => (
            <article key={story.name} className="dark-card rounded-lg p-5">
              <span className="rounded-md bg-white/10 px-3 py-1 text-sm font-black text-white">{story.price}</span>
              <h2 className="mt-5 text-2xl font-black">{story.name}</h2>
              <p className="mt-2 text-sm text-white/70">{story.tag}</p>
              <div className="mt-5 grid gap-3">
                {story.points.map((point) => (
                  <span key={point} className="inline-flex items-center gap-2 text-sm text-white/80">
                    <BadgeCheck aria-hidden="true" size={16} className="text-aero" />
                    {point}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="dark-section py-14">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {amenities.map((item) => (
            <article key={item.title} className="dark-card rounded-lg p-5">
              <item.icon aria-hidden="true" className="mb-5 text-aero" size={27} />
              <h2 className="text-lg font-black">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/62">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden bg-black py-16">
        <img
          src={brandAssets.cabinEconomy}
          alt="Airplane passenger cabin photograph"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/20" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-3xl rounded-lg border border-white/10 bg-black/60 p-8 text-white backdrop-blur sm:p-10">
            <ShieldCheck aria-hidden="true" className="text-aero" size={32} />
            <h2 className="mt-5 text-4xl font-black">Every detail serves the journey.</h2>
            <p className="mt-4 max-w-3xl text-white/75">
              Choose a route, pick a seat, confirm with confidence, and keep your trip close afterward.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
