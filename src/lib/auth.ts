import { supabase } from "@/lib/supabase";

export const handleAuthRedirect = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (data?.session) {
    console.log("User logged in:", data.session.user);
  }
};
