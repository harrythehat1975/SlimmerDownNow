export const metadata = {
  title: "Slim Down Now - Personalized Waist Loss Coaching",
  description:
    "Get personalized daily diet and workout plans to reduce inches around your waist. Track your progress with AI-powered recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
