import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
interface CollectionCardProps {
  id: string;
  title: string;
  setName?: string;
  imageUrl: string;
  totalCards: number;
  collectedCards?: number;
  progress?: number;
  showProgress?: boolean;
}
const CollectionCard = ({
  id,
  title,
  setName,
  imageUrl,
  totalCards,
  collectedCards = 0,
  progress = 0,
  showProgress = true,
}: CollectionCardProps) => {
const navigate = useNavigate();
const [showAccessWarning, setShowAccessWarning] = useState(false);
const getLink = () => {
    switch (id) {
      case "1":
        return "/moon-one";
      case "2":
        return "/moon-two";
      case "5":
        return "/rainbow-one";
      case "3":
        return "/moon-three";
      case "4":
        return "/star-one";
      case "6":
      case "rainbow2":
        return "/rainbow-two";
      case "tcg":
        return "/fantasy-wonderland";
      case "friendshipsbegin":
        return "/friendships-begin";
      case "9":
        return "/promotional-cards";
      case "7":
        return "/fun-moments-one";
      case "8":
        return "/fun-moments-two";
      case "11":
        return "/fun-moments-three";
      case "12":
        return "/discord";
      case "OTHERMERCH":
        return "/leaping-ponies";
      default:
        return `/collection/${id}`;
    }
  };
const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
const { data } = await supabase.auth.getSession();
    if (!data.session) {
      e.preventDefault();
      setShowAccessWarning(true);
    }
  };
const safeProgress = Math.min(100, Math.max(0, progress));
  if (showAccessWarning) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
      <div className="w-full max-w-md border border-white/10 bg-[#151718] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,.4)] sm:p-6">
        <div className="flex h-12 w-12 items-center justify-center bg-[#FFD54A]/10 text-xl font-semibold text-[#FFE27A]">
          !
        </div>
        <h2 className="mt-5 text-2xl font-semibold">Account required</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base">
          You need to sign in or create an account before opening collection pages.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setShowAccessWarning(false)}
            className="border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="bg-[#FFD54A] px-4 py-3 text-sm font-semibold text-black hover:bg-[#FFE27A]"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
return (
  <Link
    to={getLink()}
    onClick={handleClick}
    className="group block overflow-hidden border border-black/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,.08)] dark:border-white/[0.08] dark:bg-[#151718] dark:shadow-none"
  >
    <div className="relative aspect-[1/1] overflow-hidden bg-zinc-100 dark:bg-[#0d0f10]">
      <img
        src={imageUrl}
        alt={title}
        draggable={false}
        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.015]"
      />
    </div>
    <div className="px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold leading-[1.15] text-zinc-950 dark:text-white">
            {title}
          </h2>
          {setName && (
            <div className="mt-0.5 text-xs font-medium leading-tight text-[#8a6a00] dark:text-[#FFE27A]">
              {setName}
            </div>
          )}
        </div>
        <span className="mt-0.5 shrink-0 text-sm leading-none text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-zinc-500">
          →
        </span>
      </div>
      {showProgress && (
        <div className="mt-1.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-zinc-500 dark:text-zinc-400">
              {collectedCards.toLocaleString()} of {totalCards.toLocaleString()} cards
            </span>
            <span className="shrink-0 font-semibold text-[#725700] dark:text-[#FFE27A]">
              {safeProgress}%
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden bg-zinc-200 dark:bg-white/[0.08]">
            <div
              className="h-full bg-[#FFD54A] transition-all duration-500"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  </Link>
);
};
export default CollectionCard;