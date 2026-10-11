import DeveloperCredits from "@/components/developer-credits";

const developers = [
  { name: "Soham Tulsyan", role: "Lead Developer", profileUrl: "https://sohamtulsyan.me" },
];

/** Shared frame for the pool page and the results page: same gutters, same credits. */
export default function PoolSubscriptionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {children}
      <DeveloperCredits developers={developers} />
    </div>
  );
}
