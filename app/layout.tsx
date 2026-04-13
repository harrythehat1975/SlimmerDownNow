import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata = {
  title: "Slimmer Down Now — Mindful Waist Loss Coaching",
  description:
    "A calm, personalized approach to reducing inches around your waist. AI-powered daily plans, mindful check-ins, and gentle coaching.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="zen-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
