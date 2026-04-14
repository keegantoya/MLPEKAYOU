import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function PasswordReset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery session detected");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully!");

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 border rounded w-96">
        <h1 className="text-xl font-bold mb-4">Reset Password</h1>

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && (
          <p className="mt-4 text-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}