type LegalPageProps = {
  kind: "privacy" | "accessibility";
};

export function LegalPage({ kind }: LegalPageProps) {
  const isPrivacy = kind === "privacy";

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase text-coral">{isPrivacy ? "Privacy" : "Accessibility"}</p>
        <h1 className="mt-3 text-5xl font-black leading-tight text-ink">
          {isPrivacy ? "A clear demo privacy note." : "Built for clear, keyboard-friendly travel."}
        </h1>
        <div className="mt-8 grid gap-5 text-runway">
          {(isPrivacy
            ? [
                "AeroNova is a fictional project. Local account and booking demo data are used only inside your development database.",
                "Passwords are hashed before storage in PostgreSQL. The demo does not connect to payment processors or third-party marketing systems.",
                "Support messages return ticket IDs from the local API and are not transmitted to any external help desk."
              ]
            : [
                "Core flows use semantic controls, labels, keyboard focus styles, and responsive layouts.",
                "Motion honors reduced-motion preferences through CSS media queries.",
                "The booking path keeps form labels visible and avoids icon-only actions where text is needed."
              ]).map((copy) => (
            <p key={copy} className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-5 leading-7">
              {copy}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
