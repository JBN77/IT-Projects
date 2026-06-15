export type Airport = {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
};

export type Seat = {
  id: string;
  seatNumber: string;
  cabin: CabinClass;
  isAvailable: boolean;
  priceModifier: number;
};

export type CabinClass = "ECONOMY" | "PREMIUM" | "BUSINESS" | "FIRST";

export type Flight = {
  id: string;
  flightNumber: string;
  originCode: string;
  originCity: string;
  originName: string;
  destinationCode: string;
  destinationCity: string;
  destinationName: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  aircraft: string;
  cabin: CabinClass;
  baseFare: number;
  seatsLeft: number;
  seats?: Seat[];
};

export type PassengerPayload = {
  firstName: string;
  lastName: string;
  email: string;
};

export type BookingPayload = {
  flightId: string;
  contactEmail: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    type: "ADULT" | "CHILD";
  }>;
  seatNumbers: string[];
};

export type BookingDetails = {
  id: string;
  confirmationCode: string;
  contactEmail: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  flight: Flight;
  passengers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    type: string;
  }>;
  seats: Array<{
    seatNumber: string;
    cabin: CabinClass;
  }>;
};

export type SupportTicket = {
  ticketId: string;
  status: "OPEN";
};
