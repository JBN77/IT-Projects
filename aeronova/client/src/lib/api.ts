import type { Airport, BookingDetails, BookingPayload, Flight, SupportTicket } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export function fetchAirports() {
  return request<Airport[]>("/airports");
}

export function searchFlights(params: {
  from?: string | null;
  to?: string | null;
  date?: string | null;
  cabin?: string | null;
  passengers?: string | null;
}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  return request<Flight[]>(`/flights?${query.toString()}`);
}

export function fetchFlight(id: string) {
  return request<Flight>(`/flights/${id}`);
}

export function createBooking(payload: BookingPayload) {
  return request<{ confirmationCode: string; totalPrice: number }>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchBooking(confirmationCode: string, email: string) {
  const query = new URLSearchParams({ email });
  return request<BookingDetails>(`/bookings/${encodeURIComponent(confirmationCode)}?${query.toString()}`);
}

export function createSupportTicket(payload: { name: string; email: string; topic: string; message: string }) {
  return request<SupportTicket>("/support/messages", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  return request<{ token: string; user: { email: string; firstName: string } }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return request<{ token: string; user: { email: string; firstName: string } }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
