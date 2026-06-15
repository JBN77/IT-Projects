export type DemoAirport = {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
};

export type DemoSeat = {
  id: string;
  seatNumber: string;
  cabin: "ECONOMY" | "PREMIUM" | "BUSINESS" | "FIRST";
  isAvailable: boolean;
  priceModifier: number;
};

export type DemoFlight = {
  id: string;
  flightNumber: string;
  origin: DemoAirport;
  destination: DemoAirport;
  departureTime: Date;
  arrivalTime: Date;
  durationMinutes: number;
  aircraft: string;
  cabin: "ECONOMY" | "PREMIUM" | "BUSINESS" | "FIRST";
  baseFare: number;
  seats: DemoSeat[];
};

export const demoAirports: DemoAirport[] = [
  {
    id: "demo-jfk",
    code: "JFK",
    name: "John F. Kennedy International",
    city: "New York",
    country: "United States",
    timezone: "America/New_York"
  },
  {
    id: "demo-lhr",
    code: "LHR",
    name: "Heathrow",
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London"
  },
  {
    id: "demo-lax",
    code: "LAX",
    name: "Los Angeles International",
    city: "Los Angeles",
    country: "United States",
    timezone: "America/Los_Angeles"
  },
  {
    id: "demo-hnd",
    code: "HND",
    name: "Tokyo Haneda",
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo"
  },
  {
    id: "demo-sfo",
    code: "SFO",
    name: "San Francisco International",
    city: "San Francisco",
    country: "United States",
    timezone: "America/Los_Angeles"
  },
  {
    id: "demo-cdg",
    code: "CDG",
    name: "Charles de Gaulle",
    city: "Paris",
    country: "France",
    timezone: "Europe/Paris"
  }
];

function airport(code: string) {
  const found = demoAirports.find((item) => item.code === code);
  if (!found) {
    throw new Error(`Missing demo airport ${code}`);
  }
  return found;
}

function scheduledDate(daysFromNow: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function arrivalFrom(departureTime: Date, durationMinutes: number) {
  return new Date(departureTime.getTime() + durationMinutes * 60_000);
}

function seats(flightId: string): DemoSeat[] {
  const unavailable = new Set(["1A", "2C", "3D", "4F", "6B", "8E"]);
  const columns = ["A", "B", "C", "D", "E", "F"];

  return Array.from({ length: 10 }, (_, rowIndex) => {
    const row = rowIndex + 1;
    return columns.map((column) => {
      const seatNumber = `${row}${column}`;
      const premium = row <= 3;
      return {
        id: `${flightId}-${seatNumber}`,
        seatNumber,
        cabin: premium ? "PREMIUM" : "ECONOMY",
        isAvailable: !unavailable.has(seatNumber),
        priceModifier: premium ? 85 : 0
      } satisfies DemoSeat;
    });
  }).flat();
}

const jfkMorning = scheduledDate(14, 8, 40);
const jfkEvening = scheduledDate(14, 19, 15);
const laxMorning = scheduledDate(17, 10, 20);
const sfoAfternoon = scheduledDate(20, 15, 25);

export const demoFlights: DemoFlight[] = [
  {
    id: "demo-an101",
    flightNumber: "AN101",
    origin: airport("JFK"),
    destination: airport("LHR"),
    departureTime: jfkMorning,
    arrivalTime: arrivalFrom(jfkMorning, 435),
    durationMinutes: 435,
    aircraft: "Boeing 787-9",
    cabin: "ECONOMY",
    baseFare: 684,
    seats: seats("demo-an101")
  },
  {
    id: "demo-an109",
    flightNumber: "AN109",
    origin: airport("JFK"),
    destination: airport("LHR"),
    departureTime: jfkEvening,
    arrivalTime: arrivalFrom(jfkEvening, 420),
    durationMinutes: 420,
    aircraft: "Airbus A350-900",
    cabin: "ECONOMY",
    baseFare: 736,
    seats: seats("demo-an109")
  },
  {
    id: "demo-an212",
    flightNumber: "AN212",
    origin: airport("LAX"),
    destination: airport("HND"),
    departureTime: laxMorning,
    arrivalTime: arrivalFrom(laxMorning, 705),
    durationMinutes: 705,
    aircraft: "Boeing 787-10",
    cabin: "ECONOMY",
    baseFare: 912,
    seats: seats("demo-an212")
  },
  {
    id: "demo-an330",
    flightNumber: "AN330",
    origin: airport("SFO"),
    destination: airport("CDG"),
    departureTime: sfoAfternoon,
    arrivalTime: arrivalFrom(sfoAfternoon, 650),
    durationMinutes: 650,
    aircraft: "Airbus A350-1000",
    cabin: "ECONOMY",
    baseFare: 742,
    seats: seats("demo-an330")
  }
];

export function filterDemoFlights(filters: { from?: string; to?: string; date?: string }) {
  return demoFlights.filter((flight) => {
    const matchesFrom = filters.from ? flight.origin.code === filters.from : true;
    const matchesTo = filters.to ? flight.destination.code === filters.to : true;
    const matchesDate = filters.date ? flight.departureTime.toISOString().slice(0, 10) === filters.date : true;
    return matchesFrom && matchesTo && matchesDate;
  });
}

export function getDemoFlight(id: string) {
  return demoFlights.find((flight) => flight.id === id);
}
