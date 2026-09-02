import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<
    Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | undefined
  >(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(session?.user ?? null);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (user === undefined) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#d4a900]" />
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            Checking your session...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFD54A]/20 text-2xl">
            🔒
          </div>
          <h2 className="mt-5 text-2xl font-bold text-zinc-950 dark:text-white">
            You’re not logged in
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            You need to log in before you can view this page. This content is protected to help prevent AI scraping.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 w-full rounded-xl bg-[#FFD54A] px-5 py-3 text-sm font-bold text-zinc-950 transition-colors hover:bg-[#f2c83e]"
          >
            Return to homepage
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}