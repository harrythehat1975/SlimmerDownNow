import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = (await auth()) as any;

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Slim Down Now</h1>
        <p className="text-xl text-gray-600 mb-8">
          Get personalized daily diet and workout plans to reduce inches around your waist.
        </p>

        <div className="flex gap-4 justify-center">
          <a
            href="/signup"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started Free
          </a>
          <a
            href="/login"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Sign In
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-lg mb-2">Personalized Plans</h3>
            <p className="text-gray-600">
              Get customized daily diet and workout recommendations based on your goals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your waist reduction, weight changes, and adherence over time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Stay Adaptive</h3>
            <p className="text-gray-600">
              Your plan adjusts based on sleep, stress, and how you&apos;re feeling.
            </p>
          </div>
        </div>

        <div className="mt-12 text-gray-600 text-sm">
          <p className="mb-2">
            <strong>Disclaimer:</strong> This app is for informational purposes only. Always consult
            a physician before starting any diet or exercise program.
          </p>
        </div>
      </div>
    </main>
  );
}
