import { ArrowRight, BadgeCheck, Clock3, Plane, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FlightSearchForm } from "../components/FlightSearchForm";
import { searchFlights } from "../lib/api";
import { formatDuration, formatFlightDate, formatFlightTime } from "../lib/date";
import type { Flight } from "../types";

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [morningOnly, setMorningOnly] = useState(false);
  const [lowestFirst, setLowestFirst] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    searchFlights({
      from: searchParams.get("from") ?? "JFK",
      to: searchParams.get("to") ?? "LHR",
      date: searchParams.get("date"),
      cabin: searchParams.get("cabin"),
      passengers: searchParams.get("passengers")
    })
      .then(setFlights)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const passengers = Number(searchParams.get("passengers") ?? "1");
  const displayedFlights = useMemo(() => {
    const filtered = morningOnly
      ? flights.filter((flight) => new Date(flight.departureTime).getHours() < 12)
      : flights;

    return [...filtered].sort((a, b) => {
      if (lowestFirst) {
        return a.baseFare - b.baseFare;
      }
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });
  }, [flights, lowestFirst, morningOnly]);

  return (
    <section className="bg-[#fbfaf7] py-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase text-coral">Flight search</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
            {searchParams.get("from") ?? "JFK"} to {searchParams.get("to") ?? "LHR"}
          </h1>
        </div>

        <FlightSearchForm compact />

        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <SlidersHorizontal aria-hidden="true" size={18} />
              Refine
            </div>
            <div className="mt-5 grid gap-3 text-sm text-runway">
              <span className="inline-flex items-center gap-2 rounded-md bg-mist px-3 py-2 font-semibold text-midnight">
                <BadgeCheck aria-hidden="true" size={16} />
                Nonstop launch network
              </span>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-coral"
                  checked={morningOnly}
                  onChange={(event) => setMorningOnly(event.target.checked)}
                />
                Morning departure
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-coral"
                  checked={lowestFirst}
                  onChange={(event) => setLowestFirst(event.target.checked)}
                />
                Lowest fare first
              </label>
            </div>
          </aside>

          <div className="grid gap-4">
            {loading && (
              <div className="rounded-lg border border-stone-200 bg-white p-8 text-runway">Loading AeroNova fares...</div>
            )}

            {error && !loading && (
              <div className="rounded-lg border border-coral/30 bg-white p-8 text-runway">{error}</div>
            )}

            {!loading && !error && displayedFlights.length === 0 && (
              <div className="rounded-lg border border-stone-200 bg-white p-8 text-runway">
                No flights found for this search.
              </div>
            )}

            {!loading &&
              !error &&
              displayedFlights.map((flight) => {
                const total = Math.round(flight.baseFare * passengers);
                const bookingParams = new URLSearchParams(searchParams);
                bookingParams.set("passengers", String(passengers));

                return (
                  <article key={flight.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-runway">
                          <span className="inline-flex items-center gap-2 font-semibold text-midnight">
                            <Plane aria-hidden="true" size={16} />
                            {flight.flightNumber}
                          </span>
                          <span>{flight.aircraft}</span>
                          <span>{flight.seatsLeft} seats left</span>
                        </div>

                        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                          <div>
                            <p className="text-3xl font-semibold text-ink">{formatFlightTime(flight.departureTime)}</p>
                            <p className="mt-1 text-sm font-semibold text-runway">{flight.originCode}</p>
                            <p className="text-sm text-runway">{flight.originCity}</p>
                          </div>

                          <div className="grid min-w-24 justify-items-center gap-2 text-runway">
                            <Clock3 aria-hidden="true" size={17} />
                            <span className="text-xs font-semibold">{formatDuration(flight.durationMinutes)}</span>
                            <span className="h-px w-20 bg-stone-300" />
                          </div>

                          <div className="text-right">
                            <p className="text-3xl font-semibold text-ink">{formatFlightTime(flight.arrivalTime)}</p>
                            <p className="mt-1 text-sm font-semibold text-runway">{flight.destinationCode}</p>
                            <p className="text-sm text-runway">{flight.destinationCity}</p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-runway">{formatFlightDate(flight.departureTime)}</p>
                      </div>

                      <div className="rounded-lg bg-linen p-4 md:min-w-48">
                        <p className="text-sm text-runway">Total fare</p>
                        <p className="mt-1 text-3xl font-semibold text-midnight">${total}</p>
                        <p className="mt-1 text-xs text-runway">Includes carrier fees</p>
                        <Link
                          to={`/book/${flight.id}?${bookingParams.toString()}`}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-midnight px-4 py-3 text-sm font-semibold text-white transition hover:bg-runway"
                        >
                          Select
                          <ArrowRight aria-hidden="true" size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
