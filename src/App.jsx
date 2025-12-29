import { useMemo } from 'react';
import { ArrowRight, BookOpen, Headphones, ShieldCheck } from './icons';
import './index.css';

const features = [
  {
    title: 'API-first LMS',
    body: 'Laravel 10 + Sanctum backend with courses, lectures, attendance, and quizzes.',
    icon: BookOpen,
  },
  {
    title: 'Audio-friendly lectures',
    body: 'Lectures support audio URLs so students can listen anywhere.',
    icon: Headphones,
  },
  {
    title: 'Secure tokens',
    body: 'Role-based policies keep instructor and student actions separated.',
    icon: ShieldCheck,
  },
];

function Feature({ title, body, Icon }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-lg shadow-slate-950/50">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{body}</p>
    </div>
  );
}

export default function App() {
  const heroLines = useMemo(
    () => [
      'Build courses and quizzes fast.',
      'Students can attend and submit from the SPA.',
      'React + Tailwind front-end, Laravel API back-end.',
    ],
    [],
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-14">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-lg font-semibold text-slate-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white">D</span>
          <div>
            <div>Droos</div>
            <div className="text-xs font-normal text-slate-400">React + Laravel LMS</div>
          </div>
        </div>
        <a
          className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-500/20"
          href="https://localhost:8000/api"
        >
          API Docs Soon <ArrowRight className="h-4 w-4" />
        </a>
      </header>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr,1fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
            Step 10 · Frontend bootstrapped
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
            Ship the SPA for the Droos learning platform.
          </h1>
          <p className="text-lg text-slate-300">
            Vite + React + Tailwind are set up. Next steps: wire auth, courses, lectures, attendance, and quizzes to the API.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-900/50 hover:bg-indigo-600">
              Start Dev Server
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-slate-500">
              Review API Routes
            </button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-2xl shadow-slate-950/60">
          <div className="grid grid-cols-1 gap-4">
            {features.map((f) => (
              <Feature key={f.title} title={f.title} body={f.body} Icon={f.icon} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {heroLines.map((line, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-200"
          >
            {line}
          </div>
        ))}
      </section>
    </main>
  );
}
