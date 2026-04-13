import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = (await auth()) as any;

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-sand-100 flex flex-col items-center justify-center px-4 py-20" style={{ textAlign: 'center' }}>
      <div className="max-w-xl mx-auto" style={{ textAlign: 'center' }}>
        <p className="text-sage-600 text-sm font-medium tracking-widest uppercase mb-4">
          Mindful waist loss
        </p>
        <h1 className="text-display text-earth-900 mb-6">
          Slimmer Down Now
        </h1>
        <p className="text-earth-500 text-lg leading-relaxed mb-12">
          A calm, personalized approach to reducing your waistline.
          Gentle coaching, mindful plans, lasting change.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <a
            href="/signup"
            className="zen-btn text-center px-10 py-3 inline-block min-w-[200px]"
          >
            Begin Your Journey
          </a>
          <a
            href="/login"
            className="zen-btn-secondary text-center px-10 py-3 inline-block min-w-[200px]"
          >
            Welcome Back
          </a>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-24 max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="zen-card text-center">
          <div className="w-10 h-10 rounded-full bg-sage-50 border border-sage-200 mx-auto mb-4" />
          <h3 className="font-medium text-earth-900 mb-2">Mindful Plans</h3>
          <p className="text-earth-500 text-sm leading-relaxed">
            Nutrition and movement tailored to your body, your goals, and how you feel today.
          </p>
        </div>

        <div className="zen-card text-center">
          <div className="w-10 h-10 rounded-full bg-sage-50 border border-sage-200 mx-auto mb-4" />
          <h3 className="font-medium text-earth-900 mb-2">Gentle Progress</h3>
          <p className="text-earth-500 text-sm leading-relaxed">
            Track your journey with compassion. Every small step forward matters.
          </p>
        </div>

        <div className="zen-card text-center">
          <div className="w-10 h-10 rounded-full bg-sage-50 border border-sage-200 mx-auto mb-4" />
          <h3 className="font-medium text-earth-900 mb-2">Adaptive Coaching</h3>
          <p className="text-earth-500 text-sm leading-relaxed">
            AI that listens. Your plan adjusts with your energy, sleep, and stress.
          </p>
        </div>
      </div>

      <p className="mt-20 text-earth-400 text-xs text-center max-w-md">
        This app is for informational purposes only. Please consult
        a physician before starting any diet or exercise program.
      </p>
    </main>
  );
}
