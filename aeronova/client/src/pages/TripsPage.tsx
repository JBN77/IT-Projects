import { Search, TicketCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBooking } from "../lib/api";
import { formatFlightDate, formatFlightTime } from "../lib/date";
import type { BookingDetails } from "../types";

export function TripsPage() {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("aeronova_last_booking");
    if (!raw) return;
    try {
      const last = JSON.parse(raw) as { confirmationCode?: string; email?: string };
      setConfirmationCode(last.confirmationCode ?? "");
      setEmail(last.email ?? "");
    } catch {
      setConfirmationCode("");
    }
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setBooking(null);

    try {
      const found = await fetchBooking(confirmationCode.trim().toUpperCase(), email.trim());
      setBooking(found);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Trip not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-[#fbfaf7] py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase text-coral">Manage trip</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-ink">Find a booking without calling anyone.</h1>
          <p className="mt-4 text-lg leading-8 text-runway">
            Use the confirmation code from checkout and the contact email on the booking.
          </p>
        </div>

        <div className="grid gap-5">
          <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-runway">Confirmation code</span>
                <input
                  required
                  value={confirmationCode}
                  onChange={(event) => setConfirmationCode(event.target.value)}
                  className="h-12 rounded-md border border-stone-200 px-3 font-bold uppercase"
                  placeholder="AN123ABC"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-runway">Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 rounded-md border border-stone-200 px-3"
                  placeholder="you@example.com"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-midnight px-5 py-3 font-bold text-white transition hover:bg-runway disabled:opacity-60"
            >
              <Search aria-hidden="true" size={18} />
              {loading ? "Searching..." : "Find trip"}
            </button>
          </form>

          {message && <div className="rounded-lg border border-coral/30 bg-white p-5 text-runway">{message}</div>}

          {booking && (
            <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 text-sm font-black uppercase text-coral">
                    <TicketCheck aria-hidden="true" size={16} />
                    {booking.confirmationCode}
                  </span>
                  <h2 className="mt-3 text-3xl font-black text-ink">
                    {booking.flight.originCode} to {booking.flight.destinationCode}
                  </h2>
                  <p className="mt-1 text-runway">{formatFlightDate(booking.flight.departureTime)}</p>
                </div>
                <span className="rounded-md bg-mist px-3 py-1 text-sm font-black text-midnight">{booking.status}</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-linen p-4">
                  <p className="text-sm text-runway">Departure</p>
                  <p className="mt-1 text-2xl font-black text-ink">{formatFlightTime(booking.flight.departureTime)}</p>
                  <p className="text-sm font-bold text-runway">{booking.flight.originName}</p>
                </div>
                <div className="rounded-lg bg-linen p-4">
                  <p className="text-sm text-runway">Arrival</p>
                  <p className="mt-1 text-2xl font-black text-ink">{formatFlightTime(booking.flight.arrivalTime)}</p>
                  <p className="text-sm font-bold text-runway">{booking.flight.destinationName}</p>
                </div>
                <div className="rounded-lg bg-linen p-4">
                  <p className="text-sm text-runway">Seats</p>
                  <p className="mt-1 text-2xl font-black text-ink">
                    {booking.seats.length ? booking.seats.map((seat) => seat.seatNumber).join(", ") : "Airport"}
                  </p>
                  <p className="text-sm font-bold text-runway">${booking.totalPrice}</p>
                </div>
              </div>
            </article>
          )}

          <Link to="/flights" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-midnight">
            Search another flight
          </Link>
        </div>
      </div>
    </section>
  );
}
