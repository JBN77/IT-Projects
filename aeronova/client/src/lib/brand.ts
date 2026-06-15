import { addDays, toInputDate } from "./date";

export const brandAssets = {
  heroVideo: "/media/ramp-planes-web.mp4",
  heroPoster: "/media/ramp-planes-poster.jpg",
  rampVideo: "/media/hero-boarding-web.mp4",
  rampPoster: "/media/hero-boarding-poster.jpg",
  cabinBusiness: "/media/cabin-business.jpg",
  cabinEconomy: "/media/cabin-economy.jpg"
};

export const editorialRoutes = [
  {
    code: "LHR",
    city: "London",
    title: "New York to London",
    fare: "$684",
    from: "JFK",
    to: "LHR",
    image: "/media/route-london-heathrow.jpg",
    detail: "Red-eye comfort with daylight arrival",
    date: toInputDate(addDays(14))
  },
  {
    code: "HND",
    city: "Tokyo",
    title: "Los Angeles to Tokyo",
    fare: "$912",
    from: "LAX",
    to: "HND",
    image: "/media/route-tokyo-haneda.jpg",
    detail: "Long-haul service on a quieter Dreamliner",
    date: toInputDate(addDays(17))
  },
  {
    code: "CDG",
    city: "Paris",
    title: "San Francisco to Paris",
    fare: "$742",
    from: "SFO",
    to: "CDG",
    image: "/media/route-paris-cdg.jpg",
    detail: "West Coast departures into a soft morning",
    date: toInputDate(addDays(20))
  }
];

export const cabinStories = [
  {
    name: "Nova Economy",
    tag: "Calm essentials",
    price: "Included",
    points: ["32-inch pitch", "Fast seat map", "Complimentary snacks"]
  },
  {
    name: "Nova Premium",
    tag: "More room, more control",
    price: "+$85",
    points: ["Priority boarding", "Wider recline", "Dedicated overhead space"]
  },
  {
    name: "Nova Signature",
    tag: "Quiet long-haul suite",
    price: "From +$420",
    points: ["Lounge access", "Privacy shell", "Seasonal dining"]
  }
];

export const serviceHighlights = [
  "Clear booking from first tap",
  "Real-time seat pricing before payment",
  "Manage trip tools on every confirmation",
  "Responsive layouts for airport thumbs"
];

export function flightLink(route: (typeof editorialRoutes)[number]) {
  const params = new URLSearchParams({
    from: route.from,
    to: route.to,
    date: route.date,
    passengers: "1",
    cabin: "ECONOMY"
  });
  return `/flights?${params.toString()}`;
}
