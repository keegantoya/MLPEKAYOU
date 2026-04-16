import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import logo from "../assets/avatars/mlpekayouwiki.png";

export default function AccountConfirmation() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
  setMessage("Account confirmed! Redirecting...");

  setTimeout(() => {
    navigate("/");
  }, 1500);
}, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-6 pt-14 pb-12 flex flex-col min-h-[240px]">
        
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-700 rounded-full shadow-lg px-5 py-2">
          <img src={logo} className="h-12" />
        </div>

        <div className="text-center mb-6 text-gray-700">
          <div className="text-lg font-semibold mb-2">
            Account Confirmation
          </div>

          <div className="text-sm text-gray-500">
            {message}
          </div>
        </div>

        <div className="flex justify-center">
          <button
  className="bg-yellow-400 text-black px-4 py-2 rounded-lg"
  disabled
>
  Please wait...
</button>
        </div>

      </div>
    </div>
  );
}