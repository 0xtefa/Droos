import { useAuthContext } from '../auth/AuthProvider';

export default function Dashboard() {
  const { user, logout } = useAuthContext();

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-wide text-indigo-200">Dashboard</div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}</h1>
          <p className="text-sm text-slate-300">Role: {user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-indigo-400 hover:text-indigo-100"
        >
          Sign out
        </button>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <p className="text-sm">Next steps: build course list, lecture pages, attendance, and quiz flows using the protected API.</p>
      </div>
    </div>
  );
}
