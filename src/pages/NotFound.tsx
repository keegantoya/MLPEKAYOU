import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4 py-8 font-['Oxanium'] text-zinc-900 transition-colors dark:bg-[#111214] dark:text-white">
      <main className="w-full max-w-lg overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#1c1c1e] dark:shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
        <div className="px-6 pb-7 pt-6 text-center sm:px-8 sm:pb-8 sm:pt-7">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-2xl font-bold text-zinc-700 dark:bg-white/[0.07] dark:text-zinc-200">
            404
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            The page you’re looking for doesn’t exist or may have moved.
          </p>
          <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-[#f5f5f7] px-4 py-3 text-left dark:bg-white/[0.05]">
            <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
              Requested route
            </div>
            <div className="mt-1 truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {location.pathname}
            </div>
          </div>
          <Link
            to="/"
            className="mx-auto mt-5 flex w-full max-w-sm items-center justify-center rounded-2xl bg-[#FFD54A] px-4 py-3.5 text-[15px] font-semibold text-zinc-900 transition hover:brightness-95 active:scale-[0.99]"
          >
            Return Home
          </Link>
        </div>
      </main>
    </div>
  );
};
export default NotFound;
