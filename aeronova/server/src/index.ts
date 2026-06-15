import cors from "cors";
import dotenv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { demoAirports, filterDemoFlights, getDemoFlight, type DemoFlight } from "./demoData.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = new Set([
  process.env.CLIENT_URL ?? "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by AeroNova API CORS"));
    }
  })
);
app.use(express.json());

type SeatRecord = {
  id: string;
  seatNumber: string;
  cabin: string;
  isAvailable: boolean;
  priceModifier: unknown;
};

type FlightRecord = {
  id: string;
  flightNumber: string;
  origin: {
    code: string;
    city: string;
    name: string;
  };
  destination: {
    code: string;
    city: string;
    name: string;
  };
  departureTime: Date;
  arrivalTime: Date;
  durationMinutes: number;
  aircraft: string;
  cabin: string;
  baseFare: unknown;
  seats?: SeatRecord[];
};

type BookingRequest = {
  flightId?: string;
  contactEmail?: string;
  passengers?: Array<{
    firstName?: string;
    lastName?: string;
    type?: "ADULT" | "CHILD";
  }>;
  seatNumbers?: string[];
};

type BookingRecord = {
  id: string;
  confirmationCode: string;
  contactEmail: string;
  status: string;
  totalPrice: unknown;
  createdAt: Date;
  flight: FlightRecord;
  passengers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    type: string;
  }>;
  bookingSeats: Array<{
    seat: {
      seatNumber: string;
      cabin: string;
    };
  }>;
};

const demoBookingStore = new Map<string, ReturnType<typeof toBookingDto>>();

function toFlightDto(flight: FlightRecord | DemoFlight) {
  const seats = flight.seats ?? [];

  return {
    id: flight.id,
    flightNumber: flight.flightNumber,
    originCode: flight.origin.code,
    originCity: flight.origin.city,
    originName: flight.origin.name,
    destinationCode: flight.destination.code,
    destinationCity: flight.destination.city,
    destinationName: flight.destination.name,
    departureTime: flight.departureTime.toISOString(),
    arrivalTime: flight.arrivalTime.toISOString(),
    durationMinutes: flight.durationMinutes,
    aircraft: flight.aircraft,
    cabin: flight.cabin,
    baseFare: Number(flight.baseFare),
    seatsLeft: seats.filter((seat) => seat.isAvailable).length,
    seats: seats.map((seat) => ({
      id: seat.id,
      seatNumber: seat.seatNumber,
      cabin: seat.cabin,
      isAvailable: seat.isAvailable,
      priceModifier: Number(seat.priceModifier)
    }))
  };
}

function toBookingDto(booking: BookingRecord) {
  return {
    id: booking.id,
    confirmationCode: booking.confirmationCode,
    contactEmail: booking.contactEmail,
    status: booking.status,
    totalPrice: Number(booking.totalPrice),
    createdAt: booking.createdAt.toISOString(),
    flight: toFlightDto(booking.flight),
    passengers: booking.passengers.map((passenger) => ({
      id: passenger.id,
      firstName: passenger.firstName,
      lastName: passenger.lastName,
      type: passenger.type
    })),
    seats: booking.bookingSeats.map((bookingSeat) => ({
      seatNumber: bookingSeat.seat.seatNumber,
      cabin: bookingSeat.seat.cabin
    }))
  };
}

function dateRange(date?: string) {
  if (!date) return undefined;
  const start = new Date(`${date}T00:00:00.000`);
  if (Number.isNaN(start.getTime())) return undefined;
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { gte: start, lt: end };
}

async function withDemoFallback<T>(action: () => Promise<T>, fallback: () => T | Promise<T>) {
  try {
    return await action();
  } catch (error) {
    console.warn("Using demo data fallback:", error instanceof Error ? error.message : error);
    return fallback();
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const supplied = Buffer.from(scryptSync(password, salt, 64).toString("hex"), "hex");
  const stored = Buffer.from(hash, "hex");

  return supplied.length === stored.length && timingSafeEqual(supplied, stored);
}

function issueToken() {
  return randomBytes(32).toString("hex");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "aeronova-api" });
});

app.get("/api/airports", async (_req, res, next) => {
  try {
    const airports = await withDemoFallback(
      () => prisma.airport.findMany({ orderBy: { code: "asc" } }),
      () => demoAirports
    );
    res.json(airports);
  } catch (error) {
    next(error);
  }
});

app.get("/api/flights", async (req, res, next) => {
  const from = typeof req.query.from === "string" ? req.query.from.toUpperCase() : undefined;
  const to = typeof req.query.to === "string" ? req.query.to.toUpperCase() : undefined;
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const departureRange = dateRange(date);

  try {
    const flights = await withDemoFallback(
      async () => {
        const records = await prisma.flight.findMany({
          where: {
            origin: from ? { code: from } : undefined,
            destination: to ? { code: to } : undefined,
            departureTime: departureRange
          },
          include: {
            origin: true,
            destination: true,
            seats: true
          },
          orderBy: { departureTime: "asc" }
        });

        return records.map(toFlightDto);
      },
      () => filterDemoFlights({ from, to, date }).map(toFlightDto)
    );

    res.json(flights);
  } catch (error) {
    next(error);
  }
});

app.get("/api/flights/:id", async (req, res, next) => {
  try {
    const flight = await withDemoFallback(
      async () => {
        const record = await prisma.flight.findUnique({
          where: { id: req.params.id },
          include: {
            origin: true,
            destination: true,
            seats: true
          }
        });

        return record ? toFlightDto(record) : null;
      },
      () => {
        const record = getDemoFlight(req.params.id);
        return record ? toFlightDto(record) : null;
      }
    );

    if (!flight) {
      res.status(404).json({ message: "Flight not found" });
      return;
    }

    res.json(flight);
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", async (req, res, next) => {
  const body = req.body as BookingRequest;

  if (!body.flightId || !body.contactEmail || !Array.isArray(body.passengers) || body.passengers.length === 0) {
    res.status(400).json({ message: "Missing booking details" });
    return;
  }

  const confirmationCode = `AN${randomBytes(3).toString("hex").toUpperCase()}`;
  const seatNumbers = body.seatNumbers ?? [];

  try {
    const booking = await withDemoFallback(
      async () => {
        const flight = await prisma.flight.findUnique({
          where: { id: body.flightId },
          include: { seats: true }
        });

        if (!flight) {
          throw new Error("Flight not found");
        }

        return prisma.$transaction(async (tx) => {
          const selectedSeats = seatNumbers.length
            ? await tx.seat.findMany({
                where: {
                  flightId: body.flightId,
                  seatNumber: { in: seatNumbers },
                  isAvailable: true
                }
              })
            : [];

          const totalPrice =
            Number(flight.baseFare) * body.passengers!.length +
            selectedSeats.reduce((total, seat) => total + Number(seat.priceModifier), 0);

          const created = await tx.booking.create({
            data: {
              flightId: body.flightId!,
              contactEmail: body.contactEmail!,
              totalPrice,
              confirmationCode,
              passengers: {
                create: body.passengers!.map((passenger) => ({
                  firstName: passenger.firstName ?? "Guest",
                  lastName: passenger.lastName ?? "Traveler",
                  type: passenger.type ?? "ADULT"
                }))
              }
            }
          });

          if (selectedSeats.length) {
            await tx.bookingSeat.createMany({
              data: selectedSeats.map((seat) => ({
                bookingId: created.id,
                seatId: seat.id
              }))
            });

            await tx.seat.updateMany({
              where: { id: { in: selectedSeats.map((seat) => seat.id) } },
              data: { isAvailable: false }
            });
          }

          return {
            confirmationCode: created.confirmationCode,
            totalPrice
          };
        });
      },
      () => {
        const flight = getDemoFlight(body.flightId!);
        if (!flight) {
          throw new Error("Flight not found");
        }

        const selectedSeats = flight.seats.filter((seat) => seatNumbers.includes(seat.seatNumber));
        const totalPrice =
          Number(flight.baseFare) * body.passengers!.length +
          selectedSeats.reduce((total, seat) => total + Number(seat.priceModifier), 0);
        const demoBooking = {
          id: `demo-booking-${confirmationCode}`,
          confirmationCode,
          contactEmail: body.contactEmail!,
          status: "PENDING",
          totalPrice,
          createdAt: new Date(),
          flight,
          passengers: body.passengers!.map((passenger, index) => ({
            id: `demo-passenger-${index}`,
            firstName: passenger.firstName ?? "Guest",
            lastName: passenger.lastName ?? "Traveler",
            type: passenger.type ?? "ADULT"
          })),
          bookingSeats: selectedSeats.map((seat) => ({
            seat: {
              seatNumber: seat.seatNumber,
              cabin: seat.cabin
            }
          }))
        } satisfies BookingRecord;

        const dto = toBookingDto(demoBooking);
        demoBookingStore.set(confirmationCode, dto);
        return {
          confirmationCode,
          totalPrice
        };
      }
    );

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

app.get("/api/bookings/:confirmationCode", async (req, res, next) => {
  const confirmationCode = req.params.confirmationCode.toUpperCase();
  const email = typeof req.query.email === "string" ? req.query.email.toLowerCase() : "";

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const booking = await withDemoFallback(
      async () => {
        const record = await prisma.booking.findFirst({
          where: {
            confirmationCode,
            contactEmail: { equals: email, mode: "insensitive" }
          },
          include: {
            flight: {
              include: {
                origin: true,
                destination: true,
                seats: true
              }
            },
            passengers: true,
            bookingSeats: {
              include: {
                seat: true
              }
            }
          }
        });

        return record ? toBookingDto(record) : null;
      },
      () => {
        const record = demoBookingStore.get(confirmationCode);
        return record && record.contactEmail.toLowerCase() === email ? record : null;
      }
    );

    if (!booking) {
      res.status(404).json({ message: "Trip not found for that confirmation code and email" });
      return;
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

app.post("/api/support/messages", (req, res) => {
  const { name, email, topic, message } = req.body as {
    name?: string;
    email?: string;
    topic?: string;
    message?: string;
  };

  if (!name || !email || !topic || !message || message.length < 12) {
    res.status(400).json({ message: "A name, email, topic, and message are required" });
    return;
  }

  res.status(201).json({
    ticketId: `SUP-${randomBytes(3).toString("hex").toUpperCase()}`,
    status: "OPEN"
  });
});

app.post("/api/auth/register", async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };

  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ message: "Missing registration details" });
    return;
  }

  try {
    const user = await withDemoFallback(
      () =>
        prisma.user.create({
          data: {
            firstName,
            lastName,
            email: email.toLowerCase(),
            passwordHash: hashPassword(password)
          }
        }),
      () => ({
        id: "demo-user",
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash: "",
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );

    res.status(201).json({
      token: issueToken(),
      user: {
        email: user.email,
        firstName: user.firstName
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ message: "Missing credentials" });
    return;
  }

  try {
    const user = await withDemoFallback(
      async () => {
        const found = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!found || !verifyPassword(password, found.passwordHash)) {
          throw new Error("Invalid credentials");
        }
        return found;
      },
      () => {
        if (email.toLowerCase() === "demo@aeronova.dev" && password === "password123") {
          return {
            id: "demo-user",
            firstName: "AeroNova",
            lastName: "Traveler",
            email: "demo@aeronova.dev",
            passwordHash: "",
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
        throw new Error("Invalid credentials");
      }
    );

    res.json({
      token: issueToken(),
      user: {
        email: user.email,
        firstName: user.firstName
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: error.message || "Internal server error" });
});

app.listen(port, () => {
  console.log(`AeroNova API running on http://localhost:${port}/api`);
});
