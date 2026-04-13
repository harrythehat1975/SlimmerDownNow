import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = (await auth()) as any;

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zen-50 via-stone-50 to-moss-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-6 text-5xl">🌿</div>
        <h1 className="text-5xl font-light tracking-tight text-zen-900 mb-4">Slimmer Down Now</h1>
        <p className="text-lg text-zen-600 mb-10 leading-relaxed font-light">
          A calm, personalized approach to reducing your waistline. Mindful plans, gentle coaching, lasting change.
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/signup"
            className="px-8 py-3 bg-moss-500 text-white rounded-zen font-medium hover:bg-moss-600 transition-all duration-300 shadow-zen"
          >
            Begin Your Journey
          </a>
          <a
            href="/login"
            className="px-8 py-3 bg-white/70 text-moss-700 border border-moss-300 rounded-zen font-medium hover:bg-white transition-all duration-300"
          >
            Welcome Back
          </a>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-zen shadow-zen border border-stone-100">
            <div className="text-3xl mb-3">🧘</div>
            <h3 className="font-medium text-lg mb-2 text-zen-800">Mindful Plans</h3>
            <p className="text-zen-600 text-sm leading-relaxed">
              Daily nutrition and movement tailored to your body, your goals, and how you feel today.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-zen shadow-zen border border-stone-100">
            <div className="text-3xl mb-3">🌱</div>
            <h3 className="font-medium text-lg mb-2 text-zen-800">Gentle Progress</h3>
            <p className="text-zen-600 text-sm leading-relaxed">
              Track your journey with compassion. Every small step forward matters.
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-zen shadow-zen border border-stone-100">
            <div className="text-3xl mb-3">�</div>
            <h3 className="font-medium text-lg mb-2 text-zen-800">Adaptive Coaching</h3>
            <p className="text-zen-600 text-sm leading-relaxed">
              AI that listens. Your plan adjusts with your energy, sleep, and stress.
            </p>
          </div>
        </div>

        <div className="mt-16 text-zen-500 text-xs">
          <p>
            This app is for informational purposes only. Please consult
            a physician before starting any diet or exercise program.
          </p>
        </div>
      </div>
    </main>
  );
}
