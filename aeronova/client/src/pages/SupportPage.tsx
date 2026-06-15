import { CheckCircle2, MessageSquareText, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { createSupportTicket } from "../lib/api";

const topics = ["Booking", "Seats", "Account", "Accessibility"];
const faqs = [
  { q: "Can I book without an account?", a: "Yes. A contact email and traveler name are enough for checkout." },
  { q: "Are seat prices shown before payment?", a: "Yes. Premium modifiers update the trip total in the seat step." },
  { q: "How do I find my trip?", a: "Use your confirmation code and contact email on the Manage trip page." }
];

export function SupportPage() {
  const [topic, setTopic] = useState(topics[0]);
  const [openFaq, setOpenFaq] = useState(faqs[0].q);
  const [ticket, setTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setTicket(null);
    setError(null);
    try {
      const result = await createSupportTicket({ ...form, topic });
      setTicket(result.ticketId);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message could not be sent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-[#fbfaf7] py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase text-coral">Support</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-ink">Fast help for the whole journey.</h1>
          <p className="mt-4 text-lg leading-8 text-runway">
            Send a ticket, browse common answers, and keep moving without leaving your trip behind.
          </p>
          <div className="mt-8 grid gap-3">
            {faqs.map((faq) => (
              <button
                key={faq.q}
                type="button"
                onClick={() => setOpenFaq(faq.q)}
                className="rounded-lg border border-stone-200 bg-white p-4 text-left"
              >
                <span className="font-black text-ink">{faq.q}</span>
                {openFaq === faq.q && <p className="mt-2 text-sm leading-6 text-runway">{faq.a}</p>}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-mist text-midnight">
              <MessageSquareText aria-hidden="true" size={22} />
            </span>
            <div>
              <h2 className="text-2xl font-black text-ink">Create support ticket</h2>
              <p className="text-sm text-runway">A confirmation ID appears as soon as your message is received.</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {topics.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                className={`rounded-md px-4 py-2 text-sm font-bold ${
                  topic === item ? "bg-midnight text-white" : "bg-linen text-runway"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-runway">Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-12 rounded-md border border-stone-200 px-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-runway">Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="h-12 rounded-md border border-stone-200 px-3"
              />
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-sm font-bold text-runway">Message</span>
              <textarea
                required
                minLength={12}
                rows={6}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                className="rounded-md border border-stone-200 p-3"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-coral px-5 py-3 font-bold text-white transition hover:bg-[#db4f2b] disabled:opacity-60"
          >
            <Send aria-hidden="true" size={18} />
            {loading ? "Sending..." : "Send ticket"}
          </button>

          {ticket && (
            <div className="mt-5 rounded-lg border border-aero/30 bg-mist p-4 text-midnight">
              <span className="inline-flex items-center gap-2 font-black">
                <CheckCircle2 aria-hidden="true" size={18} />
                Ticket created: {ticket}
              </span>
            </div>
          )}
          {error && <p className="mt-4 rounded-md bg-linen p-3 text-sm text-runway">{error}</p>}
        </form>
      </div>
    </section>
  );
}
