import { CabinClass, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const airportData = [
  {
    code: "JFK",
    name: "John F. Kennedy International",
    city: "New York",
    country: "United States",
    timezone: "America/New_York"
  },
  {
    code: "LHR",
    name: "Heathrow",
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London"
  },
  {
    code: "LAX",
    name: "Los Angeles International",
    city: "Los Angeles",
    country: "United States",
    timezone: "America/Los_Angeles"
  },
  {
    code: "HND",
    name: "Tokyo Haneda",
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo"
  },
  {
    code: "SFO",
    name: "San Francisco International",
    city: "San Francisco",
    country: "United States",
    timezone: "America/Los_Angeles"
  },
  {
    code: "CDG",
    name: "Charles de Gaulle",
    city: "Paris",
    country: "France",
    timezone: "Europe/Paris"
  }
];

function scheduledDate(daysFromNow: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function arrivalFrom(departureTime: Date, durationMinutes: number) {
  return new Date(departureTime.getTime() + durationMinutes * 60_000);
}

function seats() {
  const unavailable = new Set(["1A", "2C", "3D", "4F", "6B", "8E"]);
  const columns = ["A", "B", "C", "D", "E", "F"];

  return Array.from({ length: 10 }, (_, rowIndex) => {
    const row = rowIndex + 1;
    return columns.map((column) => {
      const seatNumber = `${row}${column}`;
      const premium = row <= 3;
      return {
        seatNumber,
        cabin: premium ? CabinClass.PREMIUM : CabinClass.ECONOMY,
        isAvailable: !unavailable.has(seatNumber),
        priceModifier: premium ? 85 : 0
      };
    });
  }).flat();
}

async function main() {
  await prisma.bookingSeat.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.flight.deleteMany();

  const airports = new Map<string, string>();

  for (const airport of airportData) {
    const record = await prisma.airport.upsert({
      where: { code: airport.code },
      update: airport,
      create: airport
    });
    airports.set(record.code, record.id);
  }

  const flights = [
    {
      flightNumber: "AN101",
      origin: "JFK",
      destination: "LHR",
      daysFromNow: 14,
      hour: 8,
      minute: 40,
      durationMinutes: 435,
      aircraft: "Boeing 787-9",
      baseFare: 684
    },
    {
      flightNumber: "AN109",
      origin: "JFK",
      destination: "LHR",
      daysFromNow: 14,
      hour: 19,
      minute: 15,
      durationMinutes: 420,
      aircraft: "Airbus A350-900",
      baseFare: 736
    },
    {
      flightNumber: "AN212",
      origin: "LAX",
      destination: "HND",
      daysFromNow: 17,
      hour: 10,
      minute: 20,
      durationMinutes: 705,
      aircraft: "Boeing 787-10",
      baseFare: 912
    },
    {
      flightNumber: "AN330",
      origin: "SFO",
      destination: "CDG",
      daysFromNow: 20,
      hour: 15,
      minute: 25,
      durationMinutes: 650,
      aircraft: "Airbus A350-1000",
      baseFare: 742
    }
  ];

  for (const flight of flights) {
    const departureTime = scheduledDate(flight.daysFromNow, flight.hour, flight.minute);
    const arrivalTime = arrivalFrom(departureTime, flight.durationMinutes);

    await prisma.flight.create({
      data: {
        flightNumber: flight.flightNumber,
        originId: airports.get(flight.origin)!,
        destinationId: airports.get(flight.destination)!,
        departureTime,
        arrivalTime,
        durationMinutes: flight.durationMinutes,
        aircraft: flight.aircraft,
        baseFare: flight.baseFare,
        cabin: CabinClass.ECONOMY,
        seats: {
          create: seats()
        }
      }
    });
  }

  console.log("AeroNova seed data created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
