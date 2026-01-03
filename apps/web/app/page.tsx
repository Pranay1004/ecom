export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">ESHANT</h1>
          <div className="space-x-6">
            <a href="#" className="text-sm text-slate-400 hover:text-white">
              About
            </a>
            <a href="#" className="text-sm text-slate-400 hover:text-white">
              Capabilities
            </a>
            <a href="/estimator" className="text-sm font-medium text-accent-500">
              Get Started →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-bold text-white">
          3D Manufacturing, Built for Precision
        </h2>
        <p className="mt-6 text-xl text-slate-400">
          Upload your geometry. Configure process. Know your cost. No guessing.
        </p>

        <div className="mt-12 space-x-4">
          <a
            href="/estimator"
            className="inline-block rounded-lg bg-accent-600 px-8 py-3 font-medium text-white hover:bg-accent-700"
          >
            Upload Your Part
          </a>
          <a
            href="#"
            className="inline-block rounded-lg border border-slate-600 px-8 py-3 font-medium text-slate-200 hover:border-slate-500"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <p className="text-2xl mb-2">⚙️</p>
            <h3 className="font-semibold text-white">Smart Feasibility</h3>
            <p className="mt-2 text-sm text-slate-400">
              Automated constraint checking prevents impossible orders before
              money is involved.
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <p className="text-2xl mb-2">💰</p>
            <h3 className="font-semibold text-white">Transparent Pricing</h3>
            <p className="mt-2 text-sm text-slate-400">
              See material, machine time, setup, finishing, and QA costs broken
              down clearly.
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <p className="text-2xl mb-2">📦</p>
            <h3 className="font-semibold text-white">Manufacturing Intent</h3>
            <p className="mt-2 text-sm text-slate-400">
              Process, material, tolerance, and finish decisions tied directly
              to outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h3 className="text-3xl font-bold text-white">
          Ready to manufacture?
        </h3>
        <p className="mt-4 text-slate-400">
          No account needed. Upload your part and see pricing in minutes.
        </p>
        <a
          href="/estimator"
          className="mt-8 inline-block rounded-lg bg-accent-600 px-8 py-3 font-medium text-white hover:bg-accent-700"
        >
          Start Now
        </a>
      </section>
    </main>
  );
}
