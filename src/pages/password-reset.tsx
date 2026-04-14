import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/avatars/mlpekayouwiki.png";
import { Button } from "@/components/ui/button";

export default function PasswordReset() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery session detected");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

      {/* Pink Glitter */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <span key={i} className={`glitter glitter-${i}`} />
        ))}
      </div>

      <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-6 pt-14 pb-12 flex flex-col min-h-[260px]">

        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-700 rounded-full shadow-lg px-5 py-2">
          <img src={logo} className="h-12" />
        </div>

        <div className="text-center mb-5 text-gray-700">
          <div className="text-lg font-semibold mb-2">
            Reset Your Password
          </div>

          <div className="text-sm text-gray-500">
            Enter your new password below.
          </div>
        </div>

        <input
          type="password"
          placeholder="New Password"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>

          <Button
            className="bg-yellow-400 text-black"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>

        {message && (
          <p className="mt-4 text-sm text-center text-gray-600">
            {message}
          </p>
        )}

      </div>

      <style>
        {`
.glitter {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #f9a8d4;
  border-radius: 50%;
  opacity: 0.9;
  animation: sparkle 3s infinite ease-in-out;
  box-shadow: 
    0 0 6px #f9a8d4,
    0 0 12px #f9a8d4,
    0 0 18px #fbcfe8;
}

.glitter:nth-child(odd) {
  width: 5px;
  height: 5px;
}

.glitter:nth-child(even) {
  width: 9px;
  height: 9px;
}

@keyframes sparkle {
  0% { opacity: 0; transform: scale(0.5) translateY(0px); }
  50% { opacity: 1; transform: scale(1.2) translateY(-6px); }
  100% { opacity: 0; transform: scale(0.5) translateY(0px); }
}
`}
      </style>

    </div>
  );
}