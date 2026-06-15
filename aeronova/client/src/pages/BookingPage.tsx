import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  UserRound,
  WalletCards
} from "lucide-react";
import { Fragment, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { createBooking, fetchFlight } from "../lib/api";
import { formatDuration, formatFlightDate, formatFlightTime } from "../lib/date";
import { clientSeats } from "../lib/demo";
import type { Flight, PassengerPayload, Seat } from "../types";

const steps = ["Passenger", "Seats", "Payment", "Review"] as const;

export function BookingPage() {
  const { flightId } = useParams();
  const [searchParams] = useSearchParams();
  const passengerCount = Math.max(1, Number(searchParams.get("passengers") ?? "1"));
  const [flight, setFlight] = useState<Flight | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [passenger, setPassenger] = useState<PassengerPayload>({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    postalCode: ""
  });

  useEffect(() => {
    if (!flightId) return;
    fetchFlight(flightId).then(setFlight).catch(() => setFlight(null));
  }, [flightId]);

  const seats = useMemo<Seat[]>(() => {
    if (flight?.seats?.length) {
      return flight.seats;
    }
    return clientSeats();
  }, [flight]);

  const baseTotal = flight ? Math.round(flight.baseFare * passengerCount) : 0;
  const seatTotal = selectedSeats.reduce((total, seatNumber) => {
    const seat = seats.find((item) => item.seatNumber === seatNumber);
    return total + (seat?.priceModifier ?? 0);
  }, 0);
  const grandTotal = baseTotal + seatTotal;

  function toggleSeat(seat: Seat) {
    if (!seat.isAvailable) return;

    setSelectedSeats((current) => {
      if (current.includes(seat.seatNumber)) {
        return current.filter((seatNumber) => seatNumber !== seat.seatNumber);
      }

      if (current.length >= passengerCount) {
        return [...current.slice(1), seat.seatNumber];
      }

      return [...current, seat.seatNumber];
    });
  }

  function handlePassengerSubmit(event: FormEvent) {
    event.preventDefault();
    setActiveStep(1);
  }

  function handlePaymentSubmit(event: FormEvent) {
    event.preventDefault();
    setActiveStep(3);
  }

  async function handleBooking() {
    if (!flightId || !passenger.email) return;

    setSubmitting(true);
    const passengers = Array.from({ length: passengerCount }, (_, index) => ({
      firstName: index === 0 ? passenger.firstName : `Guest ${index + 1}`,
      lastName: passenger.lastName,
      type: "ADULT" as const
    }));

    try {
      const booking = await createBooking({
        flightId,
        contactEmail: passenger.email,
        passengers,
        seatNumbers: selectedSeats
      });
      setConfirmationCode(booking.confirmationCode);
      localStorage.setItem(
        "aeronova_last_booking",
        JSON.stringify({
          confirmationCode: booking.confirmationCode,
          email: passenger.email
        })
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!flight) {
    return (
      <section className="bg-[#fbfaf7] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-stone-200 bg-white p-8 text-runway">Loading booking...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#fbfaf7] py-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          to={`/flights?${searchParams.toString()}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-midnight"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to results
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-5">
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase text-coral">Booking</p>
                  <h1 className="mt-2 text-3xl font-black text-ink">
                    {flight.originCode} to {flight.destinationCode}
                  </h1>
                </div>
                <div className="text-sm text-runway">
                  <p>{flight.flightNumber}</p>
                  <p>{formatFlightDate(flight.departureTime)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                {steps.map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`rounded-md px-4 py-3 text-left text-sm font-bold transition ${
                      activeStep === index ? "bg-midnight text-white" : "bg-linen text-runway"
                    }`}
                  >
                    {index + 1}. {step}
                  </button>
                ))}
              </div>
            </div>

            {activeStep === 0 && (
              <form onSubmit={handlePassengerSubmit} className="rounded-lg border border-stone-200 bg-white p-5">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-mist text-midnight">
                    <UserRound aria-hidden="true" size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-ink">Passenger details</h2>
                    <p className="text-sm text-runway">
                      {passengerCount} traveler{passengerCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-runway">First name</span>
                    <input
                      required
                      value={passenger.firstName}
                      onChange={(event) => setPassenger((current) => ({ ...current, firstName: event.target.value }))}
                      className="h-12 rounded-md border border-stone-200 px-3"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-runway">Last name</span>
                    <input
                      required
                      value={passenger.lastName}
                      onChange={(event) => setPassenger((current) => ({ ...current, lastName: event.target.value }))}
                      className="h-12 rounded-md border border-stone-200 px-3"
                    />
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-runway">Email</span>
                    <input
                      required
                      type="email"
                      value={passenger.email}
                      onChange={(event) => setPassenger((current) => ({ ...current, email: event.target.value }))}
                      className="h-12 rounded-md border border-stone-200 px-3"
                    />
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-midnight px-5 py-3 font-semibold text-white transition hover:bg-runway"
                  >
                    Continue
                    <ArrowRight aria-hidden="true" size={18} />
                  </button>
                </div>
              </form>
            )}

            {activeStep === 1 && (
              <div className="rounded-lg border border-stone-200 bg-white p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-ink">Seat selection</h2>
                    <p className="text-sm text-runway">
                      {selectedSeats.length}/{passengerCount} selected
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-runway">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm bg-mist" />
                      Available
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm bg-midnight" />
                      Selected
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3 w-3 rounded-sm bg-stone-300" />
                      Taken
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="mx-auto grid w-max gap-2">
                    {Array.from({ length: 10 }, (_, rowIndex) => {
                      const row = rowIndex + 1;
                      const rowSeats = ["A", "B", "C", "D", "E", "F"].map((column) =>
                        seats.find((seat) => seat.seatNumber === `${row}${column}`)
                      );

                      return (
                        <div
                          key={row}
                          className="grid grid-cols-[repeat(3,2.5rem)_1.25rem_repeat(3,2.5rem)] gap-2 sm:grid-cols-[repeat(3,2.75rem)_1.5rem_repeat(3,2.75rem)]"
                        >
                          {rowSeats.map((seat, index) => {
                            if (!seat) return <span key={`${row}-${index}`} aria-hidden="true" />;

                            const selected = selectedSeats.includes(seat.seatNumber);
                            return (
                              <Fragment key={seat.seatNumber}>
                                {index === 3 && <span key={`${row}-aisle`} aria-hidden="true" />}
                                <button
                                  type="button"
                                  onClick={() => toggleSeat(seat)}
                                  disabled={!seat.isAvailable}
                                  title={`${seat.seatNumber} ${seat.cabin.toLowerCase()}`}
                                  className={`seat-button h-10 w-10 rounded-md text-xs font-semibold transition sm:h-11 sm:w-11 ${
                                    selected
                                      ? "bg-midnight text-white"
                                      : seat.isAvailable
                                        ? "bg-mist text-midnight hover:bg-aero hover:text-white"
                                        : "cursor-not-allowed bg-stone-300 text-stone-500"
                                  }`}
                                >
                                  {seat.seatNumber}
                                </button>
                              </Fragment>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(0)}
                    className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-5 py-3 font-semibold text-runway"
                  >
                    <ArrowLeft aria-hidden="true" size={18} />
                    Passenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center gap-2 rounded-md bg-midnight px-5 py-3 font-semibold text-white transition hover:bg-runway"
                  >
                    Payment
                    <ArrowRight aria-hidden="true" size={18} />
                  </button>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <form onSubmit={handlePaymentSubmit} className="rounded-lg border border-stone-200 bg-white p-5">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-linen text-coral">
                    <WalletCards aria-hidden="true" size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-ink">Payment</h2>
                    <p className="text-sm text-runway">Secure checkout preview stores no card data.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-runway">Name on card</span>
                    <input
                      required
                      value={payment.cardName}
                      onChange={(event) => setPayment((current) => ({ ...current, cardName: event.target.value }))}
                      className="h-12 rounded-md border border-stone-200 px-3"
                      placeholder="Nova Traveler"
                    />
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-runway">Card number</span>
                    <input
                      required
                      inputMode="numeric"
                      minLength={12}
                      value={payment.cardNumber}
                      onChange={(event) => setPayment((current) => ({ ...current, cardNumber: event.target.value }))}
                      className="h-12 rounded-md border border-stone-200 px-3"
                      placeholder="4242 4242 4242 4242"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-runway">Expiry</span>
                    <input
                      required
                      value={payment.expiry}
                      onChange={(event) => setPayment((current) => ({ ...current, expiry: event.target.value }))}
                      className="h-12 rounded-md border border-stone-200 px-3"
                      placeholder="12/29"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-runway">CVC</span>
                    <input
                      required
                      inputMode="numeric"
                      minLength={3}
                      value={payment.cvc}
                      onChange={(event) => setPayment((current) => ({ ...current, cvc: event.target.value }))}
                      className="h-12 rounded-md border border-stone-200 px-3"
                      placeholder="123"
                    />
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-runway">Postal code</span>
                    <input
                      required
                      value={payment.postalCode}
                      onChange={(event) => setPayment((current) => ({ ...current, postalCode: event.target.value }))}
                      className="h-12 rounded-md border border-stone-200 px-3"
                      placeholder="10001"
                    />
                  </label>
                </div>

                <div className="mt-5 rounded-lg bg-mist p-4 text-sm text-midnight">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <ShieldCheck aria-hidden="true" size={17} />
                    Card details stay in this checkout preview.
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-5 py-3 font-semibold text-runway"
                  >
                    <ArrowLeft aria-hidden="true" size={18} />
                    Seats
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-midnight px-5 py-3 font-semibold text-white transition hover:bg-runway"
                  >
                    Review
                    <ArrowRight aria-hidden="true" size={18} />
                  </button>
                </div>
              </form>
            )}

            {activeStep === 3 && (
              <div className="rounded-lg border border-stone-200 bg-white p-5">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-linen text-coral">
                    <CreditCard aria-hidden="true" size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-ink">Review trip</h2>
                    <p className="text-sm text-runway">Confirming secures your trip instantly.</p>
                  </div>
                </div>

                <div className="grid gap-4 text-sm text-runway sm:grid-cols-2">
                  <div className="rounded-lg bg-linen p-4">
                    <p className="font-semibold text-ink">Traveler</p>
                    <p className="mt-2">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p>{passenger.email}</p>
                  </div>
                  <div className="rounded-lg bg-linen p-4">
                    <p className="font-semibold text-ink">Seats</p>
                    <p className="mt-2">{selectedSeats.length ? selectedSeats.join(", ") : "Assigned at airport"}</p>
                  </div>
                  <div className="rounded-lg bg-linen p-4">
                    <p className="font-semibold text-ink">Payment</p>
                    <p className="mt-2">{payment.cardName || "Cardholder"}</p>
                    <p>Card ending {payment.cardNumber.replace(/\D/g, "").slice(-4) || "demo"}</p>
                  </div>
                  <div className="rounded-lg bg-linen p-4">
                    <p className="font-semibold text-ink">Total</p>
                    <p className="mt-2 text-2xl font-semibold text-midnight">${grandTotal}</p>
                  </div>
                </div>

                {confirmationCode ? (
                  <div className="mt-6 rounded-lg border border-aero/30 bg-mist p-5 text-midnight">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 aria-hidden="true" size={22} />
                      <p className="font-semibold">Confirmed: {confirmationCode}</p>
                    </div>
                    <Link
                      to="/trips"
                      className="mt-4 inline-flex items-center gap-2 rounded-md bg-midnight px-4 py-2 text-sm font-semibold text-white"
                    >
                      Manage this trip
                      <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleBooking}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-md bg-coral px-5 py-3 font-semibold text-white transition hover:bg-[#db4f2b] disabled:opacity-60"
                    >
                      {submitting ? "Confirming..." : "Confirm booking"}
                      <CheckCircle2 aria-hidden="true" size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-black uppercase text-coral">Trip summary</p>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <p className="text-2xl font-semibold text-ink">{formatFlightTime(flight.departureTime)}</p>
                <p className="text-sm font-semibold text-runway">{flight.originCode}</p>
              </div>
              <div className="text-center text-xs font-semibold text-runway">{formatDuration(flight.durationMinutes)}</div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-ink">{formatFlightTime(flight.arrivalTime)}</p>
                <p className="text-sm font-semibold text-runway">{flight.destinationCode}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 border-t border-stone-200 pt-5 text-sm text-runway">
              <div className="flex justify-between">
                <span>Fare x {passengerCount}</span>
                <span>${baseTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Seats</span>
                <span>${seatTotal}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 text-lg font-semibold text-ink">
                <span>Total</span>
                <span>${grandTotal}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
