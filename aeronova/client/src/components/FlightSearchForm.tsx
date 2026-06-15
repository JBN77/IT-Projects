import { CalendarDays, Search, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchAirports } from "../lib/api";
import { addDays, toInputDate } from "../lib/date";
import { fallbackAirports } from "../lib/demo";
import type { Airport } from "../types";

type FlightSearchFormProps = {
  compact?: boolean;
};

export function FlightSearchForm({ compact = false }: FlightSearchFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [airports, setAirports] = useState<Airport[]>(fallbackAirports);
  const [tripType, setTripType] = useState("round");
  const [from, setFrom] = useState(searchParams.get("from") ?? "JFK");
  const [to, setTo] = useState(searchParams.get("to") ?? "LHR");
  const [date, setDate] = useState(searchParams.get("date") ?? toInputDate(addDays(14)));
  const [returnDate, setReturnDate] = useState(toInputDate(addDays(21)));
  const [passengers, setPassengers] = useState(searchParams.get("passengers") ?? "1");
  const [cabin, setCabin] = useState(searchParams.get("cabin") ?? "ECONOMY");

  useEffect(() => {
    fetchAirports()
      .then(setAirports)
      .catch(() => setAirports(fallbackAirports));
  }, []);

  const destinationOptions = useMemo(() => airports.filter((airport) => airport.code !== from), [airports, from]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({
      from,
      to,
      date,
      passengers,
      cabin
    });

    if (tripType === "round") {
      params.set("returnDate", returnDate);
    }

    navigate(`/flights?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass-panel rounded-lg p-4 text-white shadow-soft ${
        compact ? "lg:p-5" : "lg:p-6"
      }`}
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {["round", "one-way"].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTripType(type)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              tripType === type ? "bg-white/92 text-black" : "bg-white/8 text-white/70 hover:bg-white/14"
            }`}
          >
            {type === "round" ? "Round trip" : "One way"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
        <label className="grid gap-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase text-white/58">From</span>
          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-12 rounded-md border border-white/10 bg-white/8 px-3 text-base font-semibold text-white"
          >
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.city}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase text-white/58">To</span>
          <select
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-12 rounded-md border border-white/10 bg-white/8 px-3 text-base font-semibold text-white"
          >
            {destinationOptions.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.city}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 lg:col-span-1">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-white/58">
            <CalendarDays aria-hidden="true" size={14} />
            Depart
          </span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-12 rounded-md border border-white/10 bg-white/8 px-3 font-semibold text-white"
          />
        </label>

        <label className="grid gap-2 lg:col-span-1">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-white/58">
            <CalendarDays aria-hidden="true" size={14} />
            Return
          </span>
          <input
            type="date"
            value={returnDate}
            disabled={tripType !== "round"}
            onChange={(event) => setReturnDate(event.target.value)}
            className="h-12 rounded-md border border-white/10 bg-white/8 px-3 font-semibold text-white disabled:bg-white/5 disabled:text-white/35"
          />
        </label>

        <label className="grid gap-2 lg:col-span-1">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-white/58">
            <UsersRound aria-hidden="true" size={14} />
            Travelers
          </span>
          <select
            value={passengers}
            onChange={(event) => setPassengers(event.target.value)}
            className="h-12 rounded-md border border-white/10 bg-white/8 px-3 font-semibold text-white"
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 lg:col-span-1">
          <span className="text-xs font-semibold uppercase text-white/58">Cabin</span>
          <select
            value={cabin}
            onChange={(event) => setCabin(event.target.value)}
            className="h-12 rounded-md border border-white/10 bg-white/8 px-3 font-semibold text-white"
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM">Premium</option>
            <option value="BUSINESS">Business</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-coral px-5 py-3 font-semibold text-white transition hover:bg-[#db4f2b] sm:w-auto"
        >
          <Search aria-hidden="true" size={18} />
          Search flights
        </button>
      </div>
    </form>
  );
}
