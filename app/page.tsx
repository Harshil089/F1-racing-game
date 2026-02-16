import RegistrationForm from '@/components/registration/RegistrationForm';

export default function HomePage() {
  return (
    <main className="min-h-screen f1-grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 slide-in">
          <h1 className="text-6xl font-bold mb-4 neon-glow-red">
            F1 REFLEX
          </h1>
          <h2 className="text-3xl font-bold mb-6 text-f1-neon">
            RACING
          </h2>
          <p className="text-gray-400 text-lg">
            Test your reaction time like a Formula 1 driver
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-f1-red rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-f1-red rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-f1-red rounded-full animate-pulse delay-200"></div>
            <div className="w-3 h-3 bg-f1-red rounded-full animate-pulse delay-300"></div>
            <div className="w-3 h-3 bg-f1-red rounded-full animate-pulse delay-500"></div>
          </div>
        </div>

        {/* Registration Form */}
        <RegistrationForm />

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm slide-in">
          <p>Mobile optimized • Touch to race • Best reaction wins</p>
        </div>
      </div>
    </main>
  );
}
