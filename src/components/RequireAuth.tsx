import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(undefined); // undefined = loading
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ⏳ Loading state (quick + minimal)
  if (user === undefined) {
    return null;
  }

  // 🔒 Not logged in → show modal instead of full page
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">

        {/* BACKDROP */}
        <div className="absolute inset-0 bg-black/50" />

        {/* MODAL */}
        <div className="relative bg-card rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center">
          <h2 className="text-lg font-semibold mb-2">
            You're not logged in
          </h2>

          <p className="text-sm text-muted-foreground mb-4">
            Log in to track your collection, trades, and ISO.
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // ✅ Logged in → show page
  return <>{children}</>;
}