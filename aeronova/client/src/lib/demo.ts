import type { Airport, Seat } from "../types";

export const fallbackAirports: Airport[] = [
  {
    id: "jfk",
    code: "JFK",
    name: "John F. Kennedy International",
    city: "New York",
    country: "United States",
    timezone: "America/New_York"
  },
  {
    id: "lhr",
    code: "LHR",
    name: "Heathrow",
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London"
  },
  {
    id: "lax",
    code: "LAX",
    name: "Los Angeles International",
    city: "Los Angeles",
    country: "United States",
    timezone: "America/Los_Angeles"
  },
  {
    id: "hnd",
    code: "HND",
    name: "Tokyo Haneda",
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo"
  },
  {
    id: "sfo",
    code: "SFO",
    name: "San Francisco International",
    city: "San Francisco",
    country: "United States",
    timezone: "America/Los_Angeles"
  },
  {
    id: "cdg",
    code: "CDG",
    name: "Charles de Gaulle",
    city: "Paris",
    country: "France",
    timezone: "Europe/Paris"
  }
];

export function clientSeats(): Seat[] {
  const unavailable = new Set(["1A", "2C", "3D", "4F", "6B", "8E"]);
  const columns = ["A", "B", "C", "D", "E", "F"];

  return Array.from({ length: 10 }, (_, rowIndex) => {
    const row = rowIndex + 1;
    return columns.map((column) => {
      const seatNumber = `${row}${column}`;
      const premium = row <= 3;
      return {
        id: `seat-${seatNumber}`,
        seatNumber,
        cabin: premium ? "PREMIUM" : "ECONOMY",
        isAvailable: !unavailable.has(seatNumber),
        priceModifier: premium ? 85 : 0
      } satisfies Seat;
    });
  }).flat();
}
