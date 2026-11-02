import DeveloperCredits from "@/components/developer-credits";
import { TourManager } from "./_components/tour-manager";

const developers = [
  { name: "Soham Tulsyan", profileUrl: "https://www.linkedin.com/in/soham-tulsyan-0902482a7/" },
  { name: "Vaani Goenka" },
  { name: "Vansh Bothra" },
  { name: "Ibrahim Khalil" },
  { name: "Sarthak Rathi" },
];

export default function CGPAPlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <TourManager />
      {children}
      <DeveloperCredits developers={developers} />
    </div>
  );
}
